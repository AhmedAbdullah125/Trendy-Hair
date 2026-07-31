'use client';
import api from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
    ApiEnvelope,
    ApiOrder,
    ApiPagination,
    OrdersQueryParams,
} from "@/lib/apiTypes";

/** `OrderEloquent::index` returns the rows under `data`, alongside `pagination`. */
interface OrdersPage {
    data: ApiOrder[];
    pagination: ApiPagination;
}

/**
 * Fetches orders from the API
 */
const fetchOrders = async (
    params: OrdersQueryParams,
    lang: string
): Promise<OrdersPage> => {
    const token = Cookies.get("token");

    const headers: Record<string, string> = {
        lang,
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    // Build query string
    const queryParams = new URLSearchParams();
    if (params.page_number) queryParams.append('page_number', String(params.page_number));
    if (params.page_size) queryParams.append('page_size', String(params.page_size));
    if (params.status) queryParams.append('status', params.status);
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.search) queryParams.append('search', params.search);

    try {
        const response = await api.get<ApiEnvelope<OrdersPage>>(
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
 */
export const useGetOrders = (
    params: OrdersQueryParams = {},
    lang: string = 'ar'
): UseQueryResult<OrdersPage> => {
    const defaultParams: OrdersQueryParams = {
        page_number: 1,
        page_size: 10,
        ...params,
    };

    return useQuery({
        queryKey: ["orders", defaultParams, lang],
        queryFn: () => fetchOrders(defaultParams, lang),
        enabled: !!Cookies.get("token"),
        staleTime: 1000 * 10, // 30 seconds
        gcTime: 1000 * 60, // 1 minute
    });
};
