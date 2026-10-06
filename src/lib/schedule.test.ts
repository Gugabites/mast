import { describe, expect, it } from 'vitest'
import {
  currentVersion,
  groupByLineage,
  isScheduledOn,
  latestVersion,
  objectivesForDay,
} from './schedule'
import { obj } from './testing'

describe('isScheduledOn', () => {
  it('daily vale a partir de starts_on', () => {
    const o = obj({ id: 'a' })
    expect(isScheduledOn(o, '2026-09-30')).toBe(false)
    expect(isScheduledOn(o, '2026-10-01')).toBe(true)
    expect(isScheduledOn(o, '2026-10-08')).toBe(true)
  })

  it('weekdays só vale nos dias escolhidos', () => {
    const o = obj({ id: 'a', schedule: 'weekdays', weekdays: [1, 3, 5] })
    expect(isScheduledOn(o, '2026-10-05')).toBe(true) // segunda
    expect(isScheduledOn(o, '2026-10-06')).toBe(false) // terça
    expect(isScheduledOn(o, '2026-10-07')).toBe(true) // quarta
  })

  it('once só vale na data', () => {
    const o = obj({ id: 'a', schedule: 'once', once_date: '2026-10-07' })
    expect(isScheduledOn(o, '2026-10-07')).toBe(true)
    expect(isScheduledOn(o, '2026-10-08')).toBe(false)
  })

  it('arquivado conta até o dia anterior ao arquivamento', () => {
    // 15:00 UTC de 5/10 = 12:00 de 5/10 em São Paulo
    const o = obj({ id: 'a', archived_at: '2026-10-05T15:00:00Z' })
    expect(isScheduledOn(o, '2026-10-04')).toBe(true)
    expect(isScheduledOn(o, '2026-10-05')).toBe(false)
  })

  it('a data do arquivamento usa o fuso de São Paulo, não UTC', () => {
    // 01:00 UTC de 6/10 = 22:00 de 5/10 em São Paulo
    const o = obj({ id: 'a', archived_at: '2026-10-06T01:00:00Z' })
    expect(isScheduledOn(o, '2026-10-05')).toBe(false)
  })
})

describe('objectivesForDay', () => {
  it('ordena por sort_order e depois created_at', () => {
    const list = [
      obj({ id: 'c', sort_order: 1, created_at: '2026-10-01T10:00:00Z' }),
      obj({ id: 'b', created_at: '2026-10-02T10:00:00Z' }),
      obj({ id: 'a', created_at: '2026-10-01T10:00:00Z' }),
      obj({ id: 'fora', schedule: 'once', once_date: '2026-10-03' }),
    ]
    expect(objectivesForDay(list, '2026-10-08').map((o) => o.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('linhagens', () => {
  const v1 = obj({ id: 'v1', lineage_id: 'L', archived_at: '2026-10-05T15:00:00Z' })
  const v2 = obj({ id: 'v2', lineage_id: 'L', created_at: '2026-10-05T15:00:00Z' })
  const other = obj({ id: 'x' })

  it('groupByLineage agrupa versões', () => {
    const groups = groupByLineage([v1, other, v2])
    expect(groups.get('L')?.map((o) => o.id)).toEqual(['v1', 'v2'])
    expect(groups.get('x')?.map((o) => o.id)).toEqual(['x'])
  })

  it('currentVersion devolve a não arquivada, ou null', () => {
    expect(currentVersion([v1, v2])?.id).toBe('v2')
    expect(currentVersion([v1])).toBeNull()
  })

  it('latestVersion devolve a mais recente', () => {
    expect(latestVersion([v2, v1]).id).toBe('v2')
  })
})
