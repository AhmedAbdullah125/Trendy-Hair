/**
 * Optimistic-favourite state rules for the product card's heart.
 *
 * Split out of the component because the bug this fixes was purely in the
 * lifetime of the optimistic flip, which is easy to state and easy to get
 * wrong: the previous version discarded the flip as soon as *any* input
 * changed, including the local favourites array that the tap itself updates —
 * so the heart snapped straight back to the stale server value and looked like
 * it had ignored the tap.
 */

/**
 * What the heart should show.
 *
 * @param baseFav  What the underlying data says (server row, else local list).
 * @param override The optimistic flip, or null when there is none.
 */
export const resolveFavourite = (baseFav: boolean, override: boolean | null): boolean =>
  override === null ? baseFav : override;

/**
 * Whether the optimistic flip has served its purpose and can be dropped.
 *
 * Only once the underlying data agrees with it — at which point keeping it
 * would make no visible difference, and dropping it hands control back to the
 * server. Clearing any earlier re-exposes the stale value.
 */
export const shouldClearOverride = (baseFav: boolean, override: boolean | null): boolean =>
  override !== null && baseFav === override;
