'use client';
import api from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiEnvelope, ApiProduct } from "@/lib/apiTypes";

const fetchProduct = async (lang: string, productId: string): Promise<ApiProduct> => {
  const token = Cookies.get("token");

  const headers: Record<string, string> = { lang };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.get<ApiEnvelope<ApiProduct>>(
    `${API_BASE_URL}/v1/products/${productId}`,
    { headers }
  );

  return response.data.items;
};

export const useGetProduct = (
  lang: string,
  productId: string
): UseQueryResult<ApiProduct> =>
  useQuery({
    queryKey: ["product", lang, productId],
    queryFn: () => fetchProduct(lang, productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });
