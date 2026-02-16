'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchCities = async (lang, governorateId) => {
  const token = Cookies.get("token");

  const headers = { lang };
  if (token) headers.Authorization = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("slug", "cities");
  formData.append("governorate_id", governorateId);


  const response = await axios.post(
    `${API_BASE_URL}/v1/lookups`,
    formData,
    { headers }
  );
  if (response.data.items.cities.length === 0) {
    toast.error("لا توجد مناطق في هذه المحافظة");
  }
  return response.data.items;
};

export const useGetCities = (lang, governorateId) =>
  useQuery({
    queryKey: ["cities", lang, governorateId],
    queryFn: () => fetchCities(lang, governorateId),
    enabled: !!governorateId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });