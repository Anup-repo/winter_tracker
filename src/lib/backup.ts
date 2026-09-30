import { db } from '../db/db'
import type { AppSettings, DailyLog, Expense, MoneyLedgerEntry } from '../db/types'

export interface BackupPayload {
  meta: { app: 'winter-arc'; version: number; exportedAt: string }
  settings: AppSettings[]
  dailyLogs: DailyLog[]
  expenses: Expense[]
  moneyLedger: MoneyLedgerEntry[]
}

export async function exportAllData(): Promise<BackupPayload> {
  const [settings, dailyLogs, expenses, moneyLedger] = await Promise.all([
    db.settings.toArray(),
    db.dailyLogs.toArray(),
    db.expenses.toArray(),
    db.moneyLedger.toArray(),
  ])
  return {
    meta: { app: 'winter-arc', version: 2, exportedAt: new Date().toISOString() },
    settings,
    dailyLogs,
    expenses,
    moneyLedger,
  }
}

export function downloadBackup(payload: BackupPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = payload.meta.exportedAt.slice(0, 10)
  a.href = url
  a.download = `winter-arc-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function isValidBackup(data: unknown): data is BackupPayload {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return d.meta != null && (d.meta as { app?: string }).app === 'winter-arc' && Array.isArray(d.dailyLogs)
}

export async function importAllData(payload: BackupPayload) {
  await db.transaction('rw', db.settings, db.dailyLogs, db.expenses, db.moneyLedger, async () => {
    await Promise.all([db.settings.clear(), db.dailyLogs.clear(), db.expenses.clear(), db.moneyLedger.clear()])
    await db.settings.bulkPut(payload.settings)
    await db.dailyLogs.bulkPut(payload.dailyLogs)
    await db.expenses.bulkPut(payload.expenses)
    if (payload.moneyLedger?.length) await db.moneyLedger.bulkPut(payload.moneyLedger)
  })
}

export async function clearAllData() {
  await db.transaction('rw', db.settings, db.dailyLogs, db.expenses, db.moneyLedger, async () => {
    await Promise.all([db.settings.clear(), db.dailyLogs.clear(), db.expenses.clear(), db.moneyLedger.clear()])
  })
}
