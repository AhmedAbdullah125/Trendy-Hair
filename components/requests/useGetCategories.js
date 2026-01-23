'use client';
import axios from "axios";
// import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery } from "@tanstack/react-query";

const fetchCategories = async (lang) => {
  // const token = Cookies.get("token");
  console.log(lang);

  const formData = new FormData();
  formData.append("slug", "categories");
  const headers = {
    lang: lang,
  };

  // if (token) headers.Authorization = `Bearer ${token}`;

  const response = await axios.post(`${API_BASE_URL}/lookups`, formData, { headers });
  return response.data.items.categories;
};

export const useGetCategories = (lang = 'ar') =>
  useQuery({
    queryKey: ["categories", lang],
    queryFn: () => fetchCategories(lang),
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 60,  // 1 hour
  });
