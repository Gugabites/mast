import { describe, expect, it } from 'vitest'
import {
  addDays,
  capitalize,
  dayOfYear,
  daysBetween,
  eachDay,
  formatLong,
  formatShort,
  greeting,
  isValidISODate,
  localDateOf,
  relativeDayLabel,
  todayISO,
  weekday,
} from './dates'

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

  it('eachDay atravessa o mês e devolve vazio se from > to', () => {
    expect(eachDay('2026-10-30', '2026-11-02')).toEqual([
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ])
    expect(eachDay('2026-10-02', '2026-10-01')).toEqual([])
  })

  it('localDateOf usa o fuso de São Paulo', () => {
    // 01:00 UTC de 6/10 = 22:00 de 5/10 em São Paulo
    expect(localDateOf('2026-10-06T01:00:00Z')).toBe('2026-10-05')
  })

  it('formatShort sem ponto no mês', () => {
    expect(formatShort('2026-10-06')).toBe('6 out')
    expect(formatShort('2026-05-01')).toBe('1 mai')
  })

  it('relativeDayLabel', () => {
    expect(relativeDayLabel('2026-10-08', '2026-10-08')).toBe('Hoje')
    expect(relativeDayLabel('2026-10-07', '2026-10-08')).toBe('Ontem')
    expect(relativeDayLabel('2026-10-06', '2026-10-08')).toBe('6 out')
  })

  it('daysBetween', () => {
    expect(daysBetween('2026-10-06', '2026-12-31')).toBe(86)
    expect(daysBetween('2026-10-06', '2026-10-03')).toBe(-3)
  })

  it('capitalize', () => {
    expect(capitalize('terça-feira, 6 de outubro')).toBe('Terça-feira, 6 de outubro')
  })

  it('isValidISODate', () => {
    expect(isValidISODate('2026-10-06')).toBe(true)
    expect(isValidISODate('2026-02-30')).toBe(false)
    expect(isValidISODate('2026-13-01')).toBe(false)
    expect(isValidISODate('06/10/2026')).toBe(false)
    expect(isValidISODate('')).toBe(false)
  })
})
