import { supabase } from '../supabase'
import type { JournalEntry } from '../types'
import { unwrap } from './errors'
import { fetchAll } from './fetchAll'

export interface JournalInput {
  entry_date: string
  title: string | null
  body: string
}

// Título vazio vira null. O corpo vai como está: espaços e quebras de linha são do usuário.
const clean = (input: JournalInput): JournalInput => ({
  entry_date: input.entry_date,
  title: input.title?.trim() || null,
  body: input.body,
})

export function listEntries(): Promise<JournalEntry[]> {
  return fetchAll<JournalEntry>((from, to) =>
    supabase
      .from('journal_entries')
      .select('*')
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to),
  )
}

/** Null se a entrada não existe (ou não é deste usuário). */
export async function getEntry(id: string): Promise<JournalEntry | null> {
  return unwrap<JournalEntry | null>(
    await supabase.from('journal_entries').select('*').eq('id', id).maybeSingle(),
  )
}

export async function createEntry(input: JournalInput): Promise<JournalEntry> {
  return unwrap<JournalEntry>(
    await supabase.from('journal_entries').insert(clean(input)).select().single(),
  )
}

export async function updateEntry(id: string, input: JournalInput): Promise<JournalEntry> {
  return unwrap<JournalEntry>(
    await supabase.from('journal_entries').update(clean(input)).eq('id', id).select().single(),
  )
}

export async function deleteEntry(id: string): Promise<void> {
  unwrap(await supabase.from('journal_entries').delete().eq('id', id))
}
