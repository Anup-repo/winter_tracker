import { differenceInCalendarDays, format, parseISO, addDays, isValid } from 'date-fns'

export const DATE_FMT = 'yyyy-MM-dd'

export function todayKey(): string {
  return format(new Date(), DATE_FMT)
}

export function toKey(d: Date): string {
  return format(d, DATE_FMT)
}

/** Never throws — falls back to today if `key` is missing/malformed (e.g. a cleared date input). */
export function fromKey(key: string | undefined | null): Date {
  const parsed = key ? parseISO(key) : null
  return parsed && isValid(parsed) ? parsed : new Date()
}

export function isValidKey(key: string | undefined | null): boolean {
  return !!key && isValid(parseISO(key))
}

/** Day X of the 90-day Winter Arc for a given date key (1-indexed). Can be <1 or >90. */
export function winterArcDay(startDateKey: string, dateKey: string): number {
  return differenceInCalendarDays(fromKey(dateKey), fromKey(startDateKey)) + 1
}

export function addDaysToKey(key: string, days: number): string {
  return toKey(addDays(fromKey(key), days))
}

export function formatPretty(key: string): string {
  return format(fromKey(key), 'EEE, d MMM yyyy')
}

export function last90DaysRange(startDateKey: string): { start: string; end: string } {
  return { start: startDateKey, end: addDaysToKey(startDateKey, 89) }
}

/** "23:30" -> "11:30 PM" */
export function formatTime12h(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':')
  const h = Number(hStr)
  const m = Number(mStr)
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}
