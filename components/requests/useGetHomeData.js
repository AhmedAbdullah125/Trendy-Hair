'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery } from "@tanstack/react-query";

const fetchHomeData = async (lang) => {
  const token = Cookies.get("token");
  const headers = {
    lang: lang,
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await axios.post(`${API_BASE_URL}/home`, {}, { headers });
  return response.data.items;
};

export const useGetHomeData = (lang = 'ar') =>
  useQuery({
    queryKey: ["home", lang],
    queryFn: () => fetchHomeData(lang),
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 60,  // 1 hour
  });
