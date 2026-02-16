'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches a single order by ID from the API
 * @param {number} orderId - Order ID
 * @param {string} lang - Language code
 */
const fetchOrderById = async (orderId, lang) => {
    const token = Cookies.get("token");

    const headers = {
        lang,
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    try {
        const response = await axios.get(
            `${API_BASE_URL}/v1/order/${orderId}`,
            { headers }
        );

        return response.data.items;
    } catch (err) {
        console.error('Error fetching order:', err);
        throw err;
    }
};

/**
 * Hook to fetch a single order by ID
 * @param {number} orderId - Order ID
 * @param {string} lang - Language code
 */
export const useGetOrder = (orderId, lang = 'ar') => {
    return useQuery({
        queryKey: ["order", orderId, lang],
        queryFn: () => fetchOrderById(orderId, lang),
        enabled: !!orderId && !!Cookies.get("token"),
        staleTime: 1000 * 30, // 30 seconds
        gcTime: 1000 * 60, // 1 minute
    });
};
