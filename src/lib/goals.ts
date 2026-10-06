import { daysBetween, formatShort } from './dates'
import type { Goal } from './types'

/** Teto do progresso: o alvo (numérico) ou 100 (percentual). */
export function goalCeiling(g: Goal): number {
  return g.progress_type === 'numeric' ? (g.target_value ?? 0) : 100
}

/** Progresso de 0 a 100. */
export function goalPercent(g: Goal): number {
  const ceiling = goalCeiling(g)
  if (ceiling <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((g.current_value / ceiling) * 100)))
}

export function goalReached(g: Goal): boolean {
  const ceiling = goalCeiling(g)
  return ceiling > 0 && g.current_value >= ceiling
}

/** Valor depois de um toque em "−" (direction −1) ou "+" (direction 1), dentro dos limites. */
export function steppedValue(g: Goal, direction: 1 | -1): number {
  const step = g.progress_type === 'numeric' ? 1 : 5
  return Math.min(goalCeiling(g), Math.max(0, g.current_value + direction * step))
}

const number = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

/** "17 / 24 livros" ou "40%". */
export function formatGoalValue(g: Goal): string {
  if (g.progress_type === 'percent') return `${number(g.current_value)}%`
  const value = `${number(g.current_value)} / ${number(g.target_value ?? 0)}`
  return g.unit ? `${value} ${g.unit}` : value
}

export interface DueLabel {
  text: string
  tone: 'muted' | 'streak' | 'negative'
}

export function dueLabel(dueDate: string, today: string): DueLabel {
  const days = daysBetween(today, dueDate)
  if (days === 0) return { text: 'vence hoje', tone: 'streak' }
  if (days < 0) {
    const late = -days
    return {
      text: `prazo vencido há ${late} ${late === 1 ? 'dia' : 'dias'}`,
      tone: 'negative',
    }
  }
  return {
    text: `até ${formatShort(dueDate)} · ${days === 1 ? 'falta 1 dia' : `faltam ${days} dias`}`,
    tone: 'muted',
  }
}

/** Prazo mais próximo primeiro; sem prazo no fim; depois por criação. */
export function sortByDueDate(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => {
    if (a.due_date !== b.due_date) {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return a.due_date < b.due_date ? -1 : 1
    }
    return a.created_at.localeCompare(b.created_at)
  })
}
