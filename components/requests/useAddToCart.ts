"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/lib/apiConfig";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type AddToCartArgs = {
    product_id: number;
    quantity: number;
    lang: string;
};

export const useAddToCart = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ product_id, quantity, lang }: AddToCartArgs) => {
            const token = Cookies.get("token");
            const headers: Record<string, string> = { lang };
            if (token) headers.Authorization = `Bearer ${token}`;

            const formData = new FormData();
            formData.append("product_id", String(product_id));
            formData.append("quantity", String(quantity));

            const res = await axios.post(`${API_BASE_URL}/cart/add-items`, formData, { headers });
            return res.data;
        },

        onSuccess: async (data) => {
            const ok = !!data?.status;
            const message = data?.message || (ok ? "تمت الإضافة" : "حدث خطأ");

            toast(message, {
                style: {
                    background: ok ? "#1B8354" : "#dc3545",
                    color: "#fff",
                    borderRadius: "10px",
                    boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
                },
            });

            // ✅ Update badge + cart list
            await qc.invalidateQueries({ queryKey: ["cart"] });
        },

        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ";
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
