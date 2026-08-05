'use client';
import api from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import type { QueryClient } from "@tanstack/react-query";
import type { ApiCreateOrderResult, ApiEnvelope, PaymentMethod } from "@/lib/apiTypes";
import type { CheckoutStep } from "../cart/types";
import { toast } from "sonner";

type CreateOrderResponse = ApiEnvelope<ApiCreateOrderResult>;

export const createOrder = async (
    formData: FormData,
    lang: string = 'ar',
    setStep: (step: CheckoutStep) => void,
    setloading: (loading: boolean) => void,
    qc?: QueryClient,
    paymentMethod: PaymentMethod = 'cash'
): Promise<CreateOrderResponse> => {
    setloading(true);
    const token = Cookies.get("token") || localStorage.getItem("token");

    const headers: Record<string, string> = {
        lang,
        'Content-Type': 'multipart/form-data'
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    /**
     * Everything the new order invalidates.
     *
     * `orders` was missing, which is why a just-placed order did not show up in
     * the order list: `useGetOrders` caches under `["orders", params, lang]`
     * with a 10s staleTime, so opening the list right after checkout served the
     * pre-order cache. The window is small, but it is exactly the one a customer
     * (and a tester) uses — place the order, then go look for it.
     */
    const invalidateAfterOrder = async () => {
        if (!qc) return;
        await Promise.all([
            qc.invalidateQueries({ queryKey: ["cart"] }),
            qc.invalidateQueries({ queryKey: ["profile"] }),
            qc.invalidateQueries({ queryKey: ["orders"] }),
        ]);
    };

    try {
        const response = await api.post<CreateOrderResponse>(`${API_BASE_URL}/v1/order`, formData, { headers });
        const data = response.data;
        const paymentUrl = data?.items?.payment_url;
        const isOnlinePayment = paymentMethod === 'visa' || paymentMethod === 'knet';

        if (isOnlinePayment && paymentUrl) {
            // Flush before handing off to the gateway — the app may be gone
            // from memory by the time it returns.
            await invalidateAfterOrder();
            setloading(false);
            window.location.href = paymentUrl;
        } else if (isOnlinePayment) {
            // Card/KNET was chosen but the gateway returned no URL — the order
            // exists and is unpaid. Falling through to the success screen (as
            // this used to) told the customer their payment had gone through
            // when nothing had been charged.
            await invalidateAfterOrder();
            setloading(false);
            toast.error('تعذّر بدء عملية الدفع. تم إنشاء الطلب ولم يتم الدفع — يمكنكِ إتمام الدفع من صفحة الطلبات.');
            throw new Error('payment_url_missing');
        } else {
            // Cash: go to success screen
            setStep("success");
            await invalidateAfterOrder();
            setloading(false);
        }

        return data;
    } catch (err) {
        setloading(false);
        throw err;
    }
};
