export const oneYearFromNow = () =>
  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

export const thirtyDaysFromNow = () =>
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

export const thirtyDaysAgo = () =>
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

export const fifteenMinutesFromNow = () =>
  new Date(Date.now() + 15 * 60 * 1000);

export const fiveMinutes = () => 5 * 60 * 1000;

export const fiveMinutesAgo = () => new Date(Date.now() - fiveMinutes());

export const oneMinuteAgo = () => new Date(Date.now() - 60 * 1000);

export const oneHourFromNow = () => new Date(Date.now() + 60 * 60 * 1000);

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const isWithinLastDays = (date: Date, days: number) => {
  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) return false;

  return Date.now() - timestamp < days * ONE_DAY_MS;
};
