import { useEffect, useRef } from 'react';
import { cleanupFor, shouldPushEntry } from '../lib/overlayHistory';

/**
 * Makes the browser's Back button dismiss an overlay instead of leaving the page.
 *
 * Give it the overlay's open flag and its close handler. While open, an extra
 * history entry stands in for "overlay showing", so Back pops that entry and
 * closes the overlay rather than navigating away — which on the first page of a
 * visit meant leaving the site.
 *
 * Closing the overlay any other way withdraws that entry again, so Back is
 * never silently wasted undoing an invisible step.
 *
 * The URL is deliberately left untouched: the entry is pushed against the
 * current path, so React Router sees no route change and nothing re-renders on
 * its account.
 *
 * @param isOpen  Whether the overlay is currently showing.
 * @param onClose Called when the user presses Back.
 */
export const useCloseOnBack = (isOpen: boolean, onClose: () => void): void => {
  // Held in a ref so the effect does not re-run — and therefore does not push a
  // second entry — just because the caller passed a new closure this render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!shouldPushEntry(isOpen)) return;

    window.history.pushState({ overlay: true }, '');

    let didPopstate = false;
    const handlePopstate = () => {
      didPopstate = true;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
      if (cleanupFor(didPopstate) === 'withdraw') {
        window.history.back();
      }
    };
  }, [isOpen]);
};
