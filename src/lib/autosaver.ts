export type AutosaveStatus = 'saving' | 'saved' | 'error'

interface AutosaverOptions<T> {
  /** Grava o rascunho; deve rejeitar se a gravação falhar. */
  save: (draft: T) => Promise<void>
  /** false quando não há o que gravar (igual ao já salvo, ou inválido). */
  shouldSave: (draft: T) => boolean
  /** Espera depois da última mudança, em ms. */
  delay?: number
  onStatus?: (status: AutosaveStatus, error?: unknown) => void
}

/**
 * Salvamento automático com espera (debounce) e fila: nunca roda dois
 * salvamentos ao mesmo tempo, e o que chega durante um salvamento é gravado
 * logo depois, sempre com o conteúdo mais recente.
 */
export function createAutosaver<T>({ save, shouldSave, delay = 1500, onStatus }: AutosaverOptions<T>) {
  let pending: { draft: T } | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let inFlight: Promise<void> | null = null

  function clearTimer() {
    if (timer) clearTimeout(timer)
    timer = null
  }

  async function drainLoop() {
    while (pending) {
      const { draft } = pending
      pending = null
      if (!shouldSave(draft)) continue

      onStatus?.('saving')
      try {
        await save(draft)
        onStatus?.('saved')
      } catch (error) {
        // Fica pendente para a próxima tentativa, a menos que já exista um mais novo.
        pending ??= { draft }
        onStatus?.('error', error)
        return
      }
    }
  }

  function drain(): Promise<void> {
    inFlight ??= drainLoop().finally(() => {
      inFlight = null
    })
    return inFlight
  }

  return {
    /** Registra uma mudança e agenda o salvamento. */
    change(draft: T) {
      pending = { draft }
      clearTimer()
      timer = setTimeout(() => {
        timer = null
        void drain()
      }, delay)
    },

    /**
     * Salva agora, sem esperar. Também serve para tentar de novo depois de uma falha.
     * Resolve quando não há mais salvamento em andamento; nunca rejeita.
     */
    flush(): Promise<void> {
      clearTimer()
      return drain()
    },

    /** Descarta o que estiver pendente (ex.: a entrada foi excluída). */
    cancel() {
      clearTimer()
      pending = null
    },
  }
}

export type Autosaver<T> = ReturnType<typeof createAutosaver<T>>
