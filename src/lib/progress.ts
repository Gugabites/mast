import { addDays } from './dates'
import type { DayScore } from './scoring'
import type { Objective } from './types'

export type RangeDays = 7 | 30 | 90

/** Dia encerrado com algo programado: é o único tipo de dia que entra nas médias. */
function counts(score: DayScore): boolean {
  return score.final && score.positivesTotal + score.negativesTotal > 0
}

/** Primeiro dia com algo programado. Null se não houver objetivos. */
export function firstTrackedDay(objectives: Objective[]): string | null {
  const days = objectives.map((o) =>
    o.schedule === 'once' && o.once_date ? o.once_date : o.starts_on,
  )
  return days.length > 0 ? days.sort()[0] : null
}

/** Intervalo do gráfico: de max(hoje − (n − 1), primeiro dia rastreado) até hoje. Null se não houver objetivos. */
export function chartRange(
  objectives: Objective[],
  today: string,
  n: RangeDays,
): { from: string; to: string } | null {
  const first = firstTrackedDay(objectives)
  if (!first) return null
  const windowStart = addDays(today, -(n - 1))
  const from = first > windowStart ? first : windowStart
  return { from: from > today ? today : from, to: today }
}

/**
 * Média móvel do saldo. Em cada posição, considera os dias válidos (encerrados
 * e com algo programado) da janela que termina ali; null se forem menos de 3.
 */
export function movingAverage(scores: DayScore[], window = 7): (number | null)[] {
  return scores.map((_, i) => {
    const valid = scores.slice(Math.max(0, i - window + 1), i + 1).filter(counts)
    if (valid.length < 3) return null
    const average = valid.reduce((sum, s) => sum + s.balance, 0) / valid.length
    return Math.round(average * 10) / 10
  })
}

export interface RangeSummary {
  /** Dias encerrados com algo programado. */
  closedDays: number
  /** Média do saldo nesses dias, arredondada. */
  avgBalance: number | null
  /** Média do aproveitamento (só dias com pct não nulo). */
  avgPct: number | null
  /** Dias encerrados com saldo > 0. */
  positiveDays: number
  /** Maior saldo; no empate, o mais recente. */
  bestDay: DayScore | null
  /** Soma do saldo dos dias encerrados. */
  totalBalance: number
}

export function summarizeRange(scores: DayScore[]): RangeSummary {
  const closed = scores.filter(counts)
  const totalBalance = closed.reduce((sum, s) => sum + s.balance, 0)
  const pcts = closed.flatMap((s) => (s.pct === null ? [] : [s.pct]))

  let bestDay: DayScore | null = null
  for (const score of closed) {
    if (!bestDay || score.balance > bestDay.balance) bestDay = score
    else if (score.balance === bestDay.balance && score.date > bestDay.date) bestDay = score
  }

  return {
    closedDays: closed.length,
    avgBalance: closed.length > 0 ? Math.round(totalBalance / closed.length) : null,
    avgPct: pcts.length > 0 ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null,
    positiveDays: closed.filter((s) => s.balance > 0).length,
    bestDay,
    totalBalance,
  }
}
