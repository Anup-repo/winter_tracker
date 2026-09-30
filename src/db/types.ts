export type TaskStatus = 'completed' | 'minimum' | 'missed' | 'na'

export interface ScoringWeights {
  dsa: number
  lld: number
  fitness: number
  sleep: number
  protein: number
  steps: number
  reading: number
  communication: number
  knowledge: number
  grooming: number
}

export interface Targets {
  dsaNormalMin: number
  dsaMinimumMin: number
  lldNormalMin: number
  lldMinimumMin: number
  proteinG: number
  stepsCount: number
  sleepMinHours: number
  sleepTargetHours: number
  sleepTargetBedtime: string
  sleepTargetWake: string
  readingTargetMin: number
  commTargetMin: number
}

export interface AppSettings {
  id: 'singleton'
  winterArcStartDate: string
  targets: Targets
  weights: ScoringWeights
}

export interface MorningRoutine {
  wokeUp?: boolean
  water?: boolean
  freshenUp?: boolean
  madeBed?: boolean
  noScrolling?: boolean
}

export interface CheckIn {
  completed?: string
  missed?: string
  wentWrong?: string
  learned?: string
  improveTomorrow?: string
}

export type TimeBucket = '<30' | '30-60' | '>60'
export type WaterBucket = '<1L' | '1-2L' | '>2L'
export type StepsBucket = '<4k' | '4-8k' | '8-10k' | '>10k'

export const TIME_BUCKET_OPTIONS: { value: TimeBucket; label: string }[] = [
  { value: '<30', label: '< 30 min' },
  { value: '30-60', label: '30–60 min' },
  { value: '>60', label: '> 60 min' },
]

export const WATER_BUCKET_OPTIONS: { value: WaterBucket; label: string }[] = [
  { value: '<1L', label: '< 1 L' },
  { value: '1-2L', label: '1–2 L' },
  { value: '>2L', label: '> 2 L' },
]

export const STEPS_BUCKET_OPTIONS: { value: StepsBucket; label: string }[] = [
  { value: '<4k', label: '< 4k' },
  { value: '4-8k', label: '4k–8k' },
  { value: '8-10k', label: '8k–10k' },
  { value: '>10k', label: '> 10k' },
]

export interface DailyLog {
  date: string // YYYY-MM-DD primary key
  dsa?: { status: TaskStatus; timeBucket?: TimeBucket; topic?: string; notes?: string }
  lld?: { status: TaskStatus; timeBucket?: TimeBucket; topic?: string; notes?: string }
  gym?: { done: boolean; isRestDay?: boolean; workoutType?: string; durationMin?: number }
  steps?: { bucket?: StepsBucket }
  water?: { bucket?: WaterBucket }
  protein?: { grams?: number }
  bodyWeightKg?: number
  sleep?: { bedtime?: string; wakeTime?: string; durationHours?: number }
  reading?: { minutes?: number; book?: string; pages?: number }
  communication?: { minutes?: number; topic?: string; notes?: string }
  knowledge?: { done: boolean; notes?: string }
  grooming?: { morningDone?: boolean; nightDone?: boolean }
  morningRoutine?: MorningRoutine
  checkin?: CheckIn
}

export type NeedWant = 'need' | 'want'

export interface Expense {
  id?: number
  date: string
  amount: number
  category: string
  subcategory?: string
  paymentMethod?: string
  merchant?: string
  description?: string
  needWant?: NeedWant
  recurring?: boolean
  notes?: string
}

export type LedgerType = 'lent' | 'borrowed'
export type LedgerStatus = 'open' | 'partial' | 'settled'

export interface MoneyLedgerEntry {
  id?: number
  type: LedgerType // 'lent' = money I gave/lent to someone (they owe me); 'borrowed' = money I owe someone
  person: string
  amount: number
  date: string
  purpose?: string
  dueDate?: string // expected return / expected payment date
  amountSettled: number
  notes?: string
}

export function ledgerStatus(entry: MoneyLedgerEntry): LedgerStatus {
  if (entry.amountSettled >= entry.amount) return 'settled'
  if (entry.amountSettled > 0) return 'partial'
  return 'open'
}

export function ledgerRemaining(entry: MoneyLedgerEntry): number {
  return Math.max(0, entry.amount - entry.amountSettled)
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food',
  'Groceries',
  'Transport',
  'Shopping',
  'Clothing',
  'Grooming',
  'Gym',
  'Supplements',
  'Health',
  'Books',
  'Courses',
  'Subscriptions',
  'Entertainment',
  'Coffee',
  'Travel',
  'Gifts',
  'Family',
  'Other',
]

export const DEFAULT_SETTINGS: Omit<AppSettings, 'winterArcStartDate'> = {
  id: 'singleton',
  targets: {
    dsaNormalMin: 60,
    dsaMinimumMin: 20,
    lldNormalMin: 60,
    lldMinimumMin: 20,
    proteinG: 130,
    stepsCount: 10000,
    sleepMinHours: 7,
    sleepTargetHours: 8,
    sleepTargetBedtime: '23:30',
    sleepTargetWake: '07:30',
    readingTargetMin: 25,
    commTargetMin: 15,
  },
  weights: {
    dsa: 15,
    lld: 15,
    fitness: 15,
    sleep: 10,
    protein: 10,
    steps: 5,
    reading: 10,
    communication: 10,
    knowledge: 5,
    grooming: 5,
  },
}
