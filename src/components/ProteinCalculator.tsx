import { useState } from 'react'
import { Field, NumberInput } from './FormControls'
import { PROTEIN_GOALS, calcProteinTarget } from '../lib/proteinCalc'

export function ProteinCalculator({ onApply }: { onApply: (grams: number) => void }) {
  const [weight, setWeight] = useState('')
  const [goal, setGoal] = useState(PROTEIN_GOALS[2].value) // muscle building default
  const selected = PROTEIN_GOALS.find((g) => g.value === goal) ?? PROTEIN_GOALS[0]
  const weightNum = Number(weight)
  const result = weightNum > 0 ? calcProteinTarget(weightNum, selected.gramsPerKg) : null

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Body weight (kg)">
          <NumberInput value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 70" />
        </Field>
        <Field label="Goal">
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm border outline-none w-full"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            {PROTEIN_GOALS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </Field>
      </div>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{selected.hint}</p>
      <div className="flex items-center justify-between rounded-lg px-3 py-2.5 border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
        <span className="text-sm">Recommended daily protein</span>
        <span className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>
          {result != null ? `${result} g` : '—'}
        </span>
      </div>
      <button
        type="button"
        disabled={result == null}
        onClick={() => result != null && onApply(result)}
        className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
        style={{ background: 'var(--color-accent)', color: '#0b0d10' }}
      >
        Use as daily protein target
      </button>
      <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
        Rule-of-thumb estimate based on common g/kg bodyweight guidance — not medical advice. Adjust to what works for you.
      </p>
    </div>
  )
}
