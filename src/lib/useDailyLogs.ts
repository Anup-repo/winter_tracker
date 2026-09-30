import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { DailyLog } from '../db/types'

export function useDailyLog(date: string): DailyLog | undefined {
  return useLiveQuery(() => db.dailyLogs.get(date), [date])
}

const LOADING = Symbol('loading')

/** Distinguishes "still loading" from "loaded, no record for this date" — plain undefined can't. */
export function useDailyLogWithLoading(date: string): { log: DailyLog | undefined; loading: boolean } {
  const result = useLiveQuery(
    () => db.dailyLogs.get(date),
    [date],
    LOADING as unknown as DailyLog | undefined,
  )
  if ((result as unknown) === LOADING) return { log: undefined, loading: true }
  return { log: result, loading: false }
}

export async function saveDailyLog(date: string, patch: Partial<DailyLog>) {
  const existing = await db.dailyLogs.get(date)
  await db.dailyLogs.put({ ...(existing ?? { date }), ...patch, date })
}

export function useDailyLogsInRange(startKey: string, endKey: string): DailyLog[] {
  return (
    useLiveQuery(
      () => db.dailyLogs.where('date').between(startKey, endKey, true, true).toArray(),
      [startKey, endKey],
    ) ?? []
  )
}

export function useAllDailyLogs(): DailyLog[] {
  return useLiveQuery(() => db.dailyLogs.toArray(), []) ?? []
}
