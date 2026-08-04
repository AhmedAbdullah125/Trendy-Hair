import type { ApiEnvelope } from './apiTypes';

/**
 * Turning a failed envelope into a thrown error.
 *
 * The API's `response_api()` helper ends in `response()->json($response)` with no
 * HTTP status argument, so **every** response — including validation failures and
 * 404s — arrives as HTTP 200. The real code lives in the body as `statusCode`,
 * and `status: false` marks the failure.
 *
 * Axios therefore never rejects on these, and `onError` never runs. Worse, the
 * failure body still carries an `items` object (`empObj()` serialises to `{}`),
 * so the usual `if (!items) throw` guard sees something truthy and lets a failed
 * call through as if it had succeeded.
 *
 * `unwrapEnvelope` restores the normal contract: it returns `items` on success
 * and throws `ApiResultError` otherwise, so react-query's `onError` fires and
 * callers can branch on `statusCode` / `message`.
 */
export class ApiResultError<TItems = unknown> extends Error {
  /** The code the API *meant* to return, e.g. 422. */
  readonly statusCode: number;

  /** Failure payloads still carry data — the cooldown sends `can_play_at` here. */
  readonly items: TItems;

  constructor(message: string, statusCode: number, items: TItems) {
    super(message);
    this.name = 'ApiResultError';
    this.statusCode = statusCode;
    this.items = items;
  }
}

export const isApiResultError = (error: unknown): error is ApiResultError =>
  error instanceof ApiResultError;

/**
 * Returns the envelope's `items`, or throws `ApiResultError` when the call failed.
 */
export function unwrapEnvelope<T>(envelope: ApiEnvelope<T> | undefined): T {
  if (!envelope) {
    throw new ApiResultError('Empty response from the server', 0, undefined);
  }

  if (envelope.status === false) {
    throw new ApiResultError(
      envelope.message || 'Request failed',
      envelope.statusCode ?? 0,
      envelope.items
    );
  }

  return envelope.items;
}
