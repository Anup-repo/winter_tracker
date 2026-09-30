import { scoreColor } from '../lib/scoring'
import { formatPretty } from '../lib/dates'

export interface HeatmapDay {
  date: string
  score: number | null
}

export function Heatmap({ days, onSelect }: { days: HeatmapDay[]; onSelect?: (date: string) => void }) {
  return (
    <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-15">
      {days.map((d) => (
        <button
          key={d.date}
          title={`${formatPretty(d.date)}${d.score != null ? ` — ${d.score}%` : ' — no data'}`}
          onClick={() => onSelect?.(d.date)}
          className="aspect-square rounded-[4px] transition-transform hover:scale-110"
          style={{
            background: d.score == null ? 'var(--color-surface-2)' : scoreColor(d.score),
            opacity: d.score == null ? 1 : 0.35 + (d.score / 100) * 0.65,
          }}
        />
      ))}
    </div>
  )
}
