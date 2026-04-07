'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";

export const createOrder = async (formData, lang = 'ar', setStep, setloading, qc, paymentMethod = 'cash') => {
    setloading(true);
    const token = Cookies.get("token") || localStorage.getItem("token");

    const headers = {
        lang,
        'Content-Type': 'multipart/form-data'
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    try {
        const response = await axios.post(`${API_BASE_URL}/v1/order`, formData, { headers });
        const data = response.data;
        const paymentUrl = data?.items?.payment_url;
        const isOnlinePayment = paymentMethod === 'visa' || paymentMethod === 'knet';

        if (isOnlinePayment && paymentUrl) {
            // Invalidate cart before redirecting to payment gateway
            if (qc) await qc.invalidateQueries({ queryKey: ["cart"] });
            setloading(false);
            window.location.href = paymentUrl;
        } else {
            // Cash: go to success screen
            setStep("success");
            if (qc) await qc.invalidateQueries({ queryKey: ["cart"] });
            setloading(false);
        }

        return data;
    } catch (err) {
        setloading(false);
        throw err;
    }
};
