import type { Schedule, Weight } from './types'

// Índice = dia da semana no padrão do banco (0 = domingo).
export const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const WEEKDAY_LONG = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]
export const WEEKDAY_LETTER = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

/** Dias na ordem de exibição: segunda → domingo. */
export const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0]

export const WEIGHT_LABEL: Record<Weight, string> = { 10: 'Baixo', 20: 'Médio', 30: 'Alto' }

/** +20, −10 (sinal de menos tipográfico U+2212), 0 */
export function formatPoints(n: number): string {
  if (n > 0) return `+${n}`
  if (n < 0) return `−${Math.abs(n)}`
  return '0'
}

/** Rótulo de frequência de um objetivo. */
export function frequencyLabel(schedule: Schedule, weekdays: number[] | null): string {
  if (schedule === 'once') return 'Só neste dia'
  if (schedule === 'daily') return 'Todos os dias'

  const days = MONDAY_FIRST.filter((d) => (weekdays ?? []).includes(d))
  const key = days.join(',')
  if (days.length === 7) return 'Todos os dias'
  if (key === '1,2,3,4,5') return 'Dias úteis'
  if (key === '6,0') return 'Fins de semana'
  return days.map((d) => WEEKDAY_SHORT[d]).join(', ')
}

/** Normaliza dias: ordena, remove duplicados. 7 dias → retorna null e o chamador salva como 'daily'. */
export function normalizeWeekdays(days: number[]): number[] | null {
  const unique = [...new Set(days)].sort((a, b) => a - b)
  return unique.length === 7 ? null : unique
}
