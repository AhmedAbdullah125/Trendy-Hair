'use client';
import api from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiEnvelope, ApiReviewsPage } from "@/lib/apiTypes";

const fetchReviews = async (
  lang: string,
  page: number,
  pageSize: number
): Promise<ApiReviewsPage> => {
  const token = Cookies.get("token");
  const formData = new FormData();
  formData.append("page_number", String(page));
  formData.append("page_size", String(pageSize));
  const headers: Record<string, string> = {
    lang: lang,
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.post<ApiEnvelope<ApiReviewsPage>>(
    `${API_BASE_URL}/v1/reviews`,
    formData,
    { headers }
  );
  return response.data.items;
};

export const useGetReviews = (
  lang: string = 'ar',
  page: number = 1,
  pageSize: number = 10
): UseQueryResult<ApiReviewsPage> =>
  useQuery({
    queryKey: ["reviews", lang, page, pageSize],
    queryFn: () => fetchReviews(lang, page, pageSize),
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 60,  // 1 hour
  });
