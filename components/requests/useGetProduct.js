'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery } from "@tanstack/react-query";

const fetchProduct = async (lang, productId) => {
  const token = Cookies.get("token");

  const headers = { lang };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await axios.get(
    `${API_BASE_URL}/v1/products/${productId}`,
    { headers }
  );

  return response.data.items;
};

export const useGetProduct = (lang, productId) =>
  useQuery({
    queryKey: ["product", lang, productId],
    queryFn: () => fetchProduct(lang, productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });