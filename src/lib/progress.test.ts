import { describe, expect, it } from 'vitest'
import { chartRange, firstTrackedDay, movingAverage, summarizeRange } from './progress'
import type { DayScore } from './scoring'
import { obj } from './testing'

const TODAY = '2026-10-08'

/** Pontuação de um dia de outubro; por padrão encerrado, com um positivo programado. */
function score(day: number, balance: number, partial: Partial<DayScore> = {}): DayScore {
  return {
    date: `2026-10-${String(day).padStart(2, '0')}`,
    earned: Math.max(balance, 0),
    lost: Math.max(-balance, 0),
    balance,
    maxPossible: 20,
    pct: balance > 0 ? 100 : 0,
    positivesDone: balance > 0 ? 1 : 0,
    positivesTotal: 1,
    negativesOccurred: 0,
    negativesTotal: 0,
    final: true,
    ...partial,
  }
}

const NOTHING_SCHEDULED = { positivesTotal: 0, maxPossible: 0, pct: null }

describe('firstTrackedDay', () => {
  it('sem objetivos devolve null', () => {
    expect(firstTrackedDay([])).toBeNull()
  })

  it('usa o menor starts_on dos recorrentes', () => {
    const list = [obj({ id: 'a', starts_on: '2026-10-05' }), obj({ id: 'b', starts_on: '2026-10-02' })]
    expect(firstTrackedDay(list)).toBe('2026-10-02')
  })

  it('um avulso mais antigo vence', () => {
    const list = [
      obj({ id: 'a', starts_on: '2026-10-05' }),
      // criado em 6/10, mas para o dia 1/10
      obj({ id: 'o', schedule: 'once', once_date: '2026-10-01', starts_on: '2026-10-06' }),
    ]
    expect(firstTrackedDay(list)).toBe('2026-10-01')
  })
})

describe('chartRange', () => {
  it('sem objetivos devolve null', () => {
    expect(chartRange([], TODAY, 7)).toBeNull()
  })

  it('começa no primeiro dia rastreado quando ele é mais recente que a janela', () => {
    const list = [obj({ id: 'a', starts_on: '2026-10-06' })]
    expect(chartRange(list, TODAY, 7)).toEqual({ from: '2026-10-06', to: TODAY })
  })

  it('usa a janela inteira quando há histórico suficiente', () => {
    const list = [obj({ id: 'a', starts_on: '2026-01-01' })]
    expect(chartRange(list, TODAY, 7)).toEqual({ from: '2026-10-02', to: TODAY })
    expect(chartRange(list, TODAY, 30)).toEqual({ from: '2026-09-09', to: TODAY })
  })
})

describe('summarizeRange', () => {
  it('ignora o dia corrente e os dias sem nada programado', () => {
    const summary = summarizeRange([
      score(5, 20),
      score(6, -10),
      score(7, 0, NOTHING_SCHEDULED),
      score(8, 40, { final: false }), // hoje, parcial
    ])
    expect(summary).toMatchObject({
      closedDays: 2,
      avgBalance: 5,
      avgPct: 50,
      positiveDays: 1,
      totalBalance: 10,
    })
    expect(summary.bestDay?.date).toBe('2026-10-05')
  })

  it('no empate, o melhor dia é o mais recente', () => {
    const summary = summarizeRange([score(3, 30), score(4, 10), score(5, 30)])
    expect(summary.bestDay?.date).toBe('2026-10-05')
  })

  it('sem dias válidos: médias nulas e contagens zeradas', () => {
    expect(summarizeRange([score(8, 20, { final: false })])).toEqual({
      closedDays: 0,
      avgBalance: null,
      avgPct: null,
      positiveDays: 0,
      bestDay: null,
      totalBalance: 0,
    })
  })
})

describe('movingAverage', () => {
  it('precisa de pelo menos 3 dias válidos na janela', () => {
    expect(movingAverage([score(1, 10), score(2, 20), score(3, 30), score(4, 40)])).toEqual([
      null,
      null,
      20,
      25,
    ])
  })

  it('a janela é de 7 dias', () => {
    const scores = [10, 10, 10, 10, 10, 10, 10, 80].map((balance, i) => score(i + 1, balance))
    // posição 7: dias 2 a 8 → (6 × 10 + 80) / 7
    expect(movingAverage(scores)[7]).toBe(20)
  })

  it('pula dias sem nada programado e o dia corrente', () => {
    const scores = [
      score(1, 10),
      score(2, 0, NOTHING_SCHEDULED),
      score(3, 20),
      score(4, 30),
      score(5, 90, { final: false }),
    ]
    expect(movingAverage(scores)).toEqual([null, null, null, 20, 20])
  })
})
