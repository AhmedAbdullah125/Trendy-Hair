'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery } from "@tanstack/react-query";

const fetchReviews = async (lang, page, pageSize) => {
  const token = Cookies.get("token");
  const formData = new FormData();
  formData.append("page_number", page);
  formData.append("page_size", pageSize);
  const headers = {
    lang: lang,
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await axios.post(`${API_BASE_URL}/reviews`, formData, { headers });
  return response.data.items;
};

export const useGetReviews = (lang = 'ar', page = 1, pageSize = 10) =>
  useQuery({
    queryKey: ["reviews", lang, page, pageSize],
    queryFn: () => fetchReviews(lang, page, pageSize),
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 60,  // 1 hour
  }); 
