import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/Card'
import { ProgressBar } from '../../components/ProgressBar'
import { StatTile } from '../../components/StatTile'
import { Heatmap } from '../../components/Heatmap'
import { useSettings } from '../../lib/useSettings'
import { useAllDailyLogs, useDailyLog } from '../../lib/useDailyLogs'
import { useAllExpenses } from '../../lib/useExpenses'
import { useMoneyLedger, totalOwedToMe, totalIOwe } from '../../lib/useMoneyLedger'
import { computeArcStats } from '../../lib/arcStats'
import { computeDailyScore, scoreColor } from '../../lib/scoring'
import { todayKey, formatPretty } from '../../lib/dates'
import { getCurrentKnowledgeTopic } from '../../lib/knowledgeTopics'
import { getTodaysPlan } from '../../lib/dailyPlan'
import { TodaysFocusCard } from '../../components/TodaysFocusCard'
import { Dumbbell, Footprints, Droplet, Beef, Moon, BookOpen, MessageCircle, Sparkles, Wallet } from 'lucide-react'

export function Dashboard() {
  const settings = useSettings()
  const logs = useAllDailyLogs()
  const today = todayKey()
  const todayLog = useDailyLog(today)
  const expenses = useAllExpenses()
  const ledger = useMoneyLedger()
  const navigate = useNavigate()

  const stats = useMemo(() => (settings ? computeArcStats(logs, settings) : null), [logs, settings])

  const scoreBreakdown = useMemo(
    () => (settings ? computeDailyScore(todayLog, settings.weights, settings.targets) : null),
    [todayLog, settings],
  )

  const monthPrefix = today.slice(0, 7)
  const monthlySpend = useMemo(
    () => expenses.filter((e) => e.date.startsWith(monthPrefix)).reduce((sum, e) => sum + e.amount, 0),
    [expenses, monthPrefix],
  )
  const todaysSpend = useMemo(
    () => expenses.filter((e) => e.date === today).reduce((sum, e) => sum + e.amount, 0),
    [expenses, today],
  )
  const owedToMe = useMemo(() => totalOwedToMe(ledger), [ledger])
  const iOwe = useMemo(() => totalIOwe(ledger), [ledger])

  if (!settings || !stats) {
    return <div className="p-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading…</div>
  }

  const arcDayLabel =
    stats.arcDay < 1 ? 'Not started yet' : stats.arcDay > 90 ? 'Day 90 / 90 — Arc complete' : `Day ${stats.arcDay} / 90`

  const topic = getCurrentKnowledgeTopic(stats.arcDay)
  const plan = getTodaysPlan(stats.arcDay, settings.targets)

  return (
    <div className="flex flex-col gap-5 p-6 max-w-6xl mx-auto">
      <TodaysFocusCard plan={plan} />

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs tracking-widest font-medium" style={{ color: 'var(--color-accent)' }}>
              WINTER ARC
            </div>
            <div className="text-3xl font-bold mt-1">{arcDayLabel}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {formatPretty(today)} · {stats.daysRemaining} days remaining
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Today's completion
            </div>
            <div className="text-4xl font-bold" style={{ color: scoreColor(stats.todayScore ?? 0) }}>
              {stats.todayScore ?? '—'}
              {stats.todayScore != null && '%'}
            </div>
          </div>
        </div>
        <ProgressBar value={stats.daysCompleted} max={90} color="var(--color-accent)" />
      </div>

      {/* Averages row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <StatTile label="7-day avg" value={stats.avg7 != null ? `${stats.avg7}%` : '—'} />
        </Card>
        <Card>
          <StatTile label="30-day avg" value={stats.avg30 != null ? `${stats.avg30}%` : '—'} />
        </Card>
        <Card>
          <StatTile label="90-day avg" value={stats.avgOverall != null ? `${stats.avgOverall}%` : '—'} />
        </Card>
        <Card>
          <div className="flex justify-between">
            <StatTile label="Current streak" value={`${stats.currentStreak}d`} />
            <StatTile label="Best streak" value={`${stats.bestStreak}d`} />
          </div>
        </Card>
      </div>

      {/* Category sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Career" action={<QuickLink onClick={() => navigate('/log')} />}>
          <div className="flex flex-col gap-3">
            <StatusRow label="DSA" status={todayLog?.dsa?.status} topic={todayLog?.dsa?.topic} />
            <StatusRow label="LLD" status={todayLog?.lld?.status} topic={todayLog?.lld?.topic} />
          </div>
        </Card>

        <Card title="Body" action={<QuickLink onClick={() => navigate('/log')} />}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatTile
              icon={<Dumbbell size={14} />}
              label="Gym"
              value={todayLog?.gym?.isRestDay ? 'Rest day' : todayLog?.gym?.done ? 'Done' : 'Pending'}
            />
            <StatTile
              icon={<Footprints size={14} />}
              label="Steps"
              value={todayLog?.steps?.bucket ?? '—'}
            />
            <StatTile
              icon={<Droplet size={14} />}
              label="Water"
              value={todayLog?.water?.bucket ?? '—'}
            />
            <StatTile
              icon={<Beef size={14} />}
              label="Protein"
              value={`${todayLog?.protein?.grams ?? 0}g / ${settings.targets.proteinG}g`}
            />
            <StatTile
              icon={<Moon size={14} />}
              label="Sleep"
              value={todayLog?.sleep?.durationHours != null ? `${todayLog.sleep.durationHours}h` : '—'}
            />
          </div>
        </Card>

        <Card title="Mind" action={<QuickLink onClick={() => navigate('/log')} />}>
          <div className="grid grid-cols-2 gap-4">
            <StatTile
              icon={<BookOpen size={14} />}
              label="Reading"
              value={todayLog?.reading?.minutes != null ? `${todayLog.reading.minutes} min` : '—'}
              sub={todayLog?.reading?.book}
            />
            <StatTile
              icon={<MessageCircle size={14} />}
              label="Communication"
              value={todayLog?.communication?.minutes != null ? `${todayLog.communication.minutes} min` : '—'}
              sub={todayLog?.communication?.topic}
            />
          </div>
        </Card>

        <Card title="Knowledge">
          <StatTile icon={<Sparkles size={14} />} label="Current topic" value={topic} sub={`Week ${Math.max(1, Math.ceil(stats.arcDay / 7))} of 13`} />
        </Card>
      </div>

      {/* Money */}
      <Card title="Money" action={<QuickLink onClick={() => navigate('/expenses')} />}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile icon={<Wallet size={14} />} label="Today's spending" value={`₹${todaysSpend.toLocaleString('en-IN')}`} />
          <StatTile icon={<Wallet size={14} />} label="Monthly spending" value={`₹${monthlySpend.toLocaleString('en-IN')}`} />
          <StatTile label="Money owed to me" value={`₹${owedToMe.toLocaleString('en-IN')}`} />
          <StatTile label="Money I owe" value={`₹${iOwe.toLocaleString('en-IN')}`} />
        </div>
      </Card>

      {/* Heatmap */}
      <Card title="90-day heatmap">
        <Heatmap days={stats.heatmap} onSelect={(date) => navigate(`/log/${date}`)} />
      </Card>

      {/* Breakdown of today's score */}
      {scoreBreakdown && (
        <Card title="Today's score breakdown">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            {scoreBreakdown.breakdown.map((b) => (
              <div key={b.key} className="flex flex-col gap-1">
                <span style={{ color: 'var(--color-text-muted)' }} className="capitalize">
                  {b.key}
                </span>
                <span className="font-medium">
                  {b.ratio == null ? 'N/A' : `${Math.round(b.ratio * 100)}%`}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function QuickLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-medium px-2 py-1 rounded-md"
      style={{ color: 'var(--color-accent)' }}
    >
      Log →
    </button>
  )
}

function StatusRow({ label, status, topic }: { label: string; status?: string; topic?: string }) {
  const color =
    status === 'completed' ? 'var(--color-good)' : status === 'minimum' ? 'var(--color-ok)' : status === 'missed' ? 'var(--color-bad)' : 'var(--color-text-muted)'
  const text = status === 'na' ? 'N/A' : status ? status[0].toUpperCase() + status.slice(1) : 'Not logged'
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">
        {label}
        {topic && <span style={{ color: 'var(--color-text-muted)' }}> · {topic}</span>}
      </span>
      <span className="text-sm font-medium" style={{ color }}>{text}</span>
    </div>
  )
}
