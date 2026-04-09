/**
 * UTC Date Utilities
 *
 * All dates in this backend are handled in UTC only.
 * These utilities enforce UTC-only operations and prevent accidental
 * usage of local time methods.
 *
 * RULES:
 * 1. Always use `utcNow()` instead of `new Date()` to get current time
 * 2. Always use UTC-specific methods (.getUTC*(), .setUTC*())
 * 3. Never use local time methods (.getHours(), .setDate(), etc.)
 */

/**
 * Gets current time in UTC.
 * Use this instead of `new Date()` to ensure UTC context.
 */
export function utcNow(): Date {
  return new Date();
}

/**
 * Creates a Date object from an ISO 8601 string.
 * Assumes the string is in UTC or has explicit timezone.
 */
export function fromISO(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Converts a Date to ISO 8601 UTC string.
 */
export function toISO(date: Date): string {
  return date.toISOString();
}

/**
 * Gets UTC year from a date.
 */
export function getUTCYear(date: Date): number {
  return date.getUTCFullYear();
}

/**
 * Gets UTC month (0-11) from a date.
 */
export function getUTCMonth(date: Date): number {
  return date.getUTCMonth();
}

/**
 * Gets UTC day of month (1-31) from a date.
 */
export function getUTCDate(date: Date): number {
  return date.getUTCDate();
}

/**
 * Gets UTC day of week (0-6, Sun-Sat) from a date.
 */
export function getUTCDay(date: Date): number {
  return date.getUTCDay();
}

/**
 * Gets UTC hours (0-23) from a date.
 */
export function getUTCHours(date: Date): number {
  return date.getUTCHours();
}

/**
 * Gets UTC minutes (0-59) from a date.
 */
export function getUTCMinutes(date: Date): number {
  return date.getUTCMinutes();
}

/**
 * Sets UTC hours on a date. Returns the modified date for chaining.
 */
export function setUTCHours(date: Date, hours: number, minutes?: number, seconds?: number, ms?: number): Date {
  date.setUTCHours(hours, minutes ?? 0, seconds ?? 0, ms ?? 0);
  return date;
}

/**
 * Sets UTC year, month, day on a date. Returns the modified date for chaining.
 * Month is 0-indexed (0 = January).
 */
export function setUTCDate(date: Date, year: number, month: number, day: number): Date {
  date.setUTCFullYear(year, month, day);
  return date;
}

/**
 * Adds days to a date (UTC). Returns the modified date for chaining.
 */
export function addUTCDays(date: Date, days: number): Date {
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(date.getTime() + ms);
}

/**
 * Adds months to a date (UTC). Returns a new date.
 */
export function addUTCMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

/**
 * Gets start of day in UTC (00:00:00.000).
 */
export function startOfUTCDay(date: Date): Date {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets end of day in UTC (23:59:59.999).
 */
export function endOfUTCDay(date: Date): Date {
  const result = new Date(date);
  result.setUTCHours(23, 59, 59, 999);
  return result;
}

/**
 * Gets start of UTC week (Sunday 00:00:00.000).
 */
export function startOfUTCWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getUTCDay();
  result.setUTCDate(result.getUTCDate() - day);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

/**
 * Checks if date A is before date B (comparing UTC timestamps).
 */
export function isUTCBefore(a: Date, b: Date): boolean {
  return a.getTime() < b.getTime();
}

/**
 * Checks if date A is after date B (comparing UTC timestamps).
 */
export function isUTCAfter(a: Date, b: Date): boolean {
  return a.getTime() > b.getTime();
}

/**
 * Checks if two dates are the same UTC day.
 */
export function isSameUTCDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/**
 * Checks if a date is in the past (relative to UTC now).
 */
export function isUTCPast(date: Date): boolean {
  return date.getTime() < utcNow().getTime();
}

/**
 * Checks if a date is in the future (relative to UTC now).
 */
export function isUTCFuture(date: Date): boolean {
  return date.getTime() > utcNow().getTime();
}

/**
 * Formats a date as YYYY-MM-DD in UTC.
 */
export function formatUTCDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date as HH:MM in UTC.
 */
export function formatUTCTime(date: Date): string {
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
