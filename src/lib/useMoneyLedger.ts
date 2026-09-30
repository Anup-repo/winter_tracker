import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { ledgerRemaining, type MoneyLedgerEntry } from '../db/types'

export function useMoneyLedger(): MoneyLedgerEntry[] {
  return useLiveQuery(() => db.moneyLedger.orderBy('date').reverse().toArray(), []) ?? []
}

export async function addLedgerEntry(entry: MoneyLedgerEntry) {
  await db.moneyLedger.add(entry)
}

export async function updateLedgerEntry(id: number, patch: Partial<MoneyLedgerEntry>) {
  await db.moneyLedger.update(id, patch)
}

export async function deleteLedgerEntry(id: number) {
  await db.moneyLedger.delete(id)
}

export function totalOwedToMe(entries: MoneyLedgerEntry[]): number {
  return entries.filter((e) => e.type === 'lent').reduce((sum, e) => sum + ledgerRemaining(e), 0)
}

export function totalIOwe(entries: MoneyLedgerEntry[]): number {
  return entries.filter((e) => e.type === 'borrowed').reduce((sum, e) => sum + ledgerRemaining(e), 0)
}
