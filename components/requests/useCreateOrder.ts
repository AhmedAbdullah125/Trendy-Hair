'use client';
import api from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import type { QueryClient } from "@tanstack/react-query";
import type { ApiCreateOrderResult, ApiEnvelope, PaymentMethod } from "@/lib/apiTypes";
import type { CheckoutStep } from "../cart/types";

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

    try {
        const response = await api.post<CreateOrderResponse>(`${API_BASE_URL}/v1/order`, formData, { headers });
        const data = response.data;
        const paymentUrl = data?.items?.payment_url;
        const isOnlinePayment = paymentMethod === 'visa' || paymentMethod === 'knet';

        if (isOnlinePayment && paymentUrl) {
            // Invalidate cart + profile (wallet) before redirecting to payment gateway
            if (qc) {
                await qc.invalidateQueries({ queryKey: ["cart"] });
                await qc.invalidateQueries({ queryKey: ["profile"] });
            }
            setloading(false);
            window.location.href = paymentUrl;
        } else {
            // Cash: go to success screen
            setStep("success");
            if (qc) {
                await qc.invalidateQueries({ queryKey: ["cart"] });
                await qc.invalidateQueries({ queryKey: ["profile"] });
            }
            setloading(false);
        }

        return data;
    } catch (err) {
        setloading(false);
        throw err;
    }
};
