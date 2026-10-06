import { normalizeWeekdays } from '../format'
import { supabase } from '../supabase'
import type { Objective, Polarity, Schedule, Weight } from '../types'
import { unwrap } from './errors'
import { fetchAll } from './fetchAll'

export interface ObjectiveInput {
  title: string
  polarity: Polarity
  weight: Weight
  schedule: Schedule
  weekdays: number[] | null
  once_date: string | null
}

export type ObjectiveEdit = Omit<ObjectiveInput, 'polarity'>

/**
 * Deixa o input coerente com as restrições do banco: título sem espaços nas
 * pontas, dias ordenados, e 7 dias da semana viram 'daily'.
 */
export function normalizeInput<T extends ObjectiveEdit>(input: T): T {
  const title = input.title.trim()
  if (input.schedule === 'once') return { ...input, title, weekdays: null }
  if (input.schedule === 'daily') return { ...input, title, weekdays: null, once_date: null }

  const weekdays = normalizeWeekdays(input.weekdays ?? [])
  return weekdays
    ? { ...input, title, weekdays, once_date: null }
    : { ...input, title, schedule: 'daily', weekdays: null, once_date: null }
}

/** Todos os objetivos, inclusive arquivados. */
export function listObjectives(): Promise<Objective[]> {
  return fetchAll<Objective>((from, to) =>
    supabase
      .from('objectives')
      .select('*')
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, to),
  )
}

/** Com `lineageId`, a nova versão entra numa linhagem existente (restaurar). */
export async function createObjective(
  input: ObjectiveInput,
  lineageId?: string,
): Promise<Objective> {
  const row = { ...normalizeInput(input), ...(lineageId ? { lineage_id: lineageId } : {}) }
  return unwrap<Objective>(await supabase.from('objectives').insert(row).select().single())
}

export async function renameObjective(id: string, title: string): Promise<Objective> {
  return unwrap<Objective>(
    await supabase
      .from('objectives')
      .update({ title: title.trim() })
      .eq('id', id)
      .select()
      .single(),
  )
}

export async function updateOnceObjective(
  id: string,
  title: string,
  weight: Weight,
): Promise<Objective> {
  return unwrap<Objective>(
    await supabase
      .from('objectives')
      .update({ title: title.trim(), weight })
      .eq('id', id)
      .select()
      .single(),
  )
}

/** Arquiva a versão atual e cria outra na mesma linhagem, numa operação só. */
export async function replaceObjective(oldId: string, input: ObjectiveEdit): Promise<Objective> {
  const next = normalizeInput(input)
  return unwrap<Objective>(
    await supabase.rpc('replace_objective', {
      p_old_id: oldId,
      p_title: next.title,
      p_weight: next.weight,
      p_schedule: next.schedule,
      p_weekdays: next.weekdays,
      p_once_date: next.once_date,
    }),
  )
}

export async function archiveObjective(id: string): Promise<Objective> {
  return unwrap<Objective>(
    await supabase
      .from('objectives')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),
  )
}

/** Apaga todas as versões da linhagem; os registros vão junto (cascade). */
export async function deleteLineage(lineageId: string): Promise<void> {
  unwrap(await supabase.from('objectives').delete().eq('lineage_id', lineageId))
}

/** Para avulsos. */
export async function deleteObjective(id: string): Promise<void> {
  unwrap(await supabase.from('objectives').delete().eq('id', id))
}
