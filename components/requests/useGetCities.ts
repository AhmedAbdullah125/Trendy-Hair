'use client';
import api from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiCitiesLookup, ApiEnvelope } from "@/lib/apiTypes";

const fetchCities = async (lang: string, governorateId: string): Promise<ApiCitiesLookup> => {
  const token = Cookies.get("token");

  const headers: Record<string, string> = { lang };
  if (token) headers.Authorization = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("slug", "cities");
  formData.append("governorate_id", governorateId);


  const response = await api.post<ApiEnvelope<ApiCitiesLookup>>(
    `${API_BASE_URL}/v1/lookups`,
    formData,
    { headers }
  );
  if (response.data.items.cities.length === 0) {
    toast.error("لا توجد مناطق في هذه المحافظة");
  }
  return response.data.items;
};

export const useGetCities = (
  lang: string,
  governorateId: string
): UseQueryResult<ApiCitiesLookup> =>
  useQuery({
    queryKey: ["cities", lang, governorateId],
    queryFn: () => fetchCities(lang, governorateId),
    enabled: !!governorateId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });
