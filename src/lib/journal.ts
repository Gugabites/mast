import type { JournalEntry } from './types'

type Text = Pick<JournalEntry, 'title' | 'body'>

/** O que o editor edita. Título vazio é string vazia aqui e null no banco. */
export interface JournalDraft {
  entry_date: string
  title: string
  body: string
}

const TITLE_MAX = 80
const PREVIEW_MAX = 160

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

function firstLine(body: string): string {
  return (
    body
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line !== '') ?? ''
  )
}

/** Título exibido: o título, ou a primeira linha não vazia do corpo (até 80 caracteres, com "…"). */
export function displayTitle(e: Text): string {
  const title = e.title?.trim()
  if (title) return title
  return truncate(firstLine(e.body), TITLE_MAX) || 'Sem título'
}

/** Prévia: texto do corpo sem a linha usada como título, espaços colapsados, até 160 caracteres. */
export function preview(e: Text): string {
  let body = e.body
  if (!e.title?.trim()) {
    const lines = body.split('\n')
    const index = lines.findIndex((line) => line.trim() !== '')
    body = lines.slice(index + 1).join('\n')
  }
  return truncate(body.replace(/\s+/g, ' ').trim(), PREVIEW_MAX)
}

/** Contagem de palavras (separadas por espaço em branco). */
export function wordCount(text: string): number {
  const trimmed = text.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
}

export interface MonthGroup {
  key: string
  label: string
  entries: JournalEntry[]
}

/** Agrupa por mês: [{ key: '2026-10', label: 'Outubro de 2026', entries }], mais recente primeiro. */
export function groupByMonth(entries: JournalEntry[]): MonthGroup[] {
  const sorted = [...entries].sort(
    (a, b) => b.entry_date.localeCompare(a.entry_date) || b.created_at.localeCompare(a.created_at),
  )
  const groups: MonthGroup[] = []
  for (const entry of sorted) {
    const key = entry.entry_date.slice(0, 7)
    const last = groups[groups.length - 1]
    if (last?.key === key) {
      last.entries.push(entry)
    } else {
      const [year, month] = key.split('-').map(Number)
      groups.push({ key, label: `${MONTHS[month - 1]} de ${year}`, entries: [entry] })
    }
  }
  return groups
}

/**
 * true se o rascunho precisa ser gravado: tem texto e difere do que está salvo.
 * Corpo vazio nunca é gravado (nem cria entrada, nem apaga o texto de uma existente).
 */
export function needsSave(draft: JournalDraft, saved: JournalDraft | null): boolean {
  if (draft.body.trim() === '') return false
  if (!saved) return true
  return (
    draft.entry_date !== saved.entry_date ||
    draft.title.trim() !== saved.title.trim() ||
    draft.body !== saved.body
  )
}
