import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useToast } from '../components/Toast'
import { userMessage } from '../lib/api/errors'
import { addLog, listAllLogs, removeLog } from '../lib/api/logs'
import * as api from '../lib/api/objectives'
import type { ObjectiveEdit, ObjectiveInput } from '../lib/api/objectives'
import { todayISO } from '../lib/dates'
import { LogIndex, type LogRow } from '../lib/logIndex'
import { latestVersion } from '../lib/schedule'
import { allStreaks, type StreakInfo } from '../lib/streaks'
import type { Objective } from '../lib/types'

interface TrackerValue {
  status: 'loading' | 'ready' | 'error'
  error: string | null
  objectives: Objective[]
  logs: LogIndex
  today: string
  /** Por lineage_id. */
  streaks: Map<string, StreakInfo>
  reload: () => Promise<void>
  toggleLog: (objectiveId: string, date: string) => Promise<void>
  createObjective: (input: ObjectiveInput, lineageId?: string) => Promise<void>
  saveObjectiveEdit: (o: Objective, input: ObjectiveEdit) => Promise<void>
  archive: (o: Objective) => Promise<void>
  restore: (lineageVersions: Objective[]) => Promise<void>
  remove: (o: Objective) => Promise<void>
}

const TrackerContext = createContext<TrackerValue | null>(null)

/** Data de hoje em São Paulo; reavaliada a cada minuto e quando a aba volta a ficar visível. */
function useToday(): string {
  const [today, setToday] = useState(() => todayISO())

  useEffect(() => {
    const refresh = () => setToday(todayISO())
    const timer = setInterval(refresh, 60_000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  return today
}

/**
 * Objetivos e registros carregados uma vez após o login e compartilhados
 * por Hoje e Objetivos, para as duas telas ficarem sempre em sincronia.
 */
export function TrackerProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const today = useToday()
  const [status, setStatus] = useState<TrackerValue['status']>('loading')
  const [error, setError] = useState<string | null>(null)
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [logRows, setLogRows] = useState<LogRow[]>([])
  const pendingToggles = useRef(new Set<string>())

  const load = useCallback(
    () =>
      Promise.all([api.listObjectives(), listAllLogs()]).then(
        ([nextObjectives, nextLogs]) => {
          setObjectives(nextObjectives)
          setLogRows(nextLogs)
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
    // Só volta ao estado de carregamento ao tentar de novo depois de um erro.
    setStatus((s) => (s === 'error' ? 'loading' : s))
    await load()
  }

  const logs = useMemo(() => new LogIndex(logRows), [logRows])
  const streaks = useMemo(() => allStreaks(objectives, logs, today), [objectives, logs, today])

  const replaceLocal = (updated: Objective) =>
    setObjectives((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))

  // Otimista: muda a tela na hora e desfaz se o banco recusar.
  async function toggleLog(objectiveId: string, date: string) {
    const key = LogIndex.key(objectiveId, date)
    if (pendingToggles.current.has(key)) return
    pendingToggles.current.add(key)

    const had = logs.has(objectiveId, date)
    const setPresent = (present: boolean) =>
      setLogRows((rows) => {
        const others = rows.filter((r) => !(r.objective_id === objectiveId && r.log_date === date))
        return present ? [...others, { objective_id: objectiveId, log_date: date }] : others
      })

    setPresent(!had)
    try {
      if (had) await removeLog(objectiveId, date)
      else await addLog(objectiveId, date)
    } catch (e) {
      setPresent(had)
      toast.show(userMessage(e), 'error')
    } finally {
      pendingToggles.current.delete(key)
    }
  }

  async function createObjective(input: ObjectiveInput, lineageId?: string) {
    const created = await api.createObjective(input, lineageId)
    setObjectives((prev) => [...prev, created])
  }

  async function saveObjectiveEdit(o: Objective, input: ObjectiveEdit) {
    if (o.schedule === 'once') {
      replaceLocal(await api.updateOnceObjective(o.id, input.title, input.weight))
    } else if (api.changesHistory(o, input)) {
      await api.replaceObjective(o.id, input)
      // Traz a versão nova e o registro de hoje, que mudou de versão.
      await reload()
    } else if (input.title.trim() !== o.title) {
      replaceLocal(await api.renameObjective(o.id, input.title))
    }
  }

  async function archive(o: Objective) {
    replaceLocal(await api.archiveObjective(o.id))
  }

  // Nova versão na mesma linhagem, começando hoje.
  async function restore(lineageVersions: Objective[]) {
    const last = latestVersion(lineageVersions)
    await createObjective(
      {
        title: last.title,
        polarity: last.polarity,
        weight: last.weight,
        schedule: last.schedule,
        weekdays: last.weekdays,
        once_date: last.once_date,
      },
      last.lineage_id,
    )
  }

  async function remove(o: Objective) {
    const isGone =
      o.schedule === 'once'
        ? (x: Objective) => x.id === o.id
        : (x: Objective) => x.lineage_id === o.lineage_id

    if (o.schedule === 'once') await api.deleteObjective(o.id)
    else await api.deleteLineage(o.lineage_id)

    const goneIds = new Set(objectives.filter(isGone).map((x) => x.id))
    setObjectives((prev) => prev.filter((x) => !goneIds.has(x.id)))
    setLogRows((prev) => prev.filter((r) => !goneIds.has(r.objective_id)))
  }

  const value: TrackerValue = {
    status,
    error,
    objectives,
    logs,
    today,
    streaks,
    reload,
    toggleLog,
    createObjective,
    saveObjectiveEdit,
    archive,
    restore,
    remove,
  }

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useTracker() {
  const value = useContext(TrackerContext)
  if (!value) throw new Error('useTracker precisa ser usado dentro de <TrackerProvider>')
  return value
}
