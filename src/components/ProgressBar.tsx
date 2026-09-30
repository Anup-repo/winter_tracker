export function ProgressBar({
  value,
  max = 100,
  color,
  height = 8,
}: {
  value: number
  max?: number
  color?: string
  height?: number
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ background: 'var(--color-surface-2)', height }}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: color ?? 'var(--color-accent)' }}
      />
    </div>
  )
}
