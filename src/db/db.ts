import Dexie, { type Table } from 'dexie'
import type { AppSettings, DailyLog, Expense, MoneyLedgerEntry } from './types'

export class WinterArcDB extends Dexie {
  settings!: Table<AppSettings, string>
  dailyLogs!: Table<DailyLog, string>
  expenses!: Table<Expense, number>
  moneyLedger!: Table<MoneyLedgerEntry, number>

  constructor() {
    super('WinterArcDB')
    this.version(1).stores({
      settings: 'id',
      dailyLogs: 'date',
      expenses: '++id, date, category',
    })
    this.version(2).stores({
      settings: 'id',
      dailyLogs: 'date',
      expenses: '++id, date, category',
      moneyLedger: '++id, date, type, person',
    })
  }
}

export const db = new WinterArcDB()

export const ALL_TABLE_NAMES = ['settings', 'dailyLogs', 'expenses', 'moneyLedger'] as const
