import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '../../components/Card'
import { Field, NumberInput, OptionPicker, StatusPicker, TextArea, TextInput, Toggle } from '../../components/FormControls'
import { useSettings } from '../../lib/useSettings'
import { useDailyLogWithLoading } from '../../lib/useDailyLogs'
import { db } from '../../db/db'
import { TIME_BUCKET_OPTIONS, WATER_BUCKET_OPTIONS, STEPS_BUCKET_OPTIONS, type DailyLog } from '../../db/types'
import { addDaysToKey, formatPretty, todayKey, winterArcDay } from '../../lib/dates'
import { computeDailyScore, scoreColor } from '../../lib/scoring'
import { getCurrentKnowledgeTopic } from '../../lib/knowledgeTopics'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function emptyLog(date: string): DailyLog {
  return { date }
}

export function DailyLogPage() {
  const { date: dateParam } = useParams()
  const date = dateParam ?? todayKey()
  const navigate = useNavigate()
  const settings = useSettings()
  const { log, loading } = useDailyLogWithLoading(date)

  const [draft, setDraft] = useState<DailyLog>(emptyLog(date))
  const loadedRef = useRef<string | null>(null)
  const initialSnapshotRef = useRef<string>('')

  useEffect(() => {
    if (loading || loadedRef.current === date) return
    const initial = log ?? emptyLog(date)
    setDraft(initial)
    loadedRef.current = date
    initialSnapshotRef.current = JSON.stringify(initial)
  }, [date, log, loading])

  useEffect(() => {
    if (loadedRef.current !== date) return
    if (JSON.stringify(draft) === initialSnapshotRef.current) return // nothing edited yet — don't create a phantom record
    const t = setTimeout(() => {
      void db.dailyLogs.put({ ...draft, date })
    }, 300)
    return () => clearTimeout(t)
  }, [draft, date])

  function patch<K extends keyof DailyLog>(key: K, value: DailyLog[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  if (!settings) return <div className="p-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading…</div>

  const arcDay = winterArcDay(settings.winterArcStartDate, date)
  const topic = getCurrentKnowledgeTopic(arcDay)
  const score = computeDailyScore(draft, settings.weights, settings.targets)

  return (
    <div className="flex flex-col gap-5 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <NavButton icon={<ChevronLeft size={16} />} onClick={() => navigate(`/log/${addDaysToKey(date, -1)}`)} />
          <div>
            <div className="text-lg font-semibold">{formatPretty(date)}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Winter Arc Day {arcDay > 0 ? arcDay : '—'}
              {date === todayKey() ? ' · Today' : ''}
            </div>
          </div>
          <NavButton icon={<ChevronRight size={16} />} onClick={() => navigate(`/log/${addDaysToKey(date, 1)}`)} />
          {date !== todayKey() && (
            <button
              onClick={() => navigate(`/log/${todayKey()}`)}
              className="text-xs px-2 py-1 rounded-md"
              style={{ color: 'var(--color-accent)' }}
            >
              Jump to today
            </button>
          )}
        </div>
        <div className="text-2xl font-bold" style={{ color: scoreColor(score.score) }}>
          {score.score}%
        </div>
      </div>

      <Card title="Morning routine">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <Toggle label="Woke up" checked={!!draft.morningRoutine?.wokeUp} onChange={(v) => patch('morningRoutine', { ...draft.morningRoutine, wokeUp: v })} />
          <Toggle label="Water" checked={!!draft.morningRoutine?.water} onChange={(v) => patch('morningRoutine', { ...draft.morningRoutine, water: v })} />
          <Toggle label="Freshen up" checked={!!draft.morningRoutine?.freshenUp} onChange={(v) => patch('morningRoutine', { ...draft.morningRoutine, freshenUp: v })} />
          <Toggle label="Made bed" checked={!!draft.morningRoutine?.madeBed} onChange={(v) => patch('morningRoutine', { ...draft.morningRoutine, madeBed: v })} />
          <Toggle label="No scrolling" checked={!!draft.morningRoutine?.noScrolling} onChange={(v) => patch('morningRoutine', { ...draft.morningRoutine, noScrolling: v })} />
        </div>
      </Card>

      <Card title="Career — non-negotiables">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium">DSA <span style={{ color: 'var(--color-text-muted)' }}>(target {settings.targets.dsaNormalMin}m, min {settings.targets.dsaMinimumMin}m)</span></div>
            <StatusPicker value={draft.dsa?.status} onChange={(v) => patch('dsa', { ...draft.dsa, status: v })} />
            <TextInput placeholder="Topic (e.g. Arrays)" value={draft.dsa?.topic ?? ''} onChange={(e) => patch('dsa', { ...draft.dsa, status: draft.dsa?.status ?? 'missed', topic: e.target.value })} />
            <OptionPicker value={draft.dsa?.timeBucket} options={TIME_BUCKET_OPTIONS} onChange={(v) => patch('dsa', { ...draft.dsa, status: draft.dsa?.status ?? 'missed', timeBucket: v })} />
            <TextArea placeholder="Notes (optional)" value={draft.dsa?.notes ?? ''} onChange={(e) => patch('dsa', { ...draft.dsa, status: draft.dsa?.status ?? 'missed', notes: e.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium">LLD <span style={{ color: 'var(--color-text-muted)' }}>(target {settings.targets.lldNormalMin}m, min {settings.targets.lldMinimumMin}m)</span></div>
            <StatusPicker value={draft.lld?.status} onChange={(v) => patch('lld', { ...draft.lld, status: v })} />
            <TextInput placeholder="Topic (e.g. SOLID)" value={draft.lld?.topic ?? ''} onChange={(e) => patch('lld', { ...draft.lld, status: draft.lld?.status ?? 'missed', topic: e.target.value })} />
            <OptionPicker value={draft.lld?.timeBucket} options={TIME_BUCKET_OPTIONS} onChange={(v) => patch('lld', { ...draft.lld, status: draft.lld?.status ?? 'missed', timeBucket: v })} />
            <TextArea placeholder="Notes (optional)" value={draft.lld?.notes ?? ''} onChange={(e) => patch('lld', { ...draft.lld, status: draft.lld?.status ?? 'missed', notes: e.target.value })} />
          </div>
        </div>
      </Card>

      <Card title="Body">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Toggle label="Rest day (skip gym scoring)" checked={!!draft.gym?.isRestDay} onChange={(v) => patch('gym', { ...draft.gym, isRestDay: v, done: draft.gym?.done ?? false })} />
            {!draft.gym?.isRestDay && (
              <>
                <Toggle label="Gym / workout done" checked={!!draft.gym?.done} onChange={(v) => patch('gym', { ...draft.gym, done: v })} />
                <TextInput placeholder="Workout type (e.g. Push, Legs)" value={draft.gym?.workoutType ?? ''} onChange={(e) => patch('gym', { ...draft.gym, done: draft.gym?.done ?? false, workoutType: e.target.value })} />
                <NumberInput placeholder="Duration (minutes)" value={draft.gym?.durationMin ?? ''} onChange={(e) => patch('gym', { ...draft.gym, done: draft.gym?.done ?? false, durationMin: e.target.value === '' ? undefined : Number(e.target.value) })} />
              </>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Field label="Steps">
              <OptionPicker value={draft.steps?.bucket} options={STEPS_BUCKET_OPTIONS} onChange={(v) => patch('steps', { bucket: v })} />
            </Field>
            <Field label="Water intake">
              <OptionPicker value={draft.water?.bucket} options={WATER_BUCKET_OPTIONS} onChange={(v) => patch('water', { bucket: v })} />
            </Field>
            <Field label={`Protein grams (target ${settings.targets.proteinG}g)`}>
              <NumberInput value={draft.protein?.grams ?? ''} onChange={(e) => patch('protein', { grams: e.target.value === '' ? undefined : Number(e.target.value) })} />
            </Field>
            <Field label="Body weight (kg)">
              <NumberInput value={draft.bodyWeightKg ?? ''} onChange={(e) => patch('bodyWeightKg', e.target.value === '' ? undefined : Number(e.target.value))} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Sleep">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label={`Bedtime (target ${settings.targets.sleepTargetBedtime})`}>
            <TextInput type="time" value={draft.sleep?.bedtime ?? ''} onChange={(e) => patch('sleep', { ...draft.sleep, bedtime: e.target.value })} />
          </Field>
          <Field label={`Wake time (target ${settings.targets.sleepTargetWake})`}>
            <TextInput type="time" value={draft.sleep?.wakeTime ?? ''} onChange={(e) => patch('sleep', { ...draft.sleep, wakeTime: e.target.value })} />
          </Field>
          <Field label={`Duration hours (min ${settings.targets.sleepMinHours}h, target ${settings.targets.sleepTargetHours}h)`}>
            <NumberInput step="0.1" value={draft.sleep?.durationHours ?? ''} onChange={(e) => patch('sleep', { ...draft.sleep, durationHours: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </Field>
        </div>
      </Card>

      <Card title="Mind">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium">Reading <span style={{ color: 'var(--color-text-muted)' }}>(target {settings.targets.readingTargetMin}m)</span></div>
            <TextInput placeholder="Book" value={draft.reading?.book ?? ''} onChange={(e) => patch('reading', { ...draft.reading, book: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <NumberInput placeholder="Minutes" value={draft.reading?.minutes ?? ''} onChange={(e) => patch('reading', { ...draft.reading, minutes: e.target.value === '' ? undefined : Number(e.target.value) })} />
              <NumberInput placeholder="Pages" value={draft.reading?.pages ?? ''} onChange={(e) => patch('reading', { ...draft.reading, pages: e.target.value === '' ? undefined : Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium">Communication <span style={{ color: 'var(--color-text-muted)' }}>(target {settings.targets.commTargetMin}m)</span></div>
            <TextInput placeholder="Topic / focus" value={draft.communication?.topic ?? ''} onChange={(e) => patch('communication', { ...draft.communication, topic: e.target.value })} />
            <NumberInput placeholder="Minutes" value={draft.communication?.minutes ?? ''} onChange={(e) => patch('communication', { ...draft.communication, minutes: e.target.value === '' ? undefined : Number(e.target.value) })} />
            <TextArea placeholder="Notes" value={draft.communication?.notes ?? ''} onChange={(e) => patch('communication', { ...draft.communication, notes: e.target.value })} />
          </div>
        </div>
      </Card>

      <Card title="Knowledge & grooming">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="text-sm">
              This week's topic: <span className="font-medium">{topic}</span>
            </div>
            <Toggle label="Knowledge session done" checked={!!draft.knowledge?.done} onChange={(v) => patch('knowledge', { ...draft.knowledge, done: v })} />
            <TextArea placeholder="What did you learn today?" value={draft.knowledge?.notes ?? ''} onChange={(e) => patch('knowledge', { ...draft.knowledge, done: draft.knowledge?.done ?? false, notes: e.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium">Grooming</div>
            <Toggle label="Morning grooming done" checked={!!draft.grooming?.morningDone} onChange={(v) => patch('grooming', { ...draft.grooming, morningDone: v })} />
            <Toggle label="Night grooming done" checked={!!draft.grooming?.nightDone} onChange={(v) => patch('grooming', { ...draft.grooming, nightDone: v })} />
          </div>
        </div>
      </Card>

      <Card title="Night check-in (optional)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextArea placeholder="What did I complete?" value={draft.checkin?.completed ?? ''} onChange={(e) => patch('checkin', { ...draft.checkin, completed: e.target.value })} />
          <TextArea placeholder="What did I miss?" value={draft.checkin?.missed ?? ''} onChange={(e) => patch('checkin', { ...draft.checkin, missed: e.target.value })} />
          <TextArea placeholder="What went wrong?" value={draft.checkin?.wentWrong ?? ''} onChange={(e) => patch('checkin', { ...draft.checkin, wentWrong: e.target.value })} />
          <TextArea placeholder="What did I learn?" value={draft.checkin?.learned ?? ''} onChange={(e) => patch('checkin', { ...draft.checkin, learned: e.target.value })} />
          <TextArea placeholder="What will I improve tomorrow?" value={draft.checkin?.improveTomorrow ?? ''} onChange={(e) => patch('checkin', { ...draft.checkin, improveTomorrow: e.target.value })} />
        </div>
      </Card>
    </div>
  )
}

function NavButton({ icon, onClick }: { icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-md border"
      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
    >
      {icon}
    </button>
  )
}
