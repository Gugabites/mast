import { useCallback, useEffect, useState } from 'react'
import { userMessage } from '../lib/api/errors'
import { listEntries } from '../lib/api/journal'
import type { JournalEntry } from '../lib/types'

/** Entradas da lista do journal: estado local à página, carregado ao abrir. */
export function useJournal() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<JournalEntry[]>([])

  const load = useCallback(
    () =>
      listEntries().then(
        (rows) => {
          setEntries(rows)
          setError(null)
          setStatus('ready')
        },
        (e: unknown) => {
          setError(userMessage(e))
          setStatus('error')
        },
      ),
    [],
  )

  useEffect(() => {
    load()
  }, [load])

  async function reload() {
    setStatus((s) => (s === 'error' ? 'loading' : s))
    await load()
  }

  return { status, error, entries, reload }
}
