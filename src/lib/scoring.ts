import type { DailyLog, ScoringWeights, Targets } from '../db/types'

type CategoryKey = keyof ScoringWeights

/** Returns a 0..1 completion ratio for a category, or null if not applicable (excluded from scoring). */
function categoryRatio(key: CategoryKey, log: DailyLog | undefined, targets: Targets): number | null {
  if (!log) return key === 'fitness' ? null : 0

  switch (key) {
    case 'dsa': {
      const status = log.dsa?.status
      if (!status || status === 'missed') return 0
      if (status === 'na') return null
      if (status === 'completed') return 1
      if (status === 'minimum') return 0.5
      return 0
    }
    case 'lld': {
      const status = log.lld?.status
      if (!status || status === 'missed') return 0
      if (status === 'na') return null
      if (status === 'completed') return 1
      if (status === 'minimum') return 0.5
      return 0
    }
    case 'fitness': {
      if (log.gym?.isRestDay) return null
      return log.gym?.done ? 1 : 0
    }
    case 'sleep': {
      const hours = log.sleep?.durationHours
      if (hours == null) return 0
      if (hours >= targets.sleepTargetHours) return 1
      if (hours >= targets.sleepMinHours) return 0.7
      return Math.max(0, Math.min(0.6, hours / targets.sleepMinHours))
    }
    case 'protein': {
      const g = log.protein?.grams
      if (g == null) return 0
      return Math.max(0, Math.min(1, g / targets.proteinG))
    }
    case 'steps': {
      const bucket = log.steps?.bucket
      if (!bucket) return 0
      const ratios: Record<string, number> = { '<4k': 0.2, '4-8k': 0.6, '8-10k': 0.9, '>10k': 1 }
      return ratios[bucket] ?? 0
    }
    case 'reading': {
      const m = log.reading?.minutes
      if (m == null) return 0
      return Math.max(0, Math.min(1, m / targets.readingTargetMin))
    }
    case 'communication': {
      const m = log.communication?.minutes
      if (m == null) return 0
      return Math.max(0, Math.min(1, m / targets.commTargetMin))
    }
    case 'knowledge':
      return log.knowledge?.done ? 1 : 0
    case 'grooming': {
      const g = log.grooming
      if (!g || (g.morningDone == null && g.nightDone == null)) return 0
      const parts = [g.morningDone ?? false, g.nightDone ?? false]
      return parts.filter(Boolean).length / parts.length
    }
    default:
      return 0
  }
}

export interface CategoryBreakdown {
  key: CategoryKey
  ratio: number | null
  weight: number
  contribution: number | null
}

export interface ScoreResult {
  score: number
  breakdown: CategoryBreakdown[]
  hasAnyData: boolean
}

export function computeDailyScore(log: DailyLog | undefined, weights: ScoringWeights, targets: Targets): ScoreResult {
  const keys = Object.keys(weights) as CategoryKey[]
  const breakdown: CategoryBreakdown[] = keys.map((key) => {
    const ratio = categoryRatio(key, log, targets)
    const weight = weights[key]
    return { key, ratio, weight, contribution: ratio == null ? null : ratio * weight }
  })

  const applicable = breakdown.filter((b) => b.ratio !== null)
  const totalWeight = applicable.reduce((sum, b) => sum + b.weight, 0)
  const totalContribution = applicable.reduce((sum, b) => sum + (b.contribution ?? 0), 0)

  const score = totalWeight > 0 ? Math.round((totalContribution / totalWeight) * 100) : 0
  const hasAnyData = !!log

  return { score, breakdown, hasAnyData }
}

export function scoreColor(score: number): string {
  if (score >= 100) return 'var(--color-good)'
  if (score >= 85) return '#7fd88f'
  if (score >= 70) return 'var(--color-ok)'
  return 'var(--color-bad)'
}

export function average(scores: number[]): number {
  if (scores.length === 0) return 0
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}
