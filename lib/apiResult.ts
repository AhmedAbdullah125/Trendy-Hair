import axios from 'axios';
import type { ApiEnvelope } from './apiTypes';

/**
 * Reading failures out of the API, whichever way they arrive.
 *
 * `response_api()` now passes the status through (`response()->json($body, $status)`),
 * so a 422 really is HTTP 422 and axios rejects on its own. Two shapes therefore
 * reach a caller:
 *
 *   - `AxiosError` — the normal path now, body on `error.response.data`
 *   - `ApiResultError` — thrown by `unwrapEnvelope` when a **200** still carries
 *     `status: false`, which the ladder endpoints deliberately do (losing a stage
 *     is a game outcome, not a failed request)
 *
 * The accessors below read either, so callers never branch on the transport.
 */
export class ApiResultError<TItems = unknown> extends Error {
  /** The code the API reports in the body. */
  readonly statusCode: number;

  /** Failure payloads still carry data — the cooldown sends `can_play_at` here. */
  readonly items: TItems;

  /** Stable machine-readable reason, e.g. `stage_locked`. */
  readonly code: string | null;

  constructor(message: string, statusCode: number, items: TItems, code: string | null = null) {
    super(message);
    this.name = 'ApiResultError';
    this.statusCode = statusCode;
    this.items = items;
    this.code = code;
  }
}

export const isApiResultError = (error: unknown): error is ApiResultError =>
  error instanceof ApiResultError;

/** The envelope behind a failure, from either error shape. */
const bodyOf = (error: unknown): Partial<ApiEnvelope<unknown>> & { code?: string } => {
  if (isApiResultError(error)) {
    return { statusCode: error.statusCode, items: error.items, code: error.code ?? undefined };
  }
  if (axios.isAxiosError(error)) {
    return (error.response?.data ?? {}) as Partial<ApiEnvelope<unknown>> & { code?: string };
  }
  return {};
};

/**
 * The API's stable reason for a failure, or `null` when it did not send one.
 *
 * Always prefer this over matching the message, which is localised and changes
 * with the `lang` header.
 */
export const getApiCode = (error: unknown): string | null => bodyOf(error).code ?? null;

/** The status the API reported in the body, or 0 when there is none. */
export const getApiStatusCode = (error: unknown): number => bodyOf(error).statusCode ?? 0;

/** The `items` payload attached to a failure — cooldowns carry their deadline here. */
export const getApiItems = <T = unknown>(error: unknown): T => (bodyOf(error).items ?? {}) as T;

/**
 * Returns the envelope's `items`, or throws `ApiResultError` when the call failed.
 *
 * Still needed despite real status codes: some endpoints answer 200 with
 * `status: false`, and a 200 whose body is missing entirely is not a success
 * the UI can use either.
 */
export function unwrapEnvelope<T>(envelope: (ApiEnvelope<T> & { code?: string }) | undefined): T {
  if (!envelope) {
    throw new ApiResultError('Empty response from the server', 0, undefined);
  }

  if (envelope.status === false) {
    throw new ApiResultError(
      envelope.message || 'Request failed',
      envelope.statusCode ?? 0,
      envelope.items,
      envelope.code ?? null
    );
  }

  return envelope.items;
}
