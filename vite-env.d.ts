/// <reference types="vite/client" />

/**
 * Build-time configuration.
 *
 * Every value here is inlined into the JS bundle by Vite and is therefore
 * public. Never add a value that must stay secret — see lib/authConfig.ts.
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_OAUTH_CLIENT_ID?: string;
  /** Temporary; omitted once the backend accepts a public client. */
  readonly VITE_OAUTH_CLIENT_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
