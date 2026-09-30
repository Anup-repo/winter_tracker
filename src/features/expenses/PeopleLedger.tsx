import { useMemo, useState } from 'react'
import { Card } from '../../components/Card'
import { Field, NumberInput, TextArea, TextInput } from '../../components/FormControls'
import {
  useMoneyLedger,
  addLedgerEntry,
  updateLedgerEntry,
  deleteLedgerEntry,
  totalOwedToMe,
  totalIOwe,
} from '../../lib/useMoneyLedger'
import { ledgerRemaining, ledgerStatus, type LedgerType } from '../../db/types'
import { todayKey, formatPretty } from '../../lib/dates'
import { Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

export function PeopleLedger() {
  const entries = useMoneyLedger()
  const [form, setForm] = useState({
    type: 'lent' as LedgerType,
    person: '',
    amount: '',
    date: todayKey(),
    purpose: '',
    dueDate: '',
    notes: '',
  })
  const [settleAmount, setSettleAmount] = useState<Record<number, string>>({})

  const owedToMe = useMemo(() => totalOwedToMe(entries), [entries])
  const iOwe = useMemo(() => totalIOwe(entries), [entries])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.person.trim() || !amount || amount <= 0) return
    await addLedgerEntry({
      type: form.type,
      person: form.person.trim(),
      amount,
      date: form.date || todayKey(),
      purpose: form.purpose || undefined,
      dueDate: form.dueDate || undefined,
      amountSettled: 0,
      notes: form.notes || undefined,
    })
    setForm((f) => ({ ...f, person: '', amount: '', purpose: '', dueDate: '', notes: '' }))
  }

  async function handleSettle(id: number, currentSettled: number, max: number) {
    const raw = settleAmount[id]
    const addAmount = Number(raw)
    if (!addAmount || addAmount <= 0) return
    const next = Math.min(max, currentSettled + addAmount)
    await updateLedgerEntry(id, { amountSettled: next })
    setSettleAmount((s) => ({ ...s, [id]: '' }))
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Money owed to me</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--color-good)' }}>
            ₹{owedToMe.toLocaleString('en-IN')}
          </div>
        </Card>
        <Card>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Money I owe</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--color-bad)' }}>
            ₹{iOwe.toLocaleString('en-IN')}
          </div>
        </Card>
      </div>

      <Card title="Add person transaction">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Type">
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LedgerType }))}
              className="rounded-lg px-3 py-2 text-sm border outline-none w-full"
              style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <option value="lent">I gave / lent money</option>
              <option value="borrowed">I borrowed money</option>
            </select>
          </Field>
          <Field label="Person">
            <TextInput value={form.person} onChange={(e) => setForm((f) => ({ ...f, person: e.target.value }))} placeholder="Name" required />
          </Field>
          <Field label="Amount (₹)">
            <NumberInput value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
          </Field>
          <Field label="Date">
            <TextInput type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </Field>
          <Field label="Purpose">
            <TextInput value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} />
          </Field>
          <Field label={form.type === 'lent' ? 'Expected return date' : 'Due date'}>
            <TextInput type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
          </Field>
          <div className="col-span-2 sm:col-span-2">
            <TextArea placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="col-span-2 sm:col-span-4">
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--color-accent)', color: '#0b0d10' }}>
              Add
            </button>
          </div>
        </form>
      </Card>

      <Card title="Ledger">
        <div className="flex flex-col divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {entries.length === 0 && (
            <div className="text-sm py-4" style={{ color: 'var(--color-text-muted)' }}>No entries yet.</div>
          )}
          {entries.map((e) => {
            const remaining = ledgerRemaining(e)
            const status = ledgerStatus(e)
            const statusColor = status === 'settled' ? 'var(--color-good)' : status === 'partial' ? 'var(--color-ok)' : 'var(--color-bad)'
            return (
              <div key={e.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 text-sm">
                <div className="flex items-start gap-2">
                  {e.type === 'lent' ? (
                    <ArrowUpRight size={16} style={{ color: 'var(--color-good)' }} className="mt-0.5 shrink-0" />
                  ) : (
                    <ArrowDownLeft size={16} style={{ color: 'var(--color-bad)' }} className="mt-0.5 shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {e.person} · ₹{e.amount.toLocaleString('en-IN')}
                      {e.type === 'lent' ? ' given' : ' borrowed'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {formatPretty(e.date)}
                      {e.purpose ? ` · ${e.purpose}` : ''}
                      {e.dueDate ? ` · due ${formatPretty(e.dueDate)}` : ''}
                    </span>
                    <span className="text-xs mt-0.5">
                      <span style={{ color: statusColor }} className="font-medium capitalize">{status}</span>
                      {status !== 'settled' && (
                        <span style={{ color: 'var(--color-text-muted)' }}> · ₹{remaining.toLocaleString('en-IN')} remaining</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {status !== 'settled' && (
                    <>
                      <NumberInput
                        placeholder="Amount"
                        value={settleAmount[e.id!] ?? ''}
                        onChange={(ev) => setSettleAmount((s) => ({ ...s, [e.id!]: ev.target.value }))}
                        className="!w-24 !py-1"
                      />
                      <button
                        onClick={() => handleSettle(e.id!, e.amountSettled, e.amount)}
                        className="text-xs px-2.5 py-1.5 rounded-md border"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        {e.type === 'lent' ? 'Mark received' : 'Mark paid'}
                      </button>
                    </>
                  )}
                  <button onClick={() => e.id != null && deleteLedgerEntry(e.id)} style={{ color: 'var(--color-text-muted)' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
