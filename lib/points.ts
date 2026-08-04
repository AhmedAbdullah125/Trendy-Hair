import type { ApiProfile } from './apiTypes';

/**
 * Points, and the money they are worth.
 *
 * `users.wallet` holds **points**, not dinars. Rendering it with a `د.ك` suffix
 * overstates a balance by `points_per_dinar` — at the default rate of 100, a
 * 15-point balance (0.15 KWD) reads as "15.000 د.ك".
 *
 * The profile already carries everything needed to present this correctly, so
 * nothing here recomputes what the server sends:
 *
 *   wallet                   balance in points
 *   points_per_dinar         conversion rate
 *   wallet_spendable         dinars redeemable now, after unpaid orders
 *   wallet_spendable_points  the same figure in points — the slider maximum
 *   can_use_wallet           false when redeeming is not worth offering
 */

/** Fallback rate, used only when the profile has not loaded yet. */
const DEFAULT_POINTS_PER_DINAR = 100;

/** How the balance is spelled in Arabic. */
export const POINTS_LABEL = 'نقطة';

export interface WalletView {
  /** Total balance, in points. */
  points: number;
  /** Total balance converted to dinars. */
  dinars: number;
  /** Dinars redeemable right now — excludes points held by unpaid orders. */
  spendableDinars: number;
  /** The same figure in points; use as the redemption slider's maximum. */
  spendablePoints: number;
  /** Points that make up one dinar. */
  rate: number;
  /** Whether the redemption block should be shown at all. */
  canRedeem: boolean;
  /** True when a positive balance is entirely reserved by unpaid orders. */
  fullyReserved: boolean;
}

/**
 * Normalises the profile's wallet fields into one shape.
 *
 * Every field except `wallet` is optional so an older API — or a profile still
 * loading — degrades to a sane view rather than rendering `NaN`.
 */
export const readWallet = (profile?: Partial<ApiProfile> | null): WalletView => {
  const points = Number(profile?.wallet ?? 0) || 0;
  const rate = Number(profile?.points_per_dinar) > 0
    ? Number(profile?.points_per_dinar)
    : DEFAULT_POINTS_PER_DINAR;

  const spendableDinars = Number(profile?.wallet_spendable ?? points / rate) || 0;
  const spendablePoints = Number(profile?.wallet_spendable_points ?? Math.floor(spendableDinars * rate)) || 0;

  return {
    points,
    dinars: points / rate,
    spendableDinars,
    spendablePoints,
    rate,
    // Trust the server's gate when it sends one: it accounts for the dashboard's
    // minimum redemption, which the client does not otherwise know.
    canRedeem: profile?.can_use_wallet ?? spendableDinars > 0,
    fullyReserved: points > 0 && spendablePoints <= 0,
  };
};

/** `1٬250 نقطة` — the balance as points. */
export const formatPoints = (points: number): string =>
  `${Math.round(points).toLocaleString('en-US')} ${POINTS_LABEL}`;

/** `2.500 د.ك` — a dinar amount. */
export const formatDinars = (dinars: number): string => `${(dinars || 0).toFixed(3)} د.ك`;

/** Points → dinars, for showing what a balance is worth. */
export const pointsToDinars = (points: number, rate: number): number =>
  rate > 0 ? points / rate : 0;

/** Dinars → points, for turning a redemption amount back into a balance. */
export const dinarsToPoints = (dinars: number, rate: number): number =>
  Math.round((dinars || 0) * (rate > 0 ? rate : DEFAULT_POINTS_PER_DINAR));
