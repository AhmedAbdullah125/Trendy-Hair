import Cookies from 'js-cookie';
import api from '@/lib/axiosInstance';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';
import type { ApiAuthPayload, ApiEnvelope } from '@/lib/apiTypes';
import { getApiErrorMessage } from '@/lib/apiTypes';
import { toE164 } from '@/lib/phone';
import type { RouterLike, SetLoading } from './loginRequest';
import { appendOAuthClient } from '@/lib/authConfig';

export interface RegisterCredentials {
    name: string;
    phone: string;
    password: string;
    /** Dial code of the selected country, stripped before sending. */
    dialCode?: string;
}

export async function registerRequest(
    data: RegisterCredentials,
    setLoading: SetLoading,
    lang: string,
    router: RouterLike,
    /** Called when the account was created but still needs its code confirmed. */
    onVerificationRequired?: () => void
): Promise<void> {
    setLoading(true)
    const url = `${API_BASE_URL}/v1/register`;
    const formData = new FormData();
    formData.append('name', data.name);
    // E.164 with the leading `+` — the format the API stores. See lib/phone.ts.
    formData.append('phone', toE164(data.phone, data.dialCode ?? ''));
    formData.append('password', data.password);
    formData.append('grant_type', "password");
    appendOAuthClient(formData);
    const headers: Record<string, string> = { 'lang': lang }
    try {
        const response = await api.post<ApiEnvelope<ApiAuthPayload>>(url, formData, { headers });
        const message = response?.data?.message;

        setLoading(false)
        if (response.data.status) {
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
                localStorage.setItem("token", tokenData?.access_token);
                localStorage.setItem("refresh_token", tokenData?.refresh_token);
                localStorage.setItem("userId", String(userData?.id));
                localStorage.setItem("user", JSON.stringify(userData));
                Cookies.set('token', tokenData.access_token, { expires: 7, path: '/' });
                document.cookie = `token=${encodeURIComponent(tokenData.access_token)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;

                router.push("/");
            }
            else {
                // Registration now creates the account unverified, so a
                // successful signup comes back with `code:
                // "verification_required"` and no token. That is the normal
                // path, not a failure — send the user to the code screen.
                toast(message, {
                    style: {
                        background: "#1B8354",
                        color: "#fff",
                        borderRadius: "10px",
                        boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
                    },
                });
                onVerificationRequired?.();
                return;
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
