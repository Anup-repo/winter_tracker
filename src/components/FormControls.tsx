import type { ReactNode } from 'react'
import type { TaskStatus } from '../db/types'

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {hint}
        </span>
      )}
    </label>
  )
}

const inputClass =
  'rounded-lg px-3 py-2 text-sm border outline-none focus:ring-2 transition-shadow w-full'
const inputStyle = {
  background: 'var(--color-surface-2)',
  borderColor: 'var(--color-border)',
  color: 'var(--color-text)',
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} style={inputStyle} />
}

export function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" {...props} className={`${inputClass} ${props.className ?? ''}`} style={inputStyle} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} ${props.className ?? ''}`} style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} />
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 border w-full text-sm"
      style={{ borderColor: 'var(--color-border)', background: checked ? 'var(--color-accent-soft)' : 'var(--color-surface-2)' }}
    >
      <span>{label}</span>
      <span
        className="w-9 h-5 rounded-full relative transition-colors shrink-0"
        style={{ background: checked ? 'var(--color-accent)' : 'var(--color-border)' }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: checked ? 18 : 2 }}
        />
      </span>
    </button>
  )
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'completed', label: 'Completed', color: 'var(--color-good)' },
  { value: 'minimum', label: 'Minimum', color: 'var(--color-ok)' },
  { value: 'missed', label: 'Missed', color: 'var(--color-bad)' },
  { value: 'na', label: 'N/A', color: 'var(--color-text-muted)' },
]

export function StatusPicker({ value, onChange }: { value?: TaskStatus; onChange: (v: TaskStatus) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="text-xs px-2.5 py-1.5 rounded-md border transition-colors"
          style={{
            borderColor: value === opt.value ? opt.color : 'var(--color-border)',
            background: value === opt.value ? opt.color : 'var(--color-surface-2)',
            color: value === opt.value ? '#0b0d10' : 'var(--color-text-muted)',
            fontWeight: value === opt.value ? 600 : 400,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/** Generic one-tap bucket picker — used for quick before-bed logging (water, steps, time buckets, etc). */
export function OptionPicker<T extends string>({
  value,
  options,
  onChange,
}: {
  value?: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="text-xs px-2.5 py-1.5 rounded-md border transition-colors"
          style={{
            borderColor: value === opt.value ? 'var(--color-accent)' : 'var(--color-border)',
            background: value === opt.value ? 'var(--color-accent)' : 'var(--color-surface-2)',
            color: value === opt.value ? '#0b0d10' : 'var(--color-text-muted)',
            fontWeight: value === opt.value ? 600 : 400,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
