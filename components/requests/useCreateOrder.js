'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { toast } from "sonner";

export const createOrder = async (formData, lang = 'ar', setStep, setloading) => {
    setloading(true);
    const token = Cookies.get("token") || localStorage.getItem("token");

    const headers = {
        lang,
        'Content-Type': 'multipart/form-data'
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    try {
        const response = await axios.post(`${API_BASE_URL}/v1/order`, formData, { headers });
        toast.success(response.data.message);
        setStep("success");
        setloading(false);
        return response.data;
    } catch (err) {
        setloading(false);
        throw err;
    }
};
