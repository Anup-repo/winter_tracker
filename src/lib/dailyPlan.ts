import type { Targets } from '../db/types'
import { getCurrentKnowledgeTopic } from './knowledgeTopics'

const DSA_TOPICS = [
  'Arrays', 'Strings', 'Hashing', 'Two pointers', 'Sliding window', 'Binary search',
  'Stack', 'Queue', 'Linked list', 'Trees', 'BST', 'Heap', 'Graph', 'BFS', 'DFS',
  'Dynamic programming', 'Greedy', 'Backtracking', 'Recursion', 'Bit manipulation',
  'Intervals', 'Tries', 'Union Find',
]

const LLD_TOPICS = [
  'OOP fundamentals', 'SOLID', 'DRY', 'KISS', 'YAGNI', 'Composition vs inheritance',
  'Encapsulation', 'Abstraction', 'Factory', 'Abstract Factory', 'Builder', 'Singleton',
  'Strategy', 'Observer', 'Decorator', 'Adapter', 'Command', 'State', 'Template Method',
  'Chain of Responsibility', 'Proxy', 'Facade', 'Dependency Injection',
]

const GYM_SPLIT = ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest / Mobility']

function pick<T>(list: T[], arcDay: number): T {
  const idx = ((Math.max(1, arcDay) - 1) % list.length + list.length) % list.length
  return list[idx]
}

export interface DailyPlan {
  arcDay: number
  knowledgeTopic: string
  dsaTopic: string
  lldTopic: string
  gymFocus: string
  readingTargetMin: number
  commTargetMin: number
  stepsTarget: number
  sleepBedtime: string
  sleepWake: string
}

export function getTodaysPlan(arcDay: number, targets: Targets): DailyPlan {
  return {
    arcDay,
    knowledgeTopic: getCurrentKnowledgeTopic(arcDay),
    dsaTopic: pick(DSA_TOPICS, arcDay),
    lldTopic: pick(LLD_TOPICS, arcDay),
    gymFocus: pick(GYM_SPLIT, arcDay),
    readingTargetMin: targets.readingTargetMin,
    commTargetMin: targets.commTargetMin,
    stepsTarget: targets.stepsCount,
    sleepBedtime: targets.sleepTargetBedtime,
    sleepWake: targets.sleepTargetWake,
  }
}
