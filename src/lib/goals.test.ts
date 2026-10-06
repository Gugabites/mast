import { describe, expect, it } from 'vitest'
import {
  dueLabel,
  formatGoalValue,
  goalPercent,
  goalReached,
  sortByDueDate,
  steppedValue,
} from './goals'
import type { Goal } from './types'

function goal(partial: Partial<Goal>): Goal {
  return {
    id: 'g',
    user_id: 'u',
    title: 'Meta',
    why: null,
    due_date: null,
    progress_type: 'numeric',
    current_value: 0,
    target_value: 24,
    unit: null,
    status: 'active',
    created_at: '2026-10-01T12:00:00Z',
    ...partial,
  }
}

const percent = (current_value: number) =>
  goal({ progress_type: 'percent', current_value, target_value: null })

describe('goals', () => {
  it('goalPercent e goalReached', () => {
    expect(goalPercent(goal({ current_value: 17 }))).toBe(71)
    expect(goalPercent(percent(40))).toBe(40)
    expect(goalPercent(goal({ current_value: 30 }))).toBe(100)
    expect(goalReached(goal({ current_value: 23 }))).toBe(false)
    expect(goalReached(goal({ current_value: 24 }))).toBe(true)
    expect(goalReached(percent(100))).toBe(true)
  })

  it('steppedValue: passo 1 no numérico e 5 no percentual, dentro dos limites', () => {
    expect(steppedValue(goal({ current_value: 17 }), 1)).toBe(18)
    expect(steppedValue(goal({ current_value: 24 }), 1)).toBe(24)
    expect(steppedValue(goal({ current_value: 0 }), -1)).toBe(0)
    expect(steppedValue(percent(0), 1)).toBe(5)
    expect(steppedValue(percent(98), 1)).toBe(100)
    expect(steppedValue(percent(3), -1)).toBe(0)
  })

  it('formatGoalValue', () => {
    expect(formatGoalValue(goal({ current_value: 17, unit: 'livros' }))).toBe('17 / 24 livros')
    expect(formatGoalValue(goal({ current_value: 2.5, target_value: 10 }))).toBe('2,5 / 10')
    expect(formatGoalValue(percent(40))).toBe('40%')
  })

  it('dueLabel', () => {
    expect(dueLabel('2026-12-31', '2026-10-06')).toEqual({
      text: 'até 31 dez · faltam 86 dias',
      tone: 'muted',
    })
    expect(dueLabel('2026-10-07', '2026-10-06').text).toBe('até 7 out · falta 1 dia')
    expect(dueLabel('2026-10-06', '2026-10-06')).toEqual({ text: 'vence hoje', tone: 'streak' })
    expect(dueLabel('2026-10-03', '2026-10-06')).toEqual({
      text: 'prazo vencido há 3 dias',
      tone: 'negative',
    })
  })

  it('sortByDueDate: prazo mais próximo primeiro, sem prazo no fim', () => {
    const sorted = sortByDueDate([
      goal({ id: 'sem-prazo-novo', created_at: '2026-10-03T12:00:00Z' }),
      goal({ id: 'dezembro', due_date: '2026-12-31' }),
      goal({ id: 'sem-prazo-antigo', created_at: '2026-10-02T12:00:00Z' }),
      goal({ id: 'novembro', due_date: '2026-11-15' }),
    ])
    expect(sorted.map((g) => g.id)).toEqual([
      'novembro',
      'dezembro',
      'sem-prazo-antigo',
      'sem-prazo-novo',
    ])
  })
})
