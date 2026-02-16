'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches orders from the API
 * @param {Object} params - Query parameters
 * @param {number} params.page_number - Page number (default: 1)
 * @param {number} params.page_size - Page size (default: 10)
 * @param {string} params.status - Order status filter (optional)
 * @param {string} params.from - Start date filter (optional)
 * @param {string} params.to - End date filter (optional)
 * @param {string} params.search - Search query (optional)
 * @param {string} lang - Language code
 */
const fetchOrders = async (params, lang) => {
    const token = Cookies.get("token");

    const headers = {
        lang,
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    // Build query string
    const queryParams = new URLSearchParams();
    if (params.page_number) queryParams.append('page_number', params.page_number);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    if (params.status) queryParams.append('status', params.status);
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.search) queryParams.append('search', params.search);

    try {
        const response = await axios.get(
            `${API_BASE_URL}/v1/order?${queryParams.toString()}`,
            { headers }
        );

        return response.data.items;
    } catch (err) {
        console.error('Error fetching orders:', err);
        throw err;
    }
};

/**
 * Hook to fetch orders with pagination and filters
 * @param {Object} params - Query parameters
 * @param {string} lang - Language code
 */
export const useGetOrders = (params = {}, lang = 'ar') => {
    const defaultParams = {
        page_number: 1,
        page_size: 10,
        ...params,
    };

    return useQuery({
        queryKey: ["orders", defaultParams, lang],
        queryFn: () => fetchOrders(defaultParams, lang),
        enabled: !!Cookies.get("token"),
        staleTime: 1000 * 30, // 30 seconds
        gcTime: 1000 * 60, // 1 minute
    });
};
