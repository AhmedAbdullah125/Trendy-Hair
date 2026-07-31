'use client';
import api from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiEnvelope, ApiProductsPage } from "@/lib/apiTypes";

const fetchProducts = async (
  lang: string,
  page: number,
  brandId: string
): Promise<ApiProductsPage> => {
  const token = Cookies.get("token");

  const formData = new FormData();
  formData.append("page_size", String(10));
  formData.append("page_number", String(page));

  const headers: Record<string, string> = { lang };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.post<ApiEnvelope<ApiProductsPage>>(
    `${API_BASE_URL}/v1/products/by-brand/${brandId}`,
    formData,
    { headers }
  );

  return response.data.items; // ✅ { products, pagination }
};

export const useGetProductsByBrand = (
  lang: string,
  page: number,
  brandId: string
): UseQueryResult<ApiProductsPage> =>
  useQuery({
    queryKey: ["productsByBrand", lang, page, brandId],
    queryFn: () => fetchProducts(lang, page, brandId),
    enabled: !!brandId, // مهم
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });
