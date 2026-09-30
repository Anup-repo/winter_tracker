import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { DEFAULT_SETTINGS, type AppSettings } from '../db/types'
import { addDaysToKey, todayKey } from './dates'

let ensured = false

async function ensureSettings(): Promise<AppSettings> {
  const existing = await db.settings.get('singleton')
  if (existing) return existing
  // Day 1 defaults to tomorrow so today is spent setting up, not scored as a missed day.
  const fresh: AppSettings = { ...DEFAULT_SETTINGS, winterArcStartDate: addDaysToKey(todayKey(), 1) }
  await db.settings.put(fresh)
  return fresh
}

export function useSettings(): AppSettings | undefined {
  if (!ensured) {
    ensured = true
    void ensureSettings()
  }
  return useLiveQuery(() => db.settings.get('singleton'), [], undefined)
}

export async function updateSettings(patch: Partial<AppSettings>) {
  const current = await ensureSettings()
  await db.settings.put({ ...current, ...patch })
}
