export interface KnowledgeTopicSlot {
  dayStart: number
  dayEnd: number
  topic: string
}

export const KNOWLEDGE_ROADMAP: KnowledgeTopicSlot[] = [
  { dayStart: 1, dayEnd: 7, topic: 'F1' },
  { dayStart: 8, dayEnd: 14, topic: 'Coffee' },
  { dayStart: 15, dayEnd: 21, topic: 'Psychology' },
  { dayStart: 22, dayEnd: 28, topic: 'Cooking' },
  { dayStart: 29, dayEnd: 35, topic: 'Travel' },
  { dayStart: 36, dayEnd: 42, topic: 'World History' },
  { dayStart: 43, dayEnd: 49, topic: 'Clothing / Style / Color' },
  { dayStart: 50, dayEnd: 56, topic: 'Watches' },
  { dayStart: 57, dayEnd: 63, topic: 'Geography / Geopolitics' },
  { dayStart: 64, dayEnd: 70, topic: 'Architecture / Interior Design' },
  { dayStart: 71, dayEnd: 77, topic: 'Photography' },
  { dayStart: 78, dayEnd: 84, topic: 'Food / Cuisine / Culture' },
  { dayStart: 85, dayEnd: 90, topic: 'Deep dive: favorite topic' },
]

export function getCurrentKnowledgeTopic(arcDay: number): string {
  if (arcDay < 1) return KNOWLEDGE_ROADMAP[0].topic
  if (arcDay > 90) return KNOWLEDGE_ROADMAP[KNOWLEDGE_ROADMAP.length - 1].topic
  const slot = KNOWLEDGE_ROADMAP.find((s) => arcDay >= s.dayStart && arcDay <= s.dayEnd)
  return slot ? slot.topic : '—'
}
