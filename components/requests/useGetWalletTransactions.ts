'use client';
import api from "../../lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiEnvelope } from "@/lib/apiTypes";

export interface ApiWalletTransaction {
    id: number;
    /** Raw key, e.g. "competition_prize_stage_3", "payment_order". */
    action: string;
    /** Signed: positive credited, negative spent. */
    amount: number;
    /** Balance immediately after this transaction. */
    balance: number;
    direction: 'credit' | 'debit';
    created_at: string;
}

interface WalletTransactionsPayload {
    transactions: ApiWalletTransaction[];
    pagination: {
        current_page: number;
        total_pages: number;
        total_items: number;
        page_size: number;
    };
}

const getAuthToken = () => Cookies.get("token") || localStorage.getItem("token") || "";

const fetchWalletTransactions = async (lang: string): Promise<WalletTransactionsPayload> => {
    const token = getAuthToken();

    const headers: Record<string, string> = { lang };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await api.get<ApiEnvelope<WalletTransactionsPayload>>(
        `${API_BASE_URL}/v1/wallet-transactions`,
        { headers }
    );

    return response.data.items;
};

/**
 * The signed-in customer's real wallet ledger.
 *
 * The wallet screen used to render a hardcoded DEMO array, so the history bore
 * no relation to the balance shown above it.
 */
export const useGetWalletTransactions = (lang: string): UseQueryResult<WalletTransactionsPayload> => {
    const token = getAuthToken();
    return useQuery({
        queryKey: ["wallet-transactions", lang, token],
        queryFn: () => fetchWalletTransactions(lang),
        enabled: !!token,
        staleTime: 1000 * 30,
        retry: false,
    });
};
