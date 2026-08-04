import api from '@/lib/axiosInstance';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';
import type { ApiAuthPayload, ApiEnvelope } from '@/lib/apiTypes';
import { getApiErrorMessage } from '@/lib/apiTypes';
import { phoneLookupCandidates } from '@/lib/phone';

export interface LoginCredentials {
    phone: string;
    password: string;
    /** Dial code of the selected country, stripped before sending. */
    dialCode?: string;
}

/** Minimal router surface used here — `AuthScreen` passes a `useNavigate` adapter. */
export interface RouterLike {
    push: (path: string) => void;
}

export type SetLoading = (loading: boolean) => void;

/** `phone_not_exist` — the only failure worth retrying with another spelling. */
const PHONE_NOT_REGISTERED = 404;

/** One sign-in attempt with one spelling of the number. */
async function attemptLogin(phone: string, data: LoginCredentials, lang: string) {
    const formData = new FormData();
    formData.append('phone', phone);
    formData.append('password', data.password);
    formData.append('client_id', "a0e57322-f1ef-4a3c-84ff-b9a3d852a559");
    formData.append('client_secret', "OF3II6JtC3DIrSk5mNVl0ZaPlkP1P8nI5wrf1tYX");
    formData.append('grant_type', "password");

    return api.post<ApiEnvelope<ApiAuthPayload>>(
        `${API_BASE_URL}/v1/login`,
        formData,
        { headers: { lang } }
    );
}

export async function loginRequest(
    data: LoginCredentials,
    setLoading: SetLoading,
    lang: string,
    router: RouterLike
): Promise<void> {
    setLoading(true)
    // clear token from cookies
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    try {
        // The stored spelling is unknowable from the client, so try each in turn
        // and keep the first that gets past "this number is not registered".
        // A wrong password does not come back as 404, so it stops here rather
        // than replaying the attempt.
        const candidates = phoneLookupCandidates(data.phone, data.dialCode ?? '');
        let response = await attemptLogin(candidates[0] ?? '', data, lang);

        for (const candidate of candidates.slice(1)) {
            if (response?.data?.statusCode !== PHONE_NOT_REGISTERED) break;
            response = await attemptLogin(candidate, data, lang);
        }

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
