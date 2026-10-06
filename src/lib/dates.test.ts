import { describe, expect, it } from 'vitest'
import { addDays, dayOfYear, greeting, todayISO, weekday, formatLong } from './dates'

describe('dates', () => {
  it('todayISO usa o fuso de São Paulo, não UTC', () => {
    // 02:30 UTC de 7/10 = 23:30 de 6/10 em São Paulo
    expect(todayISO(new Date('2026-10-07T02:30:00Z'))).toBe('2026-10-06')
    // 03:30 UTC de 7/10 = 00:30 de 7/10 em São Paulo
    expect(todayISO(new Date('2026-10-07T03:30:00Z'))).toBe('2026-10-07')
  })

  it('weekday segue 0=domingo', () => {
    expect(weekday('2026-10-04')).toBe(0) // domingo
    expect(weekday('2026-10-06')).toBe(2) // terça
    expect(weekday('2026-10-10')).toBe(6) // sábado
  })

  it('dayOfYear', () => {
    expect(dayOfYear('2026-01-01')).toBe(1)
    expect(dayOfYear('2026-12-31')).toBe(365)
    expect(dayOfYear('2028-12-31')).toBe(366) // ano bissexto
  })

  it('addDays atravessa mês e ano', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('formatLong em português', () => {
    expect(formatLong('2026-10-06')).toBe('terça-feira, 6 de outubro')
  })

  it('greeting por faixa de horário em São Paulo', () => {
    expect(greeting(new Date('2026-10-06T10:00:00Z'))).toBe('Bom dia')   // 07h SP
    expect(greeting(new Date('2026-10-06T17:00:00Z'))).toBe('Boa tarde') // 14h SP
    expect(greeting(new Date('2026-10-06T23:00:00Z'))).toBe('Boa noite') // 20h SP
  })
})
