import api from '@/lib/axiosInstance';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import type { ApiEnvelope } from '@/lib/apiTypes';
import { getApiErrorMessage } from '@/lib/apiTypes';
import type { SetLoading } from './loginRequest';

export async function toggleFavourite(
    id: number,
    setLoading: SetLoading,
    lang: string
): Promise<boolean> {
    setLoading(true)
    const url = `${API_BASE_URL}/v1/products/toggle-favorite/${id}`;
    const headers: Record<string, string> = { 'lang': lang }
    const token = Cookies.get("token");
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
        const response = await api.post<ApiEnvelope<unknown>>(url, {}, { headers });
        const message = response?.data?.message;

        setLoading(false)
        if (response.data.status) {
            toast(message, {
                style: {
                    background: "#1B8354",
                    color: "#fff",
                    borderRadius: "10px",
                    boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
                },
            });
            return true;
        }
        else {
            toast(message, {
                style: {
                    background: "#dc3545",
                    color: "#fff",
                    borderRadius: "10px",
                    boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
                },
            });
            return false;
        }
    } catch (error) {
        setLoading(false);
        const errorMessage = getApiErrorMessage(error);
        toast(errorMessage, {
            style: {
                background: "#dc3545",
                color: "#fff",
                borderRadius: "10px",
                boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
            },
        });
        return false;
    }
}
