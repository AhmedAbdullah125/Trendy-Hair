/**
 * Phone number normalisation.
 *
 * The API stores whatever string it is given and looks users up with an exact
 * match (`where('phone', …)`), so every screen has to send the *same* shape or
 * a user who registered on one screen cannot sign in from another.
 *
 * The shape of record is digits-only including the country code, e.g.
 * `96512345678` — that is what `registerRequest` has always produced
 * (`data.phone.split("+").join("")`), so it is what existing rows contain.
 * `loginRequest` and `updateProfile` used to send the raw `+965…` value, which
 * silently failed to match those rows.
 */

/** Country dialled by default — the app prices in KWD and ships within Kuwait. */
export const DEFAULT_COUNTRY = 'kw';

/** Shortest national number we accept, before the dial code is counted. */
export const MIN_NATIONAL_DIGITS = 8;

/** Strips everything that is not a digit. */
export const toApiPhone = (value: string): string => (value ?? '').replace(/\D/g, '');

/**
 * The form the API actually stores: the **national** number, without the country
 * code.
 *
 * Accounts were created through a plain text field with no country selector, so
 * people typed their local number and that is what is in the `users.phone`
 * column — `50000000`, not `96550000000`. The lookup is an exact string match,
 * so anything else fails with "رقم الهاتف غير مسجل".
 *
 * The country selector therefore stays a convenience for the user (they no
 * longer type a prefix) but its dial code is removed again before sending. Once
 * the API normalises numbers this can send E.164 instead — see BACKEND_ISSUES.md.
 */
export const toNationalPhone = (value: string, dialCode: string): string => {
  const digits = toApiPhone(value);
  const code = toApiPhone(dialCode);

  // Only strip when the value really is E.164. A bare local number that happens
  // to start with the dial code's digits must be left untouched.
  if (!(value ?? '').trim().startsWith('+')) return digits;

  return code && digits.startsWith(code) ? digits.slice(code.length) : digits;
};

/**
 * E.164, leading `+` included — the format the API stores and matches on.
 *
 * Confirmed by the backend developer. This is what every write must send.
 */
export const toE164 = (value: string, dialCode = ''): string => {
  const digits = toApiPhone(value);
  if (!digits) return '';

  // The phone control always emits `+<country><national>`, so its digits are
  // already complete.
  if ((value ?? '').trim().startsWith('+')) return `+${digits}`;

  // A bare value (e.g. a number loaded from the profile) still needs its code.
  const code = toApiPhone(dialCode);
  return code && !digits.startsWith(code) ? `+${code}${digits}` : `+${digits}`;
};

/**
 * Every spelling of a number that might be the one on file, most likely first.
 *
 * E.164 is the documented format and comes first. The rest are fallbacks for
 * rows written before that was settled: the old sign-up screen was a plain text
 * field with no country selector, so accounts created through it hold whatever
 * the user happened to type. The lookup is an exact string match with no
 * normalisation, so nothing on the client can tell those apart in advance.
 *
 * Drop the fallbacks once the stored data is normalised — see BACKEND_ISSUES.md.
 */
export const phoneLookupCandidates = (value: string, dialCode: string): string[] => {
  const e164 = toE164(value, dialCode);
  const national = toNationalPhone(value, dialCode);
  const full = toApiPhone(value);

  // `Set` keeps order and drops duplicates when the forms coincide.
  return [...new Set([e164, national, full].filter(Boolean))];
};

/**
 * True when the number carries enough digits to be a real one.
 *
 * `react-international-phone` always prefixes the dial code, so a field the user
 * has not filled in still holds e.g. `+965`. Counting the dial code would make
 * that look valid, hence the subtraction.
 */
export const hasEnoughDigits = (value: string, dialCodeDigits: number): boolean =>
  toApiPhone(value).length - dialCodeDigits >= MIN_NATIONAL_DIGITS;
