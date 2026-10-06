import { describe, expect, it } from 'vitest'
import { allStreaks, lineageStreak } from './streaks'
import { obj, octoberLogs } from './testing'

const TODAY = '2026-10-08' // quinta; 1/10 é quinta, 5/10 é segunda

describe('lineageStreak — positivo', () => {
  const daily = obj({ id: 'p' })

  it('falha em dia encerrado zera; hoje pendente é neutro', () => {
    const logs = octoberLogs({ p: [1, 2, 3, 5, 6, 7] }) // falhou 4/10
    expect(lineageStreak([daily], logs, TODAY)).toEqual({ current: 3, best: 3 })
  })

  it('feito hoje soma', () => {
    const logs = octoberLogs({ p: [1, 2, 3, 5, 6, 7, 8] })
    expect(lineageStreak([daily], logs, TODAY)).toEqual({ current: 4, best: 4 })
  })

  it('guarda o recorde depois de quebrar', () => {
    const logs = octoberLogs({ p: [1, 2, 3, 4, 5, 7] }) // falhou 6/10
    expect(lineageStreak([daily], logs, TODAY)).toEqual({ current: 1, best: 5 })
  })

  it('dias não programados não quebram', () => {
    const o = obj({ id: 'w', schedule: 'weekdays', weekdays: [1, 3, 5] })
    const logs = octoberLogs({ w: [2, 5, 7] }) // sex, seg, qua
    expect(lineageStreak([o], logs, TODAY).current).toBe(3)
  })
})

describe('lineageStreak — negativo', () => {
  const daily = obj({ id: 'n', polarity: 'negative' })

  it('conta dias encerrados sem ocorrência; hoje é neutro', () => {
    const logs = octoberLogs({ n: [3] })
    expect(lineageStreak([daily], logs, TODAY)).toEqual({ current: 4, best: 4 }) // 4 a 7/10
  })

  it('ocorrência hoje zera', () => {
    expect(lineageStreak([daily], octoberLogs({ n: [8] }), TODAY).current).toBe(0)
  })
})

describe('lineageStreak — linhagem', () => {
  it('editar (nova versão na mesma linhagem) não zera a sequência', () => {
    const v1 = obj({ id: 'v1', lineage_id: 'L', weight: 20, archived_at: '2026-10-05T15:00:00Z' })
    const v2 = obj({ id: 'v2', lineage_id: 'L', weight: 30, starts_on: '2026-10-05' })
    const logs = octoberLogs({ v1: [1, 2, 3, 4], v2: [5, 6, 7] })
    expect(lineageStreak([v1, v2], logs, TODAY).current).toBe(7)
  })

  it('dias arquivados não contam nem quebram (restaurar)', () => {
    const v1 = obj({ id: 'v1', lineage_id: 'L', archived_at: '2026-10-03T15:00:00Z' })
    const v2 = obj({ id: 'v2', lineage_id: 'L', starts_on: '2026-10-06' })
    const logs = octoberLogs({ v1: [1, 2], v2: [6, 7] })
    expect(lineageStreak([v1, v2], logs, TODAY)).toEqual({ current: 4, best: 4 })
  })

  it('objetivo avulso não tem sequência', () => {
    const once = obj({ id: 'o', schedule: 'once', once_date: '2026-10-07' })
    expect(lineageStreak([once], octoberLogs({ o: [7] }), TODAY)).toEqual({ current: 0, best: 0 })
  })
})

describe('allStreaks', () => {
  it('indexa por lineage_id e ignora avulsos', () => {
    const v1 = obj({ id: 'v1', lineage_id: 'L', archived_at: '2026-10-05T15:00:00Z' })
    const v2 = obj({ id: 'v2', lineage_id: 'L', starts_on: '2026-10-05' })
    const once = obj({ id: 'o', schedule: 'once', once_date: '2026-10-07' })
    const streaks = allStreaks([v1, once, v2], octoberLogs({ v1: [4], v2: [5, 6, 7] }), TODAY)
    expect([...streaks.keys()]).toEqual(['L'])
    expect(streaks.get('L')).toEqual({ current: 4, best: 4 })
  })
})
