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
  /** Human-readable order reference, when the gateway callback supplied one. */
  orderNumber?: string;
  /**
   * Localised sentence built by the server.
   *
   * Safe to display for `paid` and `failed`, where it saves us maintaining a
   * second copy of the wording in the customer's language.
   *
   * **Not** for `pending`. The server picks this from a single `paid` boolean,
   * so an unconfirmed charge receives the failure text — which asserts that
   * nothing was charged. See `PaymentResultScreen`.
   */
  message?: string;
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

  const extras = {
    orderNumber: params.get('orderNumber') ?? undefined,
    message: params.get('message') ?? undefined,
  };

  /*
   * `paymentStatus` is the order's own column, re-read after the webhook
   * validated the charge, so it decides.
   *
   * `status` cannot: the server now sends `failed` for anything that is not
   * paid, which lumps a declined card together with a charge still awaiting
   * confirmation. Those need different words — one says no money moved, the
   * other cannot promise that — so the distinction is taken from
   * `paymentStatus` and `status` is only a fallback when it is absent.
   */
  if (paymentStatus === 'paid') return { orderId, outcome: 'paid', ...extras };
  if (paymentStatus === 'failed') return { orderId, outcome: 'failed', ...extras };
  if (paymentStatus) return { orderId, outcome: 'pending', ...extras };

  // No paymentStatus at all — fall back to the coarse flag.
  if (status === 'failed') return { orderId, outcome: 'failed', ...extras };

  return { orderId, outcome: 'pending', ...extras };
};

/** Strips the payment parameters, leaving the rest of the URL intact. */
export const clearPaymentParams = (search: string): string => {
  const params = new URLSearchParams(search);
  ['orderId', 'orderNumber', 'status', 'paymentStatus', 'message', 'paymentId', 'Id']
    .forEach((key) => params.delete(key));

  const rest = params.toString();
  return rest ? `?${rest}` : '';
};
