export const ONE_DAY_MS: number;

export function oneYearFromNow(): Date;
export function thirtyDaysFromNow(): Date;
export function thirtyDaysAgo(): Date;
export function fifteenMinutesFromNow(): Date;
export function fiveMinutes(): number;
export function fiveMinutesAgo(): Date;
export function oneMinuteAgo(): Date;
export function oneHourFromNow(): Date;

export function isWithinLastDays(
  date: Date | string | number,
  days: number
): boolean;
