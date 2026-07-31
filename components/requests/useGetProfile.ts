'use client';
import api from "../../lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiEnvelope, ApiProfile } from "@/lib/apiTypes";

const fetchProfile = async (lang: string): Promise<ApiProfile> => {
  const token = Cookies.get("token");

  const headers: Record<string, string> = { lang };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.get<ApiEnvelope<ApiProfile>>(`${API_BASE_URL}/v1/profile`, { headers });
  return response.data.items;
};

export const useGetProfile = (lang: string): UseQueryResult<ApiProfile> => {
  return useQuery({
    queryKey: ["profile", lang],
    queryFn: () => fetchProfile(lang),
    enabled: !!Cookies.get("token"),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60,   // 1 minute
    retry: false,
  });
};
