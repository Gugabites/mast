import { supabase } from '../supabase'
import type { Goal, GoalStatus, ProgressType } from '../types'
import { unwrap } from './errors'

export interface GoalInput {
  title: string
  why: string | null
  due_date: string | null
  progress_type: ProgressType
  current_value: number
  target_value: number | null
  unit: string | null
}

/** Strings vazias viram null; no tipo percentual não há alvo nem unidade. */
function clean(input: GoalInput): GoalInput {
  const percent = input.progress_type === 'percent'
  const current = Math.max(0, input.current_value)
  return {
    title: input.title.trim(),
    why: input.why?.trim() || null,
    due_date: input.due_date || null,
    progress_type: input.progress_type,
    current_value: percent ? Math.min(100, current) : current,
    target_value: percent ? null : input.target_value,
    unit: percent ? null : input.unit?.trim() || null,
  }
}

export async function listGoals(): Promise<Goal[]> {
  return unwrap<Goal[]>(
    await supabase.from('goals').select('*').order('created_at', { ascending: true }),
  )
}

export async function createGoal(input: GoalInput): Promise<Goal> {
  return unwrap<Goal>(await supabase.from('goals').insert(clean(input)).select().single())
}

export async function updateGoal(id: string, input: GoalInput): Promise<Goal> {
  return unwrap<Goal>(
    await supabase.from('goals').update(clean(input)).eq('id', id).select().single(),
  )
}

export async function setGoalProgress(id: string, currentValue: number): Promise<Goal> {
  return unwrap<Goal>(
    await supabase
      .from('goals')
      .update({ current_value: currentValue })
      .eq('id', id)
      .select()
      .single(),
  )
}

export async function setGoalStatus(id: string, status: GoalStatus): Promise<Goal> {
  return unwrap<Goal>(
    await supabase.from('goals').update({ status }).eq('id', id).select().single(),
  )
}

export async function deleteGoal(id: string): Promise<void> {
  unwrap(await supabase.from('goals').delete().eq('id', id))
}
