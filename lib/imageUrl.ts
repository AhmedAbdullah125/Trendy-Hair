import { API_BASE_URL } from './apiConfig';

/**
 * One place that turns whatever the API sends into something usable in `src`.
 *
 * The backend resolves every image field through `storageUrl()` (see
 * `app/Helper/system.php`), which returns an **absolute** URL — it passes
 * `http(s)://…` values through untouched and otherwise prefixes the public
 * disk URL. So the common case is "already a full URL, use it verbatim".
 *
 * This exists because the home screen used to re-prefix those absolute URLs
 * with `${API_BASE_URL}/v1/`, producing
 * `https://host/api/v1/https://host/storage/x.jpg`. Three different ad-hoc
 * cleaners then grew downstream to undo it — one of which (`BrandsRow`)
 * split on the bad prefix and so only worked *while* the bug was present.
 * Fixing the source without a shared resolver would have broken that screen,
 * hence a single function every caller shares.
 *
 * Kept tolerant on purpose: it still repairs a doubled prefix so any value
 * cached or persisted by an older build keeps rendering.
 */

/** Origin the API is served from, e.g. `https://trandyhairapp.com`. */
const apiOrigin = (): string => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    // API_BASE_URL is malformed — relative paths cannot be resolved, but
    // absolute ones still can, so degrade rather than throw at import time.
    return '';
  }
};

/**
 * 1x1 transparent GIF. Used so a missing image renders as empty space rather
 * than the browser's broken-image glyph, which reads as a rendering fault.
 */
export const IMAGE_FALLBACK =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * Normalises an image value from the API into a usable URL.
 *
 * Handles, in order: missing/non-string values, JSON-escaped slashes, a
 * doubled `…/api/v1/https://…` prefix from older builds, absolute URLs,
 * root-relative paths, and bare relative paths.
 *
 * @param value    Raw field from the API (`image`, `main_image`, `photo`, …).
 * @param fallback Returned when the value cannot yield a URL.
 */
export const resolveImageUrl = (value: unknown, fallback: string = IMAGE_FALLBACK): string => {
  if (typeof value !== 'string') return fallback;

  // Some payloads arrive with JSON-escaped slashes (`https:\/\/…`).
  let url = value.replace(/\\\//g, '/').trim();
  if (!url) return fallback;

  // Repair the historical double-prefix: keep everything from the *last*
  // embedded scheme, which is the real URL.
  const lastScheme = Math.max(url.lastIndexOf('http://'), url.lastIndexOf('https://'));
  if (lastScheme > 0) {
    url = url.slice(lastScheme);
  }

  if (/^https?:\/\//i.test(url)) return url;

  // Reject values that are neither a URL nor a path (e.g. "null", "undefined"
  // stringified by an older caller).
  if (url === 'null' || url === 'undefined') return fallback;

  const origin = apiOrigin();
  if (!origin) return fallback;

  return url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`;
};

/**
 * `onError` handler that swaps a failed image for the fallback once.
 *
 * Guarded so a fallback that itself fails cannot loop.
 */
export const onImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
  const img = event.currentTarget;
  if (img.src === IMAGE_FALLBACK) return;
  img.src = IMAGE_FALLBACK;
};
