import type { AppSettings, DailyLog } from '../db/types'
import { computeDailyScore } from './scoring'
import { addDaysToKey, todayKey, winterArcDay } from './dates'
import { computeStreaks } from './streaks'

export interface DayScore {
  date: string
  score: number | null // null = no data / future day
}

export interface ArcStats {
  arcDay: number
  daysCompleted: number
  daysRemaining: number
  todayScore: number | null
  avg7: number | null
  avg30: number | null
  avgOverall: number | null
  currentStreak: number
  bestStreak: number
  heatmap: DayScore[]
}

function scoreForDate(date: string, logsByDate: Map<string, DailyLog>, settings: AppSettings): number | null {
  if (date > todayKey()) return null
  const log = logsByDate.get(date)
  if (!log) return null
  return computeDailyScore(log, settings.weights, settings.targets).score
}

function avgOf(scores: (number | null)[]): number | null {
  const vals = scores.filter((s): s is number => s != null)
  if (vals.length === 0) return null
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export function computeArcStats(logs: DailyLog[], settings: AppSettings): ArcStats {
  const logsByDate = new Map(logs.map((l) => [l.date, l]))
  const today = todayKey()
  const arcDay = winterArcDay(settings.winterArcStartDate, today)
  const daysCompleted = Math.max(0, Math.min(90, arcDay - 1))
  const daysRemaining = Math.max(0, 90 - daysCompleted)

  const heatmap: DayScore[] = []
  for (let i = 0; i < 90; i++) {
    const date = addDaysToKey(settings.winterArcStartDate, i)
    heatmap.push({ date, score: scoreForDate(date, logsByDate, settings) })
  }

  const todayScore = scoreForDate(today, logsByDate, settings)

  const last7 = Array.from({ length: 7 }, (_, i) => scoreForDate(addDaysToKey(today, -i), logsByDate, settings))
  const last30 = Array.from({ length: 30 }, (_, i) => scoreForDate(addDaysToKey(today, -i), logsByDate, settings))
  const overall = heatmap.filter((d) => d.date <= today).map((d) => d.score)

  const chronoForStreak = heatmap.filter((d) => d.date <= today).map((d) => d.score ?? 0)
  const { current, best } = computeStreaks(chronoForStreak)

  return {
    arcDay,
    daysCompleted,
    daysRemaining,
    todayScore,
    avg7: avgOf(last7),
    avg30: avgOf(last30),
    avgOverall: avgOf(overall),
    currentStreak: current,
    bestStreak: best,
    heatmap,
  }
}
