/**
 * Reading the outcome of a payment from the gateway's return URL.
 *
 * After MyFatoorah finishes, the backend's webhook validates the payment and
 * redirects back with `?orderId=…&status=…&paymentStatus=…` (see
 * `Payment\WebhookController::success` / `::error`).
 *
 * The app only ever acted on the single happy combination and ignored every
 * other one, so a failed or unconfirmed payment dropped the customer on the
 * home screen with no message at all — indistinguishable from never having
 * tried to pay.
 */

export type PaymentOutcome =
  /** The order is paid. Safe to congratulate. */
  | 'paid'
  /** The gateway reported a failure. Nothing was charged. */
  | 'failed'
  /**
   * Came back from the gateway, but the order is not marked paid. Covers a
   * cancelled payment and a charge still awaiting confirmation — the two are
   * indistinguishable from the return URL, so this must never be reported as
   * either success or failure.
   */
  | 'pending';

export interface PaymentReturn {
  orderId: string;
  outcome: PaymentOutcome;
}

/**
 * Reads a payment return out of a query string.
 *
 * @param search `window.location.search`, with or without the leading `?`.
 * @returns The outcome, or null when this is not a return from the gateway.
 */
export const parsePaymentReturn = (search: string): PaymentReturn | null => {
  const params = new URLSearchParams(search);

  const orderId = params.get('orderId');
  const status = params.get('status');
  const paymentStatus = params.get('paymentStatus');

  // Both are always present on a real return. Requiring them keeps ordinary
  // links carrying an unrelated `orderId` from triggering a payment screen.
  if (!orderId || !status) return null;

  // `paymentStatus` mirrors the order's own `payment_status` column, refreshed
  // after the webhook validated the charge — so it outranks `status`, which
  // only says which redirect the gateway chose.
  if (paymentStatus === 'paid') return { orderId, outcome: 'paid' };
  if (status === 'failed' || paymentStatus === 'failed') return { orderId, outcome: 'failed' };

  return { orderId, outcome: 'pending' };
};

/** Strips the payment parameters, leaving the rest of the URL intact. */
export const clearPaymentParams = (search: string): string => {
  const params = new URLSearchParams(search);
  ['orderId', 'status', 'paymentStatus', 'paymentId', 'Id'].forEach((key) => params.delete(key));

  const rest = params.toString();
  return rest ? `?${rest}` : '';
};
