'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery } from "@tanstack/react-query";

const fetchProducts = async (lang, page, brandId) => {
  const token = Cookies.get("token");

  const formData = new FormData();
  formData.append("page_size", 10);
  formData.append("page_number", page);

  const headers = { lang };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await axios.post(
    `${API_BASE_URL}/v1/products/by-brand/${brandId}`,
    formData,
    { headers }
  );

  return response.data.items; // ✅ { products, pagination }
};

export const useGetProductsByBrand = (lang, page, brandId) =>
  useQuery({
    queryKey: ["productsByBrand", lang, page, brandId],
    queryFn: () => fetchProducts(lang, page, brandId),
    enabled: !!brandId, // مهم
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });