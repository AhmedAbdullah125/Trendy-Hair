'use client';
import api from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiEnvelope, ApiProductsPage } from "@/lib/apiTypes";

/** This hook resolves to the full envelope, not just `items`. */
type ProductsSearchResponse = ApiEnvelope<ApiProductsPage>;

/** Subset of react-query options the call sites override. */
export interface UseGetProductsOptions {
  enabled?: boolean;
}

const fetchProducts = async (
  lang: string,
  page: number,
  search: string = '',
  is_recently: boolean = false
): Promise<ProductsSearchResponse> => {
  const token = Cookies.get("token");

  const formData = new FormData();
  formData.append("page_size", String(10));
  formData.append("page_number", String(page));

  if (search) {
    formData.append("keyword", search);
  }

  if (is_recently) {
    formData.append("is_recently", String(1));
  }

  const headers: Record<string, string> = {
    lang: lang,
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.post<ProductsSearchResponse>(
    `${API_BASE_URL}/v1/products/index`,
    formData,
    { headers }
  );
  return response.data;
};

export const useGetProducts = (
  lang: string,
  page: number,
  search: string,
  is_recently: boolean,
  options: UseGetProductsOptions = {}
): UseQueryResult<ProductsSearchResponse> =>
  useQuery({
    queryKey: ["products", lang, page, search, is_recently],
    queryFn: () => fetchProducts(lang, page, search, is_recently),
    ...options,
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 60,  // 1 hour
  });
