import { supabase } from '../supabase'
import type { ObjectiveLog } from '../types'
import { ApiError } from './errors'
import { fetchAll } from './fetchAll'

export type LogSummary = Pick<ObjectiveLog, 'id' | 'objective_id' | 'log_date'>

/** Todos os registros: sequências e recordes dependem do histórico inteiro. */
export function listAllLogs(): Promise<LogSummary[]> {
  return fetchAll<LogSummary>((from, to) =>
    supabase
      .from('objective_logs')
      .select('id, objective_id, log_date')
      .order('log_date', { ascending: true })
      .order('id', { ascending: true })
      .range(from, to),
  )
}

export async function addLog(objectiveId: string, date: string): Promise<void> {
  const { error } = await supabase
    .from('objective_logs')
    .insert({ objective_id: objectiveId, log_date: date })
  // 23505: já estava registrado; o resultado desejado é o mesmo.
  if (error && error.code !== '23505') throw new ApiError(error.message, error.code)
}

export async function removeLog(objectiveId: string, date: string): Promise<void> {
  const { error } = await supabase
    .from('objective_logs')
    .delete()
    .eq('objective_id', objectiveId)
    .eq('log_date', date)
  if (error) throw new ApiError(error.message, error.code)
}
