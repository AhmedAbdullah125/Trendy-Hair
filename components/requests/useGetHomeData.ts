'use client';
import api from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiEnvelope, ApiHomeData } from "@/lib/apiTypes";

const fetchHomeData = async (lang: string): Promise<ApiHomeData> => {
  const token = Cookies.get("token");
  const headers: Record<string, string> = {
    lang: lang,
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.post<ApiEnvelope<ApiHomeData>>(
    `${API_BASE_URL}/v1/home`,
    {},
    { headers }
  );
  return response.data.items;
};

export const useGetHomeData = (lang: string = 'ar'): UseQueryResult<ApiHomeData> =>
  useQuery({
    queryKey: ["home", lang],
    queryFn: () => fetchHomeData(lang),
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 60,  // 1 hour
  });
