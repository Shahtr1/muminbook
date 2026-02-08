const QuranDivisionType = Object.freeze({
  Surah: 'surah',
  Juz: 'juz',
  Manzil: 'manzil',
  Ruku: 'ruku',
  Hizb: 'hizb',
});

/**
 * Ordered list for iteration (UI rendering)
 */
export const QURAN_DIVISION_TYPES = Object.freeze([
  QuranDivisionType.Surah,
  QuranDivisionType.Juz,
  QuranDivisionType.Manzil,
  QuranDivisionType.Ruku,
  QuranDivisionType.Hizb,
]);

/**
 * Optional label mapping (clean UI separation)
 */
export const QURAN_DIVISION_LABELS = Object.freeze({
  [QuranDivisionType.Surah]: 'Surah',
  [QuranDivisionType.Juz]: 'Juz',
  [QuranDivisionType.Manzil]: 'Manzil',
  [QuranDivisionType.Ruku]: 'Ruku',
  [QuranDivisionType.Hizb]: 'Hizb',
});

export default QuranDivisionType;
