export type Polarity = 'positive' | 'negative'
export type Weight = 10 | 20 | 30
export type Schedule = 'once' | 'daily' | 'weekdays'

export interface Objective {
  id: string
  user_id: string
  title: string
  polarity: Polarity
  weight: Weight
  schedule: Schedule
  weekdays: number[] | null
  once_date: string | null      // 'YYYY-MM-DD'
  starts_on: string             // 'YYYY-MM-DD'
  archived_at: string | null
  sort_order: number
  created_at: string
  lineage_id: string
}

export interface ObjectiveLog {
  id: string
  user_id: string
  objective_id: string
  log_date: string              // 'YYYY-MM-DD'
  created_at: string
}

export type GoalStatus = 'active' | 'done' | 'archived'
export type ProgressType = 'numeric' | 'percent'

export interface Goal {
  id: string
  user_id: string
  title: string
  why: string | null
  due_date: string | null
  progress_type: ProgressType
  current_value: number
  target_value: number | null
  unit: string | null
  status: GoalStatus
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  entry_date: string
  title: string | null
  body: string
  created_at: string
  updated_at: string
}

export interface Verse {
  id: number
  position: number
  reference: string
  text: string
  reflection: string
  question: string
  theme: string | null
}
