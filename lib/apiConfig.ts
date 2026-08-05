/**
 * API base URL.
 *
 * Was hardcoded to production, which meant local development ran against the
 * live API — creating real orders and mutating real data — with no way to
 * point at staging. It now comes from the environment, keeping the previous
 * value as the fallback so existing deployments are unaffected.
 *
 * No trailing slash: callers append `/v1/...`, and `lib/imageUrl` derives the
 * storage origin from this.
 */
const API_BASE_URL: string = (
  import.meta.env?.VITE_API_BASE_URL ?? 'https://trandyhairapp.com/api'
).replace(/\/+$/, '');

export { API_BASE_URL };
