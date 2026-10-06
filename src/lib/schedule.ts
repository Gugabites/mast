import { localDateOf, weekday } from './dates'
import type { Objective } from './types'

/** Data local (São Paulo) em que o objetivo foi arquivado, ou null. */
export function archivedOn(o: Objective): string | null {
  return o.archived_at ? localDateOf(o.archived_at) : null
}

/** Um arquivado deixa de valer a partir do dia do arquivamento, inclusive. */
export function isScheduledOn(o: Objective, d: string): boolean {
  const arch = archivedOn(o)
  if (arch && d >= arch) return false
  switch (o.schedule) {
    case 'once':
      return o.once_date === d
    case 'daily':
      return o.starts_on <= d
    case 'weekdays':
      return o.starts_on <= d && (o.weekdays ?? []).includes(weekday(d))
  }
}

export function objectivesForDay(objectives: Objective[], d: string): Objective[] {
  return objectives
    .filter((o) => isScheduledOn(o, d))
    .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
}

/** Agrupa versões por linhagem. */
export function groupByLineage(objectives: Objective[]): Map<string, Objective[]> {
  const map = new Map<string, Objective[]>()
  for (const o of objectives) {
    const versions = map.get(o.lineage_id)
    if (versions) versions.push(o)
    else map.set(o.lineage_id, [o])
  }
  return map
}

/** Versão atual (não arquivada) de uma linhagem, ou null se toda a linhagem está arquivada. */
export function currentVersion(versions: Objective[]): Objective | null {
  return versions.find((v) => !v.archived_at) ?? null
}

/** Versão mais recente por created_at (usada para exibir linhagens arquivadas). */
export function latestVersion(versions: Objective[]): Objective {
  return versions.reduce((a, b) => (b.created_at > a.created_at ? b : a))
}
