import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  format,
} from 'date-fns'
import { Card } from '../../components/Card'
import { useSettings } from '../../lib/useSettings'
import { useAllDailyLogs } from '../../lib/useDailyLogs'
import { computeDailyScore, scoreColor } from '../../lib/scoring'
import { toKey, todayKey, winterArcDay } from '../../lib/dates'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function CalendarPage() {
  const [cursor, setCursor] = useState(new Date())
  const settings = useSettings()
  const logs = useAllDailyLogs()
  const navigate = useNavigate()

  const logsByDate = useMemo(() => new Map(logs.map((l) => [l.date, l])), [logs])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [cursor])

  if (!settings) return <div className="p-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading…</div>

  const today = todayKey()

  return (
    <div className="flex flex-col gap-5 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor((c) => subMonths(c, 1))} className="p-1.5 rounded-md border" style={{ borderColor: 'var(--color-border)' }}>
            <ChevronLeft size={16} />
          </button>
          <div className="text-sm font-medium w-32 text-center">{format(cursor, 'MMMM yyyy')}</div>
          <button onClick={() => setCursor((c) => addMonths(c, 1))} className="p-1.5 rounded-md border" style={{ borderColor: 'var(--color-border)' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const key = toKey(d)
            const inMonth = isSameMonth(d, cursor)
            const isFuture = key > today
            const log = logsByDate.get(key)
            const arcDay = winterArcDay(settings.winterArcStartDate, key)
            const inArc = arcDay >= 1 && arcDay <= 90
            const score = !isFuture && log ? computeDailyScore(log, settings.weights, settings.targets).score : null

            return (
              <button
                key={key}
                onClick={() => navigate(`/log/${key}`)}
                className="aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 border transition-transform hover:scale-[1.03]"
                style={{
                  borderColor: key === today ? 'var(--color-accent)' : 'var(--color-border)',
                  background: score != null ? scoreColor(score) : 'var(--color-surface-2)',
                  opacity: !inMonth ? 0.35 : score != null ? 0.35 + (score / 100) * 0.65 : inArc ? 0.9 : 0.5,
                }}
              >
                <span className="text-xs font-medium" style={{ color: score != null ? '#0b0d10' : 'var(--color-text)' }}>
                  {format(d, 'd')}
                </span>
                {score != null && (
                  <span className="text-[10px] font-semibold" style={{ color: '#0b0d10' }}>
                    {score}%
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      <Card title="Legend">
        <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <LegendDot color="var(--color-good)" label="100% — excellent" />
          <LegendDot color="#7fd88f" label="85%+ — strong" />
          <LegendDot color="var(--color-ok)" label="70%+ — acceptable" />
          <LegendDot color="var(--color-bad)" label="below 70% — needs improvement" />
        </div>
      </Card>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  )
}
