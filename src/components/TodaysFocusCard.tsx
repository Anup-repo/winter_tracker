import { Card } from './Card'
import type { DailyPlan } from '../lib/dailyPlan'
import { formatTime12h } from '../lib/dates'

export function TodaysFocusCard({ plan }: { plan: DailyPlan }) {
  const rows: { emoji: string; label: string; value: string }[] = [
    { emoji: '🧠', label: 'Learn', value: plan.knowledgeTopic },
    { emoji: '🧩', label: 'DSA', value: plan.dsaTopic },
    { emoji: '🏗️', label: 'LLD', value: plan.lldTopic },
    { emoji: '🏋️', label: 'Gym', value: plan.gymFocus },
    { emoji: '📖', label: 'Read', value: `${plan.readingTargetMin} min` },
    { emoji: '🗣️', label: 'Communication', value: `${plan.commTargetMin} min` },
    { emoji: '🚶', label: 'Steps', value: plan.stepsTarget.toLocaleString() },
    { emoji: '😴', label: 'Sleep', value: `${formatTime12h(plan.sleepBedtime)} → ${formatTime12h(plan.sleepWake)}` },
  ]

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold tracking-widest" style={{ color: 'var(--color-accent)' }}>
          TODAY'S FOCUS · DAY {plan.arcDay > 0 ? plan.arcDay : '—'}
        </div>
        <div className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Today's target: 100%
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2 text-sm">
            <span>{r.emoji}</span>
            <span>
              <span style={{ color: 'var(--color-text-muted)' }}>{r.label}: </span>
              <span className="font-medium">{r.value}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
