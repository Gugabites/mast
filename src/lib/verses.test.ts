import { describe, expect, it } from 'vitest'
import type { Verse } from './types'
import { verseForDay } from './verses'

const verse = (position: number): Verse => ({
  id: position,
  position,
  reference: `Ref ${position}`,
  text: `Texto ${position}`,
  reflection: '',
  question: '',
  theme: null,
})

const THIRTY = Array.from({ length: 30 }, (_, i) => verse(i + 1))
const positionOn = (verses: Verse[], d: string) => verseForDay(verses, d)?.position

describe('verseForDay', () => {
  it('lista vazia devolve null', () => {
    expect(verseForDay([], '2026-01-01')).toBeNull()
  })

  it('percorre os 30 versículos e recomeça', () => {
    expect(positionOn(THIRTY, '2026-01-01')).toBe(1) // dia 1
    expect(positionOn(THIRTY, '2026-01-30')).toBe(30) // dia 30
    expect(positionOn(THIRTY, '2026-01-31')).toBe(1) // dia 31
    expect(positionOn(THIRTY, '2026-10-06')).toBe(9) // dia 279
    expect(positionOn(THIRTY, '2026-10-09')).toBe(12) // dia 282
    expect(positionOn(THIRTY, '2028-12-31')).toBe(6) // dia 366, ano bissexto
  })

  it('não depende da ordem da lista', () => {
    const shuffled = [THIRTY[29], ...THIRTY.slice(0, 29)]
    expect(positionOn(shuffled, '2026-10-06')).toBe(9)
  })

  it('funciona com buracos na numeração', () => {
    const withGap = [verse(1), verse(2), verse(5)]
    expect(positionOn(withGap, '2026-01-03')).toBe(5)
  })
})
