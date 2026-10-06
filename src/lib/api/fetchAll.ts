import { ApiError } from './errors'

// O Supabase devolve no máximo 1.000 linhas por consulta.
const PAGE = 1000

interface Page<T> {
  data: T[] | null
  error: { message: string; code?: string } | null
}

/** Busca todas as linhas de uma consulta, paginando de 1.000 em 1.000. */
export async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<Page<T>>,
): Promise<T[]> {
  const all: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1)
    if (error) throw new ApiError(error.message, error.code)
    const rows = data ?? []
    all.push(...rows)
    if (rows.length < PAGE) break
  }
  return all
}
