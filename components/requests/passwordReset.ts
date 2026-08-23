import api from '@/lib/axiosInstance';
import { API_BASE_URL } from '@/lib/apiConfig';
import type { ApiEnvelope } from '@/lib/apiTypes';
import { getApiErrorMessage } from '@/lib/apiTypes';
import { getApiCode, getApiItems } from '@/lib/apiResult';
import { phoneLookupCandidates } from '@/lib/phone';

/**
 * Password reset (OTP over WhatsApp). Added by backend `4388a5c`.
 *
 * `verify-code` is deliberately not called here — the backend's own docs
 * recommend collecting the code and the new password on one screen instead,
 * and warn that calling `verify-code` on every keystroke burns the 5-attempt
 * budget for nothing. `resetPassword` plays that role in one call.
 */

export interface PasswordResetResult {
  ok: boolean;
  /** Stable reason — `phone_not_found`, `resend_cooldown`, `code_invalid`. */
  code: string | null;
  message: string;
  /** `retry_after_seconds` on a 429, `expires_in_minutes` on success. */
  items: Record<string, unknown>;
  /**
   * The exact phone spelling the backend accepted — only set by
   * `forgotPassword`. `resetPassword` must be called with this, not with
   * whatever the user typed, since the API matches phone by exact string.
   */
  resolvedPhone?: string;
}

const buildResult = (data: ApiEnvelope<Record<string, unknown>> | undefined): PasswordResetResult => ({
  ok: Boolean(data?.status),
  code: (data as { code?: string } | undefined)?.code ?? null,
  message: data?.message ?? '',
  items: data?.items ?? {},
});

const buildErrorResult = (error: unknown): PasswordResetResult => ({
  ok: false,
  code: getApiCode(error),
  message: getApiErrorMessage(error) ?? '',
  items: getApiItems(error),
});

/**
 * `POST /v1/password/forgot`.
 *
 * Tries every known spelling of the phone, same reasoning as `loginRequest`:
 * accounts stored under an old spelling would otherwise get a false
 * `phone_not_found` even though the number is really registered.
 */
export const forgotPassword = async (
  phone: string,
  dialCode: string,
  lang = 'ar'
): Promise<PasswordResetResult> => {
  const candidates = phoneLookupCandidates(phone, dialCode);
  let lastNotFound: unknown = null;

  for (const candidate of candidates) {
    try {
      const response = await api.post<ApiEnvelope<{ expires_in_minutes: number }>>(
        `${API_BASE_URL}/v1/password/forgot`,
        (() => {
          const fd = new FormData();
          fd.append('phone', candidate);
          return fd;
        })(),
        { headers: { lang } }
      );

      return { ...buildResult(response.data), resolvedPhone: candidate };
    } catch (error) {
      if (getApiCode(error) === 'phone_not_found') {
        lastNotFound = error;
        continue;
      }
      return buildErrorResult(error);
    }
  }

  return buildErrorResult(lastNotFound ?? new Error('Password reset request failed'));
};

/** `POST /v1/password/reset`. [phone] must be the `resolvedPhone` `forgotPassword` returned. */
export const resetPassword = async (
  phone: string,
  code: string,
  password: string,
  passwordConfirmation: string,
  lang = 'ar'
): Promise<PasswordResetResult> => {
  try {
    const response = await api.post<ApiEnvelope<Record<string, never>>>(
      `${API_BASE_URL}/v1/password/reset`,
      (() => {
        const fd = new FormData();
        fd.append('phone', phone);
        fd.append('code', code);
        fd.append('password', password);
        fd.append('password_confirmation', passwordConfirmation);
        return fd;
      })(),
      { headers: { lang } }
    );

    return buildResult(response.data);
  } catch (error) {
    return buildErrorResult(error);
  }
};
