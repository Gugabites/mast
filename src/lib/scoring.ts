import { eachDay } from './dates'
import type { LogIndex } from './logIndex'
import { objectivesForDay } from './schedule'
import type { Objective } from './types'

/** Positivo não feito em dia encerrado desconta esta fração do peso. */
export const MISSED_PENALTY_RATIO = 0.5

export interface DayScore {
  date: string
  earned: number
  lost: number
  balance: number
  maxPossible: number
  pct: number | null
  positivesDone: number
  positivesTotal: number
  negativesOccurred: number
  negativesTotal: number
  final: boolean // true se o dia já terminou
}

export function scoreDay(
  objectives: Objective[],
  logs: LogIndex,
  date: string,
  today: string,
): DayScore {
  const items = objectivesForDay(objectives, date)
  const final = date < today
  let earned = 0
  let lost = 0
  let maxPossible = 0
  let positivesDone = 0
  let positivesTotal = 0
  let negativesOccurred = 0
  let negativesTotal = 0

  for (const o of items) {
    const logged = logs.has(o.id, date)
    if (o.polarity === 'positive') {
      positivesTotal++
      maxPossible += o.weight
      if (logged) {
        earned += o.weight
        positivesDone++
      } else if (final) {
        lost += o.weight * MISSED_PENALTY_RATIO
      }
    } else {
      negativesTotal++
      if (logged) {
        lost += o.weight
        negativesOccurred++
      }
    }
  }

  return {
    date,
    earned,
    lost,
    balance: earned - lost,
    maxPossible,
    pct: maxPossible > 0 ? Math.round((earned / maxPossible) * 100) : null,
    positivesDone,
    positivesTotal,
    negativesOccurred,
    negativesTotal,
    final,
  }
}

/** Para o gráfico: uma DayScore por dia do intervalo. */
export function scoreRange(
  objectives: Objective[],
  logs: LogIndex,
  from: string,
  to: string,
  today: string,
): DayScore[] {
  return eachDay(from, to).map((d) => scoreDay(objectives, logs, d, today))
}
