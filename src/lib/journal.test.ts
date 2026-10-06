import { describe, expect, it } from 'vitest'
import { displayTitle, groupByMonth, needsSave, preview, wordCount } from './journal'
import type { JournalEntry } from './types'

const entry = (partial: Partial<JournalEntry>): JournalEntry => ({
  id: 'e',
  user_id: 'u',
  entry_date: '2026-10-06',
  title: null,
  body: '',
  created_at: '2026-10-06T12:00:00Z',
  updated_at: '2026-10-06T12:00:00Z',
  ...partial,
})

describe('displayTitle', () => {
  it('usa o título quando existe', () => {
    expect(displayTitle({ title: ' Dia difícil ', body: 'texto' })).toBe('Dia difícil')
  })

  it('sem título, usa a primeira linha não vazia do corpo', () => {
    expect(displayTitle({ title: null, body: '\n\n  Acordei cedo.\nSegunda linha.' })).toBe(
      'Acordei cedo.',
    )
  })

  it('corta a primeira linha longa com reticências', () => {
    const title = displayTitle({ title: '', body: 'a'.repeat(100) })
    expect(title).toBe(`${'a'.repeat(80)}…`)
  })

  it('sem título e sem corpo', () => {
    expect(displayTitle({ title: null, body: '   ' })).toBe('Sem título')
  })
})

describe('preview', () => {
  it('com título, mostra o corpo com espaços colapsados', () => {
    expect(preview({ title: 'Título', body: 'Linha um.\n\nLinha   dois.' })).toBe(
      'Linha um. Linha dois.',
    )
  })

  it('sem título, não repete a linha usada como título', () => {
    expect(preview({ title: null, body: 'Acordei cedo.\nSegunda linha.' })).toBe('Segunda linha.')
  })

  it('corta em 160 caracteres', () => {
    const text = preview({ title: 'T', body: 'b'.repeat(200) })
    expect(text).toBe(`${'b'.repeat(160)}…`)
  })
})

describe('wordCount', () => {
  it('conta palavras separadas por qualquer espaço em branco', () => {
    expect(wordCount('')).toBe(0)
    expect(wordCount('   ')).toBe(0)
    expect(wordCount('  um  dois\ntrês ')).toBe(3)
  })
})

describe('groupByMonth', () => {
  it('agrupa por mês, do mais recente para o mais antigo', () => {
    const groups = groupByMonth([
      entry({ id: 'set-10', entry_date: '2026-09-10' }),
      entry({ id: 'out-02', entry_date: '2026-10-02' }),
      entry({ id: 'set-28', entry_date: '2026-09-28' }),
      entry({ id: 'out-06-cedo', entry_date: '2026-10-06', created_at: '2026-10-06T10:00:00Z' }),
      entry({ id: 'out-06-tarde', entry_date: '2026-10-06', created_at: '2026-10-06T20:00:00Z' }),
    ])
    expect(groups.map((g) => [g.key, g.label])).toEqual([
      ['2026-10', 'Outubro de 2026'],
      ['2026-09', 'Setembro de 2026'],
    ])
    expect(groups[0].entries.map((e) => e.id)).toEqual(['out-06-tarde', 'out-06-cedo', 'out-02'])
    expect(groups[1].entries.map((e) => e.id)).toEqual(['set-28', 'set-10'])
  })
})

describe('needsSave', () => {
  const saved = { entry_date: '2026-10-06', title: 'T', body: 'texto' }

  it('corpo vazio nunca é gravado, nem em entrada nova nem em existente', () => {
    expect(needsSave({ ...saved, body: '  \n ' }, null)).toBe(false)
    expect(needsSave({ ...saved, body: '' }, saved)).toBe(false)
  })

  it('entrada nova com texto precisa ser gravada', () => {
    expect(needsSave(saved, null)).toBe(true)
  })

  it('conteúdo igual ao salvo não é gravado de novo', () => {
    expect(needsSave({ ...saved }, saved)).toBe(false)
    expect(needsSave({ ...saved, title: ' T ' }, saved)).toBe(false)
  })

  it('qualquer mudança de data, título ou corpo é gravada', () => {
    expect(needsSave({ ...saved, entry_date: '2026-10-05' }, saved)).toBe(true)
    expect(needsSave({ ...saved, title: 'Outro' }, saved)).toBe(true)
    expect(needsSave({ ...saved, body: 'texto ' }, saved)).toBe(true)
  })
})
