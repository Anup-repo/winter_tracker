export const STREAK_THRESHOLD = 70

/** scores ordered oldest -> newest, one entry per consecutive day (0 for no-data days). */
export function computeStreaks(scores: number[]): { current: number; best: number } {
  let best = 0
  let running = 0
  for (const s of scores) {
    if (s >= STREAK_THRESHOLD) {
      running += 1
      best = Math.max(best, running)
    } else {
      running = 0
    }
  }

  let current = 0
  for (let i = scores.length - 1; i >= 0; i--) {
    if (scores[i] >= STREAK_THRESHOLD) current += 1
    else break
  }

  return { current, best }
}
