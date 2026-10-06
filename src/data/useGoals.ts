import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '../components/Toast'
import { userMessage } from '../lib/api/errors'
import * as api from '../lib/api/goals'
import type { GoalInput } from '../lib/api/goals'
import type { Goal, GoalStatus } from '../lib/types'

/** Metas da tela Metas: estado local à página, carregado ao abrir. */
export function useGoals() {
  const toast = useToast()
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  // Fila única de gravações de progresso: toques rápidos chegam ao banco na ordem.
  const progressQueue = useRef<Promise<unknown>>(Promise.resolve())

  const load = useCallback(
    () =>
      api.listGoals().then(
        (rows) => {
          setGoals(rows)
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

  const replaceLocal = (updated: Goal) =>
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))

  async function reload() {
    setStatus((s) => (s === 'error' ? 'loading' : s))
    await load()
  }

  async function create(input: GoalInput) {
    const created = await api.createGoal(input)
    setGoals((prev) => [...prev, created])
  }

  async function update(id: string, input: GoalInput) {
    replaceLocal(await api.updateGoal(id, input))
  }

  // Otimista: a barra anda na hora; se o banco recusar, volta ao que está salvo.
  function setProgress(goal: Goal, value: number) {
    replaceLocal({ ...goal, current_value: value })
    progressQueue.current = progressQueue.current
      .then(() => api.setGoalProgress(goal.id, value))
      .catch((e: unknown) => {
        toast.show(userMessage(e), 'error')
        return load()
      })
  }

  async function changeStatus(goal: Goal, next: GoalStatus) {
    replaceLocal(await api.setGoalStatus(goal.id, next))
  }

  async function remove(goal: Goal) {
    await api.deleteGoal(goal.id)
    setGoals((prev) => prev.filter((g) => g.id !== goal.id))
  }

  return { status, error, goals, reload, create, update, setProgress, changeStatus, remove }
}

export type GoalsState = ReturnType<typeof useGoals>
