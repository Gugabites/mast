export class ApiError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

interface Result<T> {
  data: T | null
  error: { message: string; code?: string } | null
}

/** Devolve `data` ou lança ApiError. */
export function unwrap<T>({ data, error }: Result<T>): T {
  if (error) throw new ApiError(error.message, error.code)
  return data as T
}

/** Converte qualquer erro em mensagem para o usuário, em português. */
export function userMessage(err: unknown): string {
  const code = err instanceof ApiError ? err.code : undefined
  const message = err instanceof Error ? err.message : String(err)

  if (code === '23505') return 'Isso já estava registrado.'
  if (code === '23514') return 'Algum dado está inválido. Revise o formulário.'
  if (code === '42501' || code === 'PGRST301' || /jwt|session/i.test(message)) {
    return 'Sua sessão expirou. Entre novamente.'
  }
  // Chrome: "Failed to fetch"; Safari: "Load failed"; Firefox: "NetworkError…"
  if (/failed to fetch|load failed|networkerror/i.test(message)) {
    return 'Sem conexão. Tente novamente.'
  }
  return 'Algo deu errado. Tente novamente.'
}
