'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery } from "@tanstack/react-query";

const fetchGovernorates = async (lang) => {
  const token = Cookies.get("token");

  const headers = { lang };
  if (token) headers.Authorization = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("slug", "governorates");

  const response = await axios.post(
    `${API_BASE_URL}/v1/lookups`,
    formData,
    { headers }
  );

  return response.data.items;
};

export const useGetGovernorates = (lang) =>
  useQuery({
    queryKey: ["governorates", lang],
    queryFn: () => fetchGovernorates(lang),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });