'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery } from "@tanstack/react-query";

const fetchProducts = async (lang, page, categoryId) => {
  const token = Cookies.get("token");
  const formData = new FormData();
  formData.append("page_size", 10);
  formData.append("page_number", page);
  const headers = {
    lang: lang,
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await axios.post(`${API_BASE_URL}/products/by-category/${categoryId}`, formData, { headers });
  return response.data.items;
};

export const useGetProductsByCategory = (lang, page, categoryId) =>
  useQuery({
    queryKey: ["productsbycategory", lang, page, categoryId],
    queryFn: () => fetchProducts(lang, page, categoryId),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 60,  // 1 hour
  });
