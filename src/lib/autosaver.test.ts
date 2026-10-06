import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAutosaver } from './autosaver'

/** Promessa que o teste resolve ou rejeita quando quiser. */
function deferred() {
  let resolve!: () => void
  let reject!: (error: unknown) => void
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('createAutosaver', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('várias mudanças em menos de 1,5s geram um salvamento, com o último conteúdo', async () => {
    const save = vi.fn(async () => {})
    const saver = createAutosaver<string>({ save, shouldSave: () => true })

    saver.change('a')
    await vi.advanceTimersByTimeAsync(1000)
    saver.change('ab')
    await vi.advanceTimersByTimeAsync(1000)
    saver.change('abc')
    expect(save).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1500)
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith('abc')
  })

  it('não salva quando shouldSave diz que não há o que gravar', async () => {
    const save = vi.fn(async () => {})
    const saver = createAutosaver<string>({ save, shouldSave: (draft) => draft !== 'igual' })

    saver.change('igual')
    await vi.advanceTimersByTimeAsync(1500)
    expect(save).not.toHaveBeenCalled()
  })

  it('o que chega durante um salvamento é gravado depois dele, com o mais recente', async () => {
    const first = deferred()
    const calls: string[] = []
    const save = vi.fn((draft: string) => {
      calls.push(draft)
      return calls.length === 1 ? first.promise : Promise.resolve()
    })
    const saver = createAutosaver<string>({ save, shouldSave: () => true })

    saver.change('um')
    await vi.advanceTimersByTimeAsync(1500)
    expect(calls).toEqual(['um'])

    // Duas mudanças enquanto o primeiro salvamento ainda não terminou.
    saver.change('dois')
    await vi.advanceTimersByTimeAsync(1500)
    saver.change('três')
    await vi.advanceTimersByTimeAsync(1500)
    expect(calls).toEqual(['um']) // nunca dois ao mesmo tempo

    first.resolve()
    await vi.runAllTimersAsync()
    expect(calls).toEqual(['um', 'três'])
  })

  it('flush salva na hora', async () => {
    const save = vi.fn(async () => {})
    const saver = createAutosaver<string>({ save, shouldSave: () => true })

    saver.change('agora')
    await saver.flush()
    expect(save).toHaveBeenCalledWith('agora')

    // O salvamento agendado não roda de novo.
    await vi.advanceTimersByTimeAsync(1500)
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('falha avisa o erro e o flush seguinte tenta de novo', async () => {
    const statuses: string[] = []
    const save = vi
      .fn<(draft: string) => Promise<void>>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue()
    const saver = createAutosaver<string>({
      save,
      shouldSave: () => true,
      onStatus: (status) => statuses.push(status),
    })

    saver.change('texto')
    await vi.advanceTimersByTimeAsync(1500)
    expect(statuses).toEqual(['saving', 'error'])

    await saver.flush()
    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenLastCalledWith('texto')
    expect(statuses).toEqual(['saving', 'error', 'saving', 'saved'])
  })

  it('cancel descarta o que estava pendente', async () => {
    const save = vi.fn(async () => {})
    const saver = createAutosaver<string>({ save, shouldSave: () => true })

    saver.change('descartado')
    saver.cancel()
    await vi.advanceTimersByTimeAsync(1500)
    await saver.flush()
    expect(save).not.toHaveBeenCalled()
  })
})
