import { useMemo, useState } from 'react'
import { Card } from '../../components/Card'
import { Field, NumberInput, TextArea, TextInput, Toggle } from '../../components/FormControls'
import { useAllExpenses, addExpense, deleteExpense } from '../../lib/useExpenses'
import { useMoneyLedger, totalOwedToMe, totalIOwe } from '../../lib/useMoneyLedger'
import { DEFAULT_EXPENSE_CATEGORIES, type NeedWant } from '../../db/types'
import { todayKey, formatPretty } from '../../lib/dates'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { Trash2 } from 'lucide-react'
import { PeopleLedger } from './PeopleLedger'

const PAYMENT_METHODS = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Net Banking', 'Other']

type Tab = 'expenses' | 'people'

export function ExpensesPage() {
  const [tab, setTab] = useState<Tab>('expenses')
  const expenses = useAllExpenses()
  const ledger = useMoneyLedger()
  const [form, setForm] = useState({
    date: todayKey(),
    amount: '',
    category: DEFAULT_EXPENSE_CATEGORIES[0],
    subcategory: '',
    paymentMethod: PAYMENT_METHODS[0],
    merchant: '',
    description: '',
    needWant: 'need' as NeedWant,
    recurring: false,
    notes: '',
  })

  const monthPrefix = todayKey().slice(0, 7)
  const thisMonth = useMemo(() => expenses.filter((e) => e.date.startsWith(monthPrefix)), [expenses, monthPrefix])
  const monthTotal = thisMonth.reduce((s, e) => s + e.amount, 0)
  const owedToMe = useMemo(() => totalOwedToMe(ledger), [ledger])
  const iOwe = useMemo(() => totalIOwe(ledger), [ledger])

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of thisMonth) map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [thisMonth])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!amount || amount <= 0) return
    await addExpense({
      date: form.date || todayKey(),
      amount,
      category: form.category,
      subcategory: form.subcategory || undefined,
      paymentMethod: form.paymentMethod || undefined,
      merchant: form.merchant || undefined,
      description: form.description || undefined,
      needWant: form.needWant,
      recurring: form.recurring,
      notes: form.notes || undefined,
    })
    setForm((f) => ({ ...f, amount: '', subcategory: '', merchant: '', description: '', notes: '' }))
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold">Money</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>This month's spending</div>
          <div className="text-2xl font-bold mt-1">₹{monthTotal.toLocaleString('en-IN')}</div>
        </Card>
        <Card>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Transactions</div>
          <div className="text-2xl font-bold mt-1">{thisMonth.length}</div>
        </Card>
        <Card>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Money owed to me</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--color-good)' }}>₹{owedToMe.toLocaleString('en-IN')}</div>
        </Card>
        <Card>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Money I owe</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--color-bad)' }}>₹{iOwe.toLocaleString('en-IN')}</div>
        </Card>
      </div>

      <div className="flex gap-1.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <TabButton active={tab === 'expenses'} onClick={() => setTab('expenses')} label="Expenses" />
        <TabButton active={tab === 'people'} onClick={() => setTab('people')} label="People" />
      </div>

      {tab === 'expenses' ? (
        <>
          <Card title="Add expense">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Date">
                <TextInput type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </Field>
              <Field label="Amount (₹)">
                <NumberInput value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
              </Field>
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="rounded-lg px-3 py-2 text-sm border outline-none w-full"
                  style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  {DEFAULT_EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Subcategory">
                <TextInput value={form.subcategory} onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))} />
              </Field>
              <Field label="Payment method">
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                  className="rounded-lg px-3 py-2 text-sm border outline-none w-full"
                  style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </Field>
              <Field label="Merchant">
                <TextInput value={form.merchant} onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))} />
              </Field>
              <Field label="Description">
                <TextInput value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </Field>
              <Field label="Need / Want">
                <select
                  value={form.needWant}
                  onChange={(e) => setForm((f) => ({ ...f, needWant: e.target.value as NeedWant }))}
                  className="rounded-lg px-3 py-2 text-sm border outline-none w-full"
                  style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  <option value="need">Need</option>
                  <option value="want">Want</option>
                </select>
              </Field>
              <div className="col-span-2 sm:col-span-2">
                <Toggle label="Recurring" checked={form.recurring} onChange={(v) => setForm((f) => ({ ...f, recurring: v }))} />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <TextArea placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="col-span-2 sm:col-span-4">
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--color-accent)', color: '#0b0d10' }}>
                  Add expense
                </button>
              </div>
            </form>
          </Card>

          {byCategory.length > 0 && (
            <Card title="This month by category">
              <ResponsiveContainer width="100%" height={Math.max(160, byCategory.length * 32)}>
                <BarChart data={byCategory} layout="vertical" margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} stroke="var(--color-border)" />
                  <YAxis dataKey="category" type="category" width={100} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} stroke="var(--color-border)" />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Spent']}
                  />
                  <Bar dataKey="amount" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          <Card title="Recent transactions">
            <div className="flex flex-col divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {expenses.length === 0 && (
                <div className="text-sm py-4" style={{ color: 'var(--color-text-muted)' }}>No expenses logged yet.</div>
              )}
              {expenses.slice(0, 100).map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2.5 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {e.category}
                      {e.subcategory ? ` · ${e.subcategory}` : ''}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {formatPretty(e.date)} {e.merchant ? `· ${e.merchant}` : ''} {e.description ? `· ${e.description}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">₹{e.amount.toLocaleString('en-IN')}</span>
                    <button onClick={() => e.id != null && deleteExpense(e.id)} style={{ color: 'var(--color-text-muted)' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <PeopleLedger />
      )}
    </div>
  )
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 text-sm font-medium -mb-px border-b-2 transition-colors"
      style={{
        borderColor: active ? 'var(--color-accent)' : 'transparent',
        color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
      }}
    >
      {label}
    </button>
  )
}
