import { supabase } from '../supabase'
import type { Verse } from '../types'
import { fetchAll } from './fetchAll'

export function listVerses(): Promise<Verse[]> {
  return fetchAll<Verse>((from, to) =>
    supabase.from('verses').select('*').order('position', { ascending: true }).range(from, to),
  )
}
