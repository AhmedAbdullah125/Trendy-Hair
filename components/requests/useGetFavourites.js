'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery } from "@tanstack/react-query";

const fetchFavourites = async (lang, page) => {
  const token = Cookies.get("token");

  const formData = new FormData();
  formData.append("page_size", 10);
  formData.append("page_number", page);

  const headers = { lang };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await axios.post(
    `${API_BASE_URL}/products/favorites`,
    formData,
    { headers }
  );

  return response.data.items; // ✅ { products, pagination }
};

export const useGetFavourites = (lang, page) =>
  useQuery({
    queryKey: ["favourites", lang, page],
    queryFn: () => fetchFavourites(lang, page),
    staleTime: 1000 * 5, // 5 seconds
    gcTime: 1000 * 60 * 60, // 1 hour
  });