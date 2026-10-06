import { describe, expect, it } from 'vitest'
import { MISSED_PENALTY_RATIO, scoreDay, scoreRange } from './scoring'
import { obj, octoberLogs } from './testing'

const TODAY = '2026-10-08' // quinta

const A = obj({ id: 'A', weight: 20 })
const B = obj({ id: 'B', schedule: 'weekdays', weekdays: [1, 3, 5] })
const C = obj({ id: 'C', polarity: 'negative', weight: 30 })
const D = obj({ id: 'D', schedule: 'once', once_date: '2026-10-07' })
const ALL = [A, B, C, D]

describe('scoreDay', () => {
  it('dia encerrado: pendências descontam metade, negativo desconta inteiro', () => {
    const s = scoreDay(ALL, octoberLogs({ A: [7], C: [7] }), '2026-10-07', TODAY)
    expect(s).toMatchObject({
      earned: 20,
      lost: 40, // 5 (B) + 5 (D) + 30 (C)
      balance: -20,
      maxPossible: 40,
      pct: 50,
      final: true,
      positivesDone: 1,
      positivesTotal: 3,
      negativesOccurred: 1,
      negativesTotal: 1,
    })
  })

  it('dia encerrado com tudo feito', () => {
    const s = scoreDay(ALL, octoberLogs({ A: [7], B: [7], D: [7] }), '2026-10-07', TODAY)
    expect(s).toMatchObject({ earned: 40, lost: 0, balance: 40, maxPossible: 40, pct: 100 })
  })

  it('hoje: pendências ainda não descontam', () => {
    const s = scoreDay(ALL, octoberLogs({}), TODAY, TODAY)
    expect(s).toMatchObject({
      earned: 0,
      lost: 0,
      balance: 0,
      maxPossible: 20,
      pct: 0,
      final: false,
    })
  })

  it('hoje: negativo ocorrido desconta na hora', () => {
    const s = scoreDay(ALL, octoberLogs({ C: [8] }), TODAY, TODAY)
    expect(s).toMatchObject({ earned: 0, lost: 30, balance: -30, maxPossible: 20, pct: 0 })
  })

  it('dia sem nada programado: aproveitamento nulo', () => {
    const s = scoreDay(ALL, octoberLogs({}), '2026-09-30', TODAY)
    expect(s).toMatchObject({
      earned: 0,
      lost: 0,
      balance: 0,
      maxPossible: 0,
      pct: null,
      final: true,
    })
  })

  it('peso 30 não feito em dia encerrado desconta 15', () => {
    expect(MISSED_PENALTY_RATIO).toBe(0.5)
    const heavy = obj({ id: 'H', weight: 30 })
    expect(scoreDay([heavy], octoberLogs({}), '2026-10-07', TODAY).lost).toBe(15)
  })
})

describe('scoreRange', () => {
  it('devolve uma pontuação por dia do intervalo', () => {
    const range = scoreRange(ALL, octoberLogs({ A: [6, 7] }), '2026-10-06', TODAY, TODAY)
    expect(range.map((s) => s.date)).toEqual(['2026-10-06', '2026-10-07', '2026-10-08'])
    expect(range.map((s) => s.earned)).toEqual([20, 20, 0])
  })
})
