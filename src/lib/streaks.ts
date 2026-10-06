import { eachDay } from './dates'
import type { LogIndex } from './logIndex'
import { groupByLineage, isScheduledOn } from './schedule'
import type { Objective } from './types'

export interface StreakInfo {
  current: number
  best: number
}

/**
 * Sequência de uma linhagem: percorre os dias do primeiro starts_on até hoje.
 * Dias sem versão programada não somam nem quebram.
 */
export function lineageStreak(versions: Objective[], logs: LogIndex, today: string): StreakInfo {
  const recurring = versions.filter((v) => v.schedule !== 'once')
  if (recurring.length === 0) return { current: 0, best: 0 }

  const polarity = recurring[0].polarity
  const start = recurring.map((v) => v.starts_on).sort()[0]
  let run = 0
  let best = 0

  for (const d of eachDay(start, today)) {
    const v = recurring.find((x) => isScheduledOn(x, d))
    if (!v) continue
    const logged = logs.has(v.id, d)
    const isToday = d === today

    if (polarity === 'positive') {
      if (logged) {
        run++
        best = Math.max(best, run)
      } else if (!isToday) {
        run = 0
      }
    } else {
      if (logged) {
        run = 0
      } else if (!isToday) {
        run++
        best = Math.max(best, run)
      }
    }
  }
  return { current: run, best }
}

/** Sequência de todas as linhagens recorrentes, por lineage_id. */
export function allStreaks(
  objectives: Objective[],
  logs: LogIndex,
  today: string,
): Map<string, StreakInfo> {
  const result = new Map<string, StreakInfo>()
  for (const [lineageId, versions] of groupByLineage(objectives)) {
    if (versions.some((v) => v.schedule !== 'once')) {
      result.set(lineageId, lineageStreak(versions, logs, today))
    }
  }
  return result
}
