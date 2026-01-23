'use client';
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/apiConfig";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";


class UnauthorizedError extends Error {
  isUnauthorized = true;
  data;
  constructor(data) {
    super("unauthorized");
    this.name = "UnauthorizedError";
    this.data = data;
  }
}
const handleLogout = () => {
  Cookies.remove('token');
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('userId');
  localStorage.removeItem('user');
  window.location.href = '/';
};
const fetchProfile = async (lang) => {
  const token = Cookies.get("token");

  const headers = {
    lang,
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await axios.get(`${API_BASE_URL}/profile`, { headers });

    // ✅ API returns unauthorized inside JSON
    if (response?.data?.statusCode === 401) {
      throw new UnauthorizedError(response.data);
    }

    return response.data.items;
  } catch (err) {
    // ✅ Also handle real 401
    const status = err?.response?.status;
    const key = err?.response?.statusCode;

    if (status === 401 || key === 401) {
      throw new UnauthorizedError(err?.response?.data);
    }

    throw err;
  }
};

let redirecting = false;

export const useGetProfile = (lang) => {
  const query = useQuery({
    queryKey: ["profile", lang],
    queryFn: () => fetchProfile(lang),
    //disable if not token
    enabled: !!Cookies.get("token"),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60, // 1 minute
    retry: (failureCount, error) => {
      if (error?.isUnauthorized) return false;
      return failureCount < 3;
    },
  });
  useEffect(() => {
    if (query.error && (query.error)?.isUnauthorized && !redirecting) {
      redirecting = true;
      handleLogout();
    }
  }, [query.error]);

  return query;
};
