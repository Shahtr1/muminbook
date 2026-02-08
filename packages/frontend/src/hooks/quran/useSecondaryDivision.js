import { useMemo } from 'react';

/**
 * Manzil (7 sections)
 */
export const useManzil = (structureManzils = []) => {
  return useMemo(() => {
    const map = new Map(structureManzils.map((m) => [m.manzil, m.totalAyat]));

    return {
      manzils: Array.from({ length: 7 }, (_, i) => {
        const number = i + 1;

        return {
          uuid: number,
          number,
          label: `Manzil ${number}`,
          totalAyat: map.get(number) ?? 0,
        };
      }),
    };
  }, [structureManzils]);
};

/**
 * Hizb (60 sections)
 */
export const useHizb = (structureHizbs = []) => {
  return useMemo(() => {
    const map = new Map(structureHizbs.map((h) => [h.hizb, h.totalAyat]));

    return {
      hizbs: Array.from({ length: 60 }, (_, i) => {
        const number = i + 1;

        return {
          uuid: number,
          number,
          label: `Hizb ${number}`,
          totalAyat: map.get(number) ?? 0,
        };
      }),
    };
  }, [structureHizbs]);
};

/**
 * Ruku (~558 sections)
 */
export const useRuku = (structureRukus = []) => {
  return useMemo(() => {
    const map = new Map(structureRukus.map((r) => [r.ruku, r.totalAyat]));

    return {
      rukus: Array.from({ length: 558 }, (_, i) => {
        const number = i + 1;

        return {
          uuid: number,
          number,
          label: `Ruku ${number}`,
          totalAyat: map.get(number) ?? 0,
        };
      }),
    };
  }, [structureRukus]);
};
