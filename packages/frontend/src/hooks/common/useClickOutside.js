import { useEffect } from 'react';

/**
 * useClickOutside
 *
 * @param {Array<React.RefObject>} refs - refs considered "inside"
 * @param {Function} handler - called when click happens outside all refs
 */
export const useClickOutside = (refs = [], handler) => {
  useEffect(() => {
    const listener = (event) => {
      const isInside = refs.some(
        (ref) => ref.current && ref.current.contains(event.target)
      );

      if (!isInside) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs, handler]);
};
