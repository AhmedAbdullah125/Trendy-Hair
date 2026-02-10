'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery } from "@tanstack/react-query";

const fetchProducts = async (lang, page, search = '', is_recently = false) => {
  const token = Cookies.get("token");
  console.log(lang);

  const formData = new FormData();
  formData.append("page_size", 10);
  formData.append("page_number", page);
  if (search) {
    formData.append("search", search);
  }
  if (is_recently) {
    formData.append("is_recently", 1);
  }
  const headers = {
    lang: lang,
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await axios.post(`${API_BASE_URL}/v1/products/index`, formData, { headers });
  return response.data.items;
};

export const useGetProducts = (lang, page, search, is_recently) =>
  useQuery({
    queryKey: ["products", lang, page, search, is_recently],
    queryFn: () => fetchProducts(lang, page, search, is_recently),
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 60,  // 1 hour
  });
