/**
 * State machine for "the Back button should dismiss this overlay".
 *
 * A drawer or modal held in component state is invisible to session history,
 * so pressing Back while one is open skips straight past it — on the first page
 * of a visit, that means leaving the site entirely rather than stepping back
 * one screen.
 *
 * The remedy is to push a throwaway history entry when the overlay opens and
 * treat a `popstate` as a dismissal. The fiddly part is the *other* way of
 * closing it — a tap on the X, or navigating away — which leaves that entry
 * stranded, so the next Back press is silently swallowed undoing it. That entry
 * has to be withdrawn explicitly, but only when the user did not already
 * consume it by pressing Back.
 *
 * The decisions are kept here, apart from the effect that performs them, so
 * they can be tested without a browser.
 */

/** What `useCloseOnBack` should do when the overlay is torn down. */
export type OverlayCleanup =
  /** The user pressed Back; the entry is already gone. Do nothing. */
  | 'none'
  /** Closed some other way — withdraw the entry we pushed. */
  | 'withdraw';

/**
 * Whether opening the overlay should push a history entry.
 *
 * Only when it is actually open; a closed overlay must not touch history, or
 * every render would pile up entries the user has to press Back through.
 */
export const shouldPushEntry = (isOpen: boolean): boolean => isOpen === true;

/**
 * What to do when the overlay closes.
 *
 * @param didPopstate Whether a `popstate` fired while the overlay was open —
 *                    i.e. the user pressed Back and already spent the entry.
 */
export const cleanupFor = (didPopstate: boolean): OverlayCleanup =>
  didPopstate ? 'none' : 'withdraw';
