'use client';
import api from "../../lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery } from "@tanstack/react-query";

const fetchProfile = async (lang) => {
  const token = Cookies.get("token");

  const headers = { lang };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.get(`${API_BASE_URL}/v1/profile`, { headers });
  return response.data.items;
};

export const useGetProfile = (lang) => {
  return useQuery({
    queryKey: ["profile", lang],
    queryFn: () => fetchProfile(lang),
    enabled: !!Cookies.get("token"),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60,   // 1 minute
    retry: false,
  });
};
