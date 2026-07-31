import api from '@/lib/axiosInstance';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';
import type { ApiAuthPayload, ApiEnvelope } from '@/lib/apiTypes';
import { getApiErrorMessage } from '@/lib/apiTypes';

export interface LoginCredentials {
    phone: string;
    password: string;
}

/** Minimal router surface used here — `AuthScreen` passes a `useNavigate` adapter. */
export interface RouterLike {
    push: (path: string) => void;
}

export type SetLoading = (loading: boolean) => void;

export async function loginRequest(
    data: LoginCredentials,
    setLoading: SetLoading,
    lang: string,
    router: RouterLike
): Promise<void> {
    setLoading(true)
    const url = `${API_BASE_URL}/v1/login`;
    const formData = new FormData();
    formData.append('phone', data.phone);
    formData.append('password', data.password);
    formData.append('client_id', "a0e57322-f1ef-4a3c-84ff-b9a3d852a559");
    formData.append('client_secret', "OF3II6JtC3DIrSk5mNVl0ZaPlkP1P8nI5wrf1tYX");
    formData.append('grant_type', "password");
    const headers: Record<string, string> = { 'lang': lang }
    // clear token from cookies
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    try {
        const response = await api.post<ApiEnvelope<ApiAuthPayload>>(url, formData, { headers });
        const message = response?.data?.message;

        setLoading(false)
        if (response.data.status) {
            // Extract token and user from the new response structure
            const tokenData = response?.data?.items?.token;
            const userData = response?.data?.items?.user;
            if (response?.data?.items?.token) {

                toast(message, {
                    style: {
                        background: "#1B8354",
                        color: "#fff",
                        borderRadius: "10px",
                        boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
                    },

                    description: `مرحباً ${response?.data?.items?.token ? userData?.name : ""}`
                });
                // Store access_token and refresh_token
                localStorage.setItem("token", tokenData?.access_token);
                localStorage.setItem("refresh_token", tokenData?.refresh_token);
                // Store user data
                localStorage.setItem("userId", String(userData?.id));
                // Set cookie with access_token
                document.cookie = `token=${encodeURIComponent(tokenData.access_token)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;

                router.push("/");
                localStorage.setItem("user", JSON.stringify(userData));
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
            }


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
    }
}
