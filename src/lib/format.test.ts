import { describe, expect, it } from 'vitest'
import { formatPoints, frequencyLabel, normalizeWeekdays } from './format'

describe('format', () => {
  it('formatPoints usa sinal tipográfico', () => {
    expect(formatPoints(20)).toBe('+20')
    expect(formatPoints(-10)).toBe('−10')
    expect(formatPoints(0)).toBe('0')
  })

  it('frequencyLabel', () => {
    expect(frequencyLabel('daily', null)).toBe('Todos os dias')
    expect(frequencyLabel('weekdays', [1, 2, 3, 4, 5])).toBe('Dias úteis')
    expect(frequencyLabel('weekdays', [0, 6])).toBe('Fins de semana')
    expect(frequencyLabel('weekdays', [1, 3, 5])).toBe('Seg, Qua, Sex')
    expect(frequencyLabel('weekdays', [0, 2])).toBe('Ter, Dom') // ordem de segunda a domingo
    expect(frequencyLabel('once', null)).toBe('Só neste dia')
  })

  it('normalizeWeekdays ordena, remove duplicados e reduz 7 dias a null', () => {
    expect(normalizeWeekdays([5, 1, 1, 3])).toEqual([1, 3, 5])
    expect(normalizeWeekdays([0, 1, 2, 3, 4, 5, 6])).toBeNull()
  })
})
