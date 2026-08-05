import api from '@/lib/axiosInstance';
import { API_BASE_URL } from '@/lib/apiConfig';
import type { ApiEnvelope } from '@/lib/apiTypes';
import { getApiErrorMessage } from '@/lib/apiTypes';
import { getApiCode } from '@/lib/apiResult';

/**
 * Account verification (OTP).
 *
 * Added by backend `4eab388`. Registration now creates the user with
 * `is_verify = 0`, and both entry points refuse to hand out a token until the
 * code is confirmed:
 *
 *   - `register` answers 200 with `code: "verification_required"` and a
 *     profile payload — **no token**
 *   - `login` answers 200 with `items.token === null` and the
 *     `account_unverified` message — note it carries **no `code` field**, so
 *     the null token is the only reliable signal
 *
 * Neither verification endpoint returns a token either, so once the code is
 * accepted the app has to sign in again. `AuthScreen` does that automatically
 * with the credentials already on screen.
 *
 * No SMS is actually delivered yet — `dispatchVerificationCode()` is an empty
 * placeholder and the accepted code is the fixed `services.otp.static_code`
 * (`OTP_STATIC_CODE`, default `1234`). The flow is real; only delivery is
 * pending, so wiring a provider later needs no frontend change.
 */

export interface VerificationResult {
  ok: boolean;
  /** Stable reason from the API — `already_verified`, `phone_not_found`, `invalid_code`. */
  code: string | null;
  message: string;
}

/** `POST /v1/verification/send` — (re)issues the code for a phone. */
export const sendVerificationCode = async (
  phone: string,
  lang = 'ar'
): Promise<VerificationResult> => {
  try {
    const response = await api.post<ApiEnvelope<{ is_verify: boolean }>>(
      `${API_BASE_URL}/v1/verification/send`,
      (() => {
        const fd = new FormData();
        fd.append('phone', phone);
        return fd;
      })(),
      { headers: { lang } }
    );

    return {
      ok: Boolean(response.data?.status),
      code: (response.data as { code?: string })?.code ?? null,
      message: response.data?.message ?? '',
    };
  } catch (error) {
    return { ok: false, code: getApiCode(error), message: getApiErrorMessage(error) ?? '' };
  }
};

/** `POST /v1/verification/verify` — confirms the code and flips `is_verify`. */
export const verifyPhoneCode = async (
  phone: string,
  code: string,
  lang = 'ar'
): Promise<VerificationResult> => {
  try {
    const response = await api.post<ApiEnvelope<{ is_verify: boolean }>>(
      `${API_BASE_URL}/v1/verification/verify`,
      (() => {
        const fd = new FormData();
        fd.append('phone', phone);
        fd.append('code', code);
        return fd;
      })(),
      { headers: { lang } }
    );

    return {
      ok: Boolean(response.data?.status),
      code: (response.data as { code?: string })?.code ?? null,
      message: response.data?.message ?? '',
    };
  } catch (error) {
    // A wrong code is a 422 with `code: "invalid_code"`, so it arrives here.
    return { ok: false, code: getApiCode(error), message: getApiErrorMessage(error) ?? '' };
  }
};
