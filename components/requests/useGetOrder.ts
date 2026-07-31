'use client';
import api from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiEnvelope, ApiOrder } from "@/lib/apiTypes";

/**
 * Fetches a single order by ID from the API
 */
const fetchOrderById = async (orderId: number, lang: string): Promise<ApiOrder> => {
    const token = Cookies.get("token");

    const headers: Record<string, string> = {
        lang,
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    try {
        const response = await api.get<ApiEnvelope<ApiOrder>>(
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
 */
export const useGetOrder = (
    orderId: number,
    lang: string = 'ar'
): UseQueryResult<ApiOrder> => {
    return useQuery({
        queryKey: ["order", orderId, lang],
        queryFn: () => fetchOrderById(orderId, lang),
        enabled: !!orderId && !!Cookies.get("token"),
        staleTime: 1000 * 10, // 10 seconds
        gcTime: 1000 * 60, // 1 minute
    });
};
