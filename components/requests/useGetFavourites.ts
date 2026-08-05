'use client';
import api from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiEnvelope, ApiProductsPage } from "@/lib/apiTypes";

const getAuthToken = () => Cookies.get("token") || localStorage.getItem("token") || "";

const fetchFavourites = async (lang: string, page: number): Promise<ApiProductsPage> => {
  const token = getAuthToken();

  const formData = new FormData();
  formData.append("page_size", String(10));
  formData.append("page_number", String(page));

  const headers: Record<string, string> = { lang };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.post<ApiEnvelope<ApiProductsPage>>(
    `${API_BASE_URL}/v1/products/favorites`,
    formData,
    { headers }
  );

  return response.data.items; // ✅ { products, pagination }
};

export const useGetFavourites = (
  lang: string,
  page: number
): UseQueryResult<ApiProductsPage> => {
  const token = getAuthToken();
  return useQuery({
    queryKey: ["favourites", lang, page, token],
    queryFn: () => fetchFavourites(lang, page),
    enabled: !!token,
    staleTime: 1000 * 5, // 5 seconds
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};
