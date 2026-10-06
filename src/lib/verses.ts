import { dayOfYear } from './dates'
import type { Verse } from './types'

/**
 * Versículo do dia d. Null se não houver versículos.
 * Usa o índice na lista ordenada (e não `position === n`), então funciona
 * com qualquer quantidade e mesmo com buracos na numeração.
 */
export function verseForDay(verses: Verse[], d: string): Verse | null {
  if (verses.length === 0) return null
  const sorted = [...verses].sort((a, b) => a.position - b.position)
  const index = (dayOfYear(d) - 1) % sorted.length
  return sorted[index]
}
