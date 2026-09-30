import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { Expense } from '../db/types'

export function useAllExpenses(): Expense[] {
  return useLiveQuery(() => db.expenses.orderBy('date').reverse().toArray(), []) ?? []
}

export async function addExpense(expense: Expense) {
  await db.expenses.add(expense)
}

export async function updateExpense(id: number, patch: Partial<Expense>) {
  await db.expenses.update(id, patch)
}

export async function deleteExpense(id: number) {
  await db.expenses.delete(id)
}
