"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/lib/apiConfig";
import { useQuery } from "@tanstack/react-query";

export type ApiCartItem = {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  discounted_price: number;
  total_price: number;
  products: {
    id: number;
    name: string;
    sku?: string;
    description?: string;
    main_image: string;
    price: number;
    discounted_price?: number;
    current_price?: number;
    has_discount?: boolean;
    in_stock?: boolean;
    is_favorite?: boolean;
    is_active?: boolean;
  };
  created_at: string;
  updated_at: string;
};

export type CartApiResponse = {
  status: boolean;
  statusCode: number;
  message: string;
  items: {
    id: number;
    user_id: number;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    shipping_amount: number;
    total_amount: number;
    is_empty: boolean;
    total_items: number;
    items: ApiCartItem[];
    item_counts?: { total: number; unique: number };
    created_at: string;
    updated_at: string;
  };
};

const fetchCart = async (lang: string) => {
  const token = Cookies.get("token");
  const headers: Record<string, string> = { lang };
  if (token) headers.Authorization = `Bearer ${token}`;

  // ✅ GET بدون FormData
  const res = await axios.get<CartApiResponse>(`${API_BASE_URL}/v1/cart`, { headers });
  return res.data;
};

export const useGetCart = (lang: string) =>
  useQuery({
    queryKey: ["cart", lang],
    queryFn: () => fetchCart(lang),
    staleTime: 1000 * 5,
    gcTime: 1000 * 60 * 30,
  });
