import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { listVerses } from '../lib/api/verses'
import type { Verse } from '../lib/types'

const CACHE_KEY = 'mast:verses:v1'

function readCache(): Verse[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null')
    return Array.isArray(parsed) ? (parsed as Verse[]) : []
  } catch {
    return []
  }
}

function writeCache(verses: Verse[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(verses))
  } catch {
    // Sem espaço ou sem permissão: segue sem cache.
  }
}

const VersesContext = createContext<Verse[]>([])

/**
 * Todos os versículos (são poucos), carregados uma vez por sessão.
 * O cache local mostra o versículo na hora; o banco atualiza em seguida.
 * Se a busca falhar, segue com o cache; sem cache, a lista fica vazia
 * e o card simplesmente não aparece.
 */
export function VersesProvider({ children }: { children: ReactNode }) {
  const [verses, setVerses] = useState<Verse[]>(readCache)

  useEffect(() => {
    listVerses().then(
      (rows) => {
        setVerses(rows)
        writeCache(rows)
      },
      () => {},
    )
  }, [])

  return <VersesContext.Provider value={verses}>{children}</VersesContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useVerses(): Verse[] {
  return useContext(VersesContext)
}
