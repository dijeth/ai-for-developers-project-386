/**
 * Frontend UTC Date Utilities
 *
 * IMPORTANT: All communication with backend must use UTC.
 * These utilities help convert local browser time to UTC for API calls.
 *
 * RULES:
 * 1. Calendar/UI shows dates in local time (browser default)
 * 2. API calls use UTC strings (use toUTCDateString())
 * 3. Dates from API are parsed as UTC (use fromISO())
 */

/**
 * Converts a local Date to UTC ISO string for backend API.
 * Returns YYYY-MM-DDT00:00:00.000Z format.
 */
export function toUTCDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00.000Z`;
}

/**
 * Converts a local Date to UTC ISO string for end of day.
 * Returns YYYY-MM-DDT23:59:59.999Z format.
 */
export function toUTCEndOfDayString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}T23:59:59.999Z`;
}

/**
 * Parses an ISO string to Date (UTC).
 */
export function fromISO(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Gets current UTC time.
 */
export function utcNow(): Date {
  return new Date();
}

/**
 * Formats a date for local display (uses browser timezone).
 */
export function formatLocalDate(date: Date, locale = 'ru-RU'): string {
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

/**
 * Formats time for local display from ISO string.
 */
export function formatLocalTime(isoString: string, locale = 'ru-RU'): string {
  const date = fromISO(isoString);
  return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formats date+time for local display from ISO string.
 */
export function formatLocalDateTime(isoString: string, locale = 'ru-RU'): string {
  const date = fromISO(isoString);
  return date.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formats a long date for local display.
 */
export function formatLongDate(date: Date, locale = 'ru-RU'): string {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

/**
 * Formats a time range (start - end) for display.
 */
export function formatTimeRange(startISO: string, endISO: string, locale = 'ru-RU'): string {
  const start = fromISO(startISO);
  const end = fromISO(endISO);
  const startStr = start.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const endStr = end.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return `${startStr} - ${endStr}`;
}

/**
 * Adds months to a date.
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Checks if two dates are the same local day.
 */
export function isSameLocalDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Gets the start of local week (Sunday).
 */
export function startOfLocalWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets the end of local week (Saturday).
 */
export function endOfLocalWeek(date: Date): Date {
  const start = startOfLocalWeek(date);
  const result = new Date(start);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Gets the start of local month.
 */
export function startOfLocalMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Gets the end of local month.
 */
export function endOfLocalMonth(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Gets the start of local day.
 */
export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Gets day of week (0-6) for local timezone.
 */
export function getLocalDayOfWeek(date: Date): number {
  return date.getDay();
}
