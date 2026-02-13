/**
 * @returns {Date}
 */
export const oneYearFromNow = () =>
  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

/**
 * @returns {Date}
 */
export const thirtyDaysFromNow = () =>
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

/**
 * @returns {Date}
 */
export const thirtyDaysAgo = () =>
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

/**
 * @returns {Date}
 */
export const fifteenMinutesFromNow = () =>
  new Date(Date.now() + 15 * 60 * 1000);

/**
 * @returns {number}
 */
export const fiveMinutes = () => 5 * 60 * 1000;

/**
 * @returns {Date}
 */
export const fiveMinutesAgo = () => new Date(Date.now() - fiveMinutes());

/**
 * @returns {Date}
 */
export const oneMinuteAgo = () => new Date(Date.now() - 60 * 1000);

/**
 * @returns {Date}
 */
export const oneHourFromNow = () => new Date(Date.now() + 60 * 60 * 1000);

/**
 * Milliseconds in one day.
 * @type {number}
 */
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Check if a date is within the last N days.
 *
 * @param {Date|string|number} date
 * @param {number} days
 * @returns {boolean}
 */
export const isWithinLastDays = (date, days) => {
  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) return false;

  return Date.now() - timestamp < days * ONE_DAY_MS;
};
