'use client';
import api from "../../lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiEnvelope, ApiGovernoratesLookup } from "@/lib/apiTypes";

const fetchGovernorates = async (lang: string): Promise<ApiGovernoratesLookup> => {
  const token = Cookies.get("token");

  const headers: Record<string, string> = { lang };
  if (token) headers.Authorization = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("slug", "governorates");

  const response = await api.post<ApiEnvelope<ApiGovernoratesLookup>>(
    `${API_BASE_URL}/v1/lookups`,
    formData,
    { headers }
  );

  return response.data.items;
};

export const useGetGovernorates = (lang: string): UseQueryResult<ApiGovernoratesLookup> =>
  useQuery({
    queryKey: ["governorates", lang],
    queryFn: () => fetchGovernorates(lang),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });
