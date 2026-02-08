import { useCallback, useLayoutEffect, useState } from 'react';

export const useFloatingPosition = ({
  anchorRef,
  isOpen,
  offset = 4,
  direction = 'bottom-start',
}) => {
  const [position, setPosition] = useState(null);

  const calculatePosition = useCallback(() => {
    if (!anchorRef?.current) return;

    const rect = anchorRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (direction) {
      case 'bottom-start':
        top = rect.bottom + window.scrollY + offset;
        left = rect.left + window.scrollX;
        break;

      case 'bottom-end':
        top = rect.bottom + window.scrollY + offset;
        left = rect.right + window.scrollX;
        break;

      case 'top-start':
        top = rect.top + window.scrollY - offset;
        left = rect.left + window.scrollX;
        break;

      case 'top-end':
        top = rect.top + window.scrollY - offset;
        left = rect.right + window.scrollX;
        break;

      case 'right':
        top = rect.top + window.scrollY;
        left = rect.right + window.scrollX + offset;
        break;

      case 'left':
        top = rect.top + window.scrollY;
        left = rect.left + window.scrollX - offset;
        break;

      default:
        top = rect.bottom + window.scrollY + offset;
        left = rect.left + window.scrollX;
    }

    setPosition({ top, left });
  }, [anchorRef, direction, offset]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    calculatePosition();
  }, [isOpen, calculatePosition]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => calculatePosition();

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpen, calculatePosition]);

  return position;
};
