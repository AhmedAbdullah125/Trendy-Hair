/**
 * OAuth client configuration.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * READ THIS BEFORE CHANGING ANYTHING HERE
 * ─────────────────────────────────────────────────────────────────────────
 * A browser application cannot keep a secret. Moving the client secret out of
 * source and into `VITE_OAUTH_CLIENT_SECRET` stops it being committed to the
 * repository, but Vite **inlines `import.meta.env` values at build time**, so
 * a secret supplied at build still ends up readable in `dist/`.
 *
 * This module is therefore not a fix for the exposure. It does two real things:
 *
 *   1. Takes the credentials out of the source tree, so they are no longer in
 *      version control, code review, or copy-paste range.
 *   2. Makes the secret **optional**. `oauthClientFields()` omits
 *      `client_secret` entirely when none is configured — so the day the
 *      backend converts this to a public client, the fix is to stop setting
 *      the variable. No code change, no redeploy of logic.
 *
 * Today the secret is still required: `RequiresUserPassportClient::passportRules()`
 * validates `client_secret` as `required|string` and `passportTokenRequest()`
 * forwards it to Passport's `oauth/token`. Omitting it now returns 422.
 *
 * The real fix is backend-owned — convert the Passport client to a public
 * client and adopt Authorization Code + PKCE, or proxy the token exchange
 * through the backend. See BACKEND_INTEGRATION_REQUESTS.md.
 *
 * The secrets that were previously hardcoded here must be treated as
 * compromised and rotated by the project owner.
 */

const env: ImportMetaEnv = import.meta.env ?? ({} as ImportMetaEnv);

export const OAUTH_CLIENT_ID: string = env.VITE_OAUTH_CLIENT_ID ?? '';

/** Empty once the backend accepts a public client. */
const OAUTH_CLIENT_SECRET: string = env.VITE_OAUTH_CLIENT_SECRET ?? '';

/**
 * Fails loudly at startup rather than surfacing as an opaque 422 on the login
 * form, which is what a missing client id looks like from the user's side.
 */
export const assertAuthConfig = (): void => {
  if (!OAUTH_CLIENT_ID) {
    console.error(
      '[auth] VITE_OAUTH_CLIENT_ID is not set. Sign-in and registration will fail. ' +
      'Copy .env.example to .env and provide the customer OAuth client id.'
    );
  }
};

/**
 * The OAuth client fields for a token request.
 *
 * `client_secret` is included only when one is configured, so a public-client
 * deployment sends a PKCE-compatible payload without touching this code.
 */
export const oauthClientFields = (): Record<string, string> => {
  const fields: Record<string, string> = { client_id: OAUTH_CLIENT_ID };
  if (OAUTH_CLIENT_SECRET) fields.client_secret = OAUTH_CLIENT_SECRET;
  return fields;
};

/** Appends the OAuth client fields to a `FormData` payload. */
export const appendOAuthClient = (formData: FormData): void => {
  Object.entries(oauthClientFields()).forEach(([key, value]) => formData.append(key, value));
};
