'use client';
import api from "@/lib/axiosInstance";
// import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiCategoriesLookup, ApiCategory, ApiEnvelope } from "@/lib/apiTypes";

const fetchCategories = async (lang: string): Promise<ApiCategory[]> => {
  const formData = new FormData();
  formData.append("slug", "categories");
  const headers: Record<string, string> = {
    lang: lang,
  };

  const response = await api.post<ApiEnvelope<ApiCategoriesLookup>>(
    `${API_BASE_URL}/v1/lookups`,
    formData,
    { headers }
  );
  return response.data.items.categories;
};

export const useGetCategories = (lang: string = 'ar'): UseQueryResult<ApiCategory[]> =>
  useQuery({
    queryKey: ["categories", lang],
    queryFn: () => fetchCategories(lang),
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 60,  // 1 hour
  });
