'use client';
import api from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiEnvelope, ApiProductsPage } from "@/lib/apiTypes";

const fetchProducts = async (
  lang: string,
  page: number,
  categoryId: string
): Promise<ApiProductsPage> => {
  const token = Cookies.get("token");
  const formData = new FormData();
  formData.append("page_size", String(10));
  formData.append("page_number", String(page));
  const headers: Record<string, string> = {
    lang: lang,
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.post<ApiEnvelope<ApiProductsPage>>(
    `${API_BASE_URL}/v1/products/by-category/${categoryId}`,
    formData,
    { headers }
  );
  return response.data.items;
};

export const useGetProductsByCategory = (
  lang: string,
  page: number,
  categoryId: string
): UseQueryResult<ApiProductsPage> =>
  useQuery({
    queryKey: ["productsbycategory", lang, page, categoryId],
    queryFn: () => fetchProducts(lang, page, categoryId),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 60,  // 1 hour
  });
