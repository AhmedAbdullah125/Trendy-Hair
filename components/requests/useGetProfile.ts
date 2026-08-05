'use client';
import api from "../../lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiEnvelope, ApiProfile } from "@/lib/apiTypes";

const getAuthToken = () => Cookies.get("token") || localStorage.getItem("token") || "";

const fetchProfile = async (lang: string): Promise<ApiProfile> => {
  const token = getAuthToken();

  const headers: Record<string, string> = { lang };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.get<ApiEnvelope<ApiProfile>>(`${API_BASE_URL}/v1/profile`, { headers });
  return response.data.items;
};

export const useGetProfile = (lang: string): UseQueryResult<ApiProfile> => {
  const token = getAuthToken();
  return useQuery({
    queryKey: ["profile", lang, token],
    queryFn: () => fetchProfile(lang),
    enabled: !!token,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60,   // 1 minute
    retry: false,
  });
};
