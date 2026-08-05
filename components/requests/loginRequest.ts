import api from '@/lib/axiosInstance';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';
import type { ApiAuthPayload, ApiEnvelope } from '@/lib/apiTypes';
import { getApiErrorMessage } from '@/lib/apiTypes';
import { getApiStatusCode } from '@/lib/apiResult';
import { phoneLookupCandidates } from '@/lib/phone';
import { appendOAuthClient } from '@/lib/authConfig';

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
    appendOAuthClient(formData);
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
    router: RouterLike,
    /** Called when the account exists but has not confirmed its code yet. */
    onVerificationRequired?: () => void
): Promise<void> {
    setLoading(true)
    // clear token from cookies
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    try {
        // The stored spelling is unknowable from the client, so try each in turn
        // and keep the first that gets past "this number is not registered".
        //
        // Both outcomes have to be handled: the API now returns a real HTTP 404,
        // which axios rejects, while an older deployment answers 200 with
        // `status: false` in the body. Only a 404 is retried — a wrong password
        // is a different failure and must stop here rather than replaying the
        // attempt against every spelling.
        const candidates = phoneLookupCandidates(data.phone, data.dialCode ?? '');
        let response: Awaited<ReturnType<typeof attemptLogin>> | null = null;
        let notRegistered: unknown = null;

        for (const candidate of candidates) {
            try {
                const attempt = await attemptLogin(candidate, data, lang);

                if (attempt.data?.status === false && attempt.data?.statusCode === PHONE_NOT_REGISTERED) {
                    response = attempt;   // remember it, in case every spelling fails
                    continue;
                }

                response = attempt;
                break;
            } catch (err) {
                if (getApiStatusCode(err) === PHONE_NOT_REGISTERED) {
                    notRegistered = err;
                    continue;
                }
                throw err;
            }
        }

        // Every spelling came back unknown — report that, not a generic error.
        if (!response) throw notRegistered ?? new Error('Login failed');

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
                // Unverified account: the API answers 200 with
                // `items.token === null` and the `account_unverified` message,
                // and carries no `code` field — so the null token is the only
                // reliable signal. Hand it to the caller as a state to act on
                // rather than showing a red toast the user cannot resolve.
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
