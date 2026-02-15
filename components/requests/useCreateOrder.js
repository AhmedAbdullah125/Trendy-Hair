'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";

export const createOrder = async (formData, lang = 'ar') => {
    const token = Cookies.get("token") || localStorage.getItem("token");

    const headers = {
        lang,
        'Content-Type': 'multipart/form-data'
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    try {
        const response = await axios.post(`${API_BASE_URL}/v1/order`, formData, { headers });
        return response.data;
    } catch (err) {
        throw err;
    }
};
