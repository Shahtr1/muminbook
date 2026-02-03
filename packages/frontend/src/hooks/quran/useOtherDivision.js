import { useMemo } from 'react';

/**
 * Manzil (7 sections)
 */
export const useManzil = () => {
  return useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        uuid: i + 1,
        number: i + 1,
        label: `Manzil ${i + 1}`,
      })),
    []
  );
};

/**
 * Hizb (60 sections)
 */
export const useHizb = () => {
  return useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        uuid: i + 1,
        number: i + 1,
        label: `Hizb ${i + 1}`,
      })),
    []
  );
};

/**
 * Ruku (558 sections)
 */
export const useRuku = () => {
  return useMemo(
    () =>
      Array.from({ length: 558 }, (_, i) => ({
        uuid: i + 1,
        number: i + 1,
        label: `Ruku ${i + 1}`,
      })),
    []
  );
};
