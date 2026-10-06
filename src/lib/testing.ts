// Fábricas usadas só nos testes.
import { LogIndex } from './logIndex'
import type { Objective } from './types'

export function obj(partial: Partial<Objective> & Pick<Objective, 'id'>): Objective {
  return {
    user_id: 'u',
    title: partial.id,
    polarity: 'positive',
    weight: 10,
    schedule: 'daily',
    weekdays: null,
    once_date: null,
    starts_on: '2026-10-01',
    archived_at: null,
    sort_order: 0,
    created_at: '2026-10-01T12:00:00Z',
    lineage_id: partial.id,
    ...partial,
  }
}

/** Índice a partir de pares [objectiveId, dia de outubro de 2026]. */
export function octoberLogs(entries: Record<string, number[]>): LogIndex {
  return new LogIndex(
    Object.entries(entries).flatMap(([objective_id, days]) =>
      days.map((day) => ({
        objective_id,
        log_date: `2026-10-${String(day).padStart(2, '0')}`,
      })),
    ),
  )
}
