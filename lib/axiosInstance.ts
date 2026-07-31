import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import type { ApiErrorBody } from './apiTypes';

/**
 * Clears all auth tokens and redirects to the login page.
 * Safe to call multiple times – a guard prevents duplicate redirects.
 */
let isRedirecting = false;

export function handleUnauthorized(): void {
  if (isRedirecting) return;
  isRedirecting = true;

  // Clear every place tokens are stored
  Cookies.remove('token');
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('userId');
  localStorage.removeItem('user');

  window.location.href = '/login';
}

/** Shared Axios instance used by every request in the app. */
const api: AxiosInstance = axios.create();

// ── Response interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse<ApiErrorBody>) => {
    // The API sometimes returns HTTP 200 but with statusCode 401 in the JSON body
    if (response?.data?.statusCode === 401) {
      handleUnauthorized();
      // Reject so callers treat this as an error (prevents stale data being used)
      return Promise.reject(new Error(response?.data?.message || 'Unauthorized'));
    }
    return response;
  },
  (error: AxiosError<ApiErrorBody>) => {
    // Real HTTP 401 response
    const status = error?.response?.status;
    if (status === 401) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
