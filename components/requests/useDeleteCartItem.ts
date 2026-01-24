"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/lib/apiConfig";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type DeleteCartArgs = {
    cartItemId: number;
    clear_all?: boolean;
    lang: string;
};

export const useDeleteCartItem = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ cartItemId, clear_all, lang }: DeleteCartArgs) => {
            const token = Cookies.get("token");
            const headers: Record<string, string> = { lang };
            if (token) headers.Authorization = `Bearer ${token}`;

            const formData = new FormData();
            if (clear_all) formData.append("clear_all", "true");

            const res = await axios.delete(`${API_BASE_URL}/cart/items/${cartItemId}`, {
                headers,
                data: formData,
            });

            return res.data;
        },

        onSuccess: async (data) => {
            const ok = !!data?.status;
            const message = data?.message || (ok ? "تم الحذف" : "حدث خطأ");

            toast(message, {
                style: {
                    background: ok ? "#1B8354" : "#dc3545",
                    color: "#fff",
                    borderRadius: "10px",
                    boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
                },
            });

            await qc.invalidateQueries({ queryKey: ["cart"] });
        },

        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message || error?.message || "حدث خطأ";

            toast(errorMessage, {
                style: {
                    background: "#dc3545",
                    color: "#fff",
                    borderRadius: "10px",
                    boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
                },
            });
        },
    });
};
