// Página temporária (removida na sexta): prova que o banco e o RLS
// funcionam do jeito que o app vai usar.
import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { addLog } from '../lib/api/logs'
import { createObjective, deleteLineage, replaceObjective } from '../lib/api/objectives'
import { dayOfYear, formatLong, todayISO } from '../lib/dates'
import { supabase } from '../lib/supabase'
import type { Objective } from '../lib/types'

type Status = 'pending' | 'ok' | 'error'

interface Check {
  id: string
  label: string
  status: Status
  detail?: string
}

const CHECKS: Check[] = [
  { id: 'session', label: 'Sessão', status: 'pending' },
  { id: 'read', label: 'Leitura das tabelas', status: 'pending' },
  { id: 'insert', label: 'Inserção com user_id automático', status: 'pending' },
  { id: 'log', label: 'Registro do dia sem duplicar', status: 'pending' },
  { id: 'constraint', label: 'Restrição de peso', status: 'pending' },
  { id: 'cleanup', label: 'Limpeza e exclusão em cascata', status: 'pending' },
  { id: 'timezone', label: 'Fuso de São Paulo', status: 'pending' },
  { id: 'lineage', label: 'Linhagem automática', status: 'pending' },
  { id: 'replace', label: 'Substituição de versão', status: 'pending' },
  { id: 'lineage-cleanup', label: 'Limpeza da linhagem', status: 'pending' },
]

const STATUS_LABEL: Record<Status, string> = {
  pending: 'aguardando',
  ok: 'ok',
  error: 'erro',
}

const TEST_OBJECTIVE = {
  title: '[teste] diagnóstico',
  polarity: 'positive',
  schedule: 'once',
}

const LINEAGE_TEST = {
  title: '[teste] linhagem',
  schedule: 'daily',
  weekdays: null,
  once_date: null,
} as const

export function Diagnostics() {
  const { user } = useAuth()
  const [checks, setChecks] = useState(CHECKS)
  const [running, setRunning] = useState(false)

  function report(id: string, status: Status, detail?: string) {
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, status, detail } : c)))
  }

  // Roda uma verificação: ok com o detalhe retornado, ou erro com a mensagem lançada.
  async function check(id: string, fn: () => Promise<string>) {
    try {
      report(id, 'ok', await fn())
    } catch (e) {
      report(id, 'error', e instanceof Error ? e.message : String(e))
    }
  }

  async function runAll() {
    setRunning(true)
    setChecks(CHECKS)
    const today = todayISO()
    let objectiveId: string | null = null
    let lineage: Objective | null = null
    let replacement: Objective | null = null

    try {
      await check('session', async () => {
        if (!user) throw new Error('Nenhuma sessão ativa.')
        return user.id
      })

      await check('read', async () => {
        const tables = ['objectives', 'goals', 'journal_entries', 'verses']
        for (const table of tables) {
          const { error } = await supabase.from(table).select('id').limit(1)
          if (error) throw new Error(`${table}: ${error.message}`)
        }
        return tables.join(', ')
      })

      await check('insert', async () => {
        const { data, error } = await supabase
          .from('objectives')
          .insert({ ...TEST_OBJECTIVE, weight: 10, once_date: today })
          .select()
          .single()
        if (error) throw new Error(error.message)
        const created = data as Objective
        objectiveId = created.id
        if (created.user_id !== user?.id) {
          throw new Error('O user_id gravado é diferente do usuário logado.')
        }
        return 'user_id preenchido pelo banco'
      })

      await check('log', async () => {
        if (!objectiveId) throw new Error('Depende da inserção.')
        const row = { objective_id: objectiveId, log_date: today }
        const first = await supabase.from('objective_logs').insert(row)
        if (first.error) throw new Error(first.error.message)
        const second = await supabase.from('objective_logs').insert(row)
        if (!second.error) throw new Error('O registro duplicado foi aceito.')
        if (second.error.code !== '23505') throw new Error(second.error.message)
        return 'registro criado; duplicado recusado'
      })

      await check('constraint', async () => {
        const { data, error } = await supabase
          .from('objectives')
          .insert({ ...TEST_OBJECTIVE, weight: 15, once_date: today })
          .select('id')
        if (!error) {
          const ids = (data ?? []).map((row) => row.id)
          await supabase.from('objectives').delete().in('id', ids)
          throw new Error('O peso 15 foi aceito.')
        }
        if (error.code !== '23514') throw new Error(error.message)
        return 'peso 15 recusado'
      })
    } finally {
      await check('cleanup', async () => {
        if (!objectiveId) throw new Error('Nada para limpar: a inserção não aconteceu.')
        const removed = await supabase
          .from('objectives')
          .delete()
          .eq('id', objectiveId)
          .select('id')
        if (removed.error) throw new Error(removed.error.message)
        if (removed.data.length !== 1) throw new Error('O objetivo de teste não foi apagado.')
        const logs = await supabase
          .from('objective_logs')
          .select('id')
          .eq('objective_id', objectiveId)
        if (logs.error) throw new Error(logs.error.message)
        if (logs.data.length > 0) throw new Error('O registro não foi apagado junto.')
        return 'objetivo e registro apagados'
      })
    }

    await check(
      'timezone',
      async () => `${today} · ${formatLong(today)} · dia ${dayOfYear(today)} do ano`,
    )

    // Linhagem e replace_objective, pelas mesmas funções que o app usa.
    try {
      await check('lineage', async () => {
        lineage = await createObjective({ ...LINEAGE_TEST, polarity: 'positive', weight: 10 })
        if (!lineage.lineage_id) throw new Error('O objetivo veio sem lineage_id.')
        return 'lineage_id preenchido pelo banco'
      })

      await check('replace', async () => {
        if (!lineage) throw new Error('Depende da linhagem.')
        await addLog(lineage.id, today)
        replacement = await replaceObjective(lineage.id, { ...LINEAGE_TEST, weight: 30 })

        const old = await supabase
          .from('objectives')
          .select('archived_at')
          .eq('id', lineage.id)
          .single()
        if (old.error) throw new Error(old.error.message)
        if (!old.data.archived_at) throw new Error('A versão antiga não foi arquivada.')
        if (replacement.lineage_id !== lineage.lineage_id) {
          throw new Error('A nova versão está em outra linhagem.')
        }
        if (replacement.weight !== 30) throw new Error('O peso novo não foi gravado.')
        if (replacement.starts_on !== today) {
          throw new Error(`A nova versão começa em ${replacement.starts_on}, não hoje.`)
        }

        const logs = await supabase
          .from('objective_logs')
          .select('objective_id')
          .in('objective_id', [lineage.id, replacement.id])
          .eq('log_date', today)
        if (logs.error) throw new Error(logs.error.message)
        const owners = logs.data.map((l) => l.objective_id)
        if (owners.length !== 1 || owners[0] !== replacement.id) {
          throw new Error('O registro de hoje não passou para a nova versão.')
        }
        return 'antiga arquivada; nova com peso 30; registro de hoje movido'
      })
    } finally {
      await check('lineage-cleanup', async () => {
        if (!lineage) throw new Error('Nada para limpar: a linhagem não foi criada.')
        await deleteLineage(lineage.lineage_id)

        const versions = await supabase
          .from('objectives')
          .select('id')
          .eq('lineage_id', lineage.lineage_id)
        if (versions.error) throw new Error(versions.error.message)
        if (versions.data.length > 0) throw new Error('Sobrou versão da linhagem de teste.')

        const logs = await supabase
          .from('objective_logs')
          .select('id')
          .in('objective_id', replacement ? [lineage.id, replacement.id] : [lineage.id])
        if (logs.error) throw new Error(logs.error.message)
        if (logs.data.length > 0) throw new Error('Sobrou registro da linhagem de teste.')
        return 'versões e registros apagados'
      })
      setRunning(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Temporário"
        title="Diagnóstico"
        subtitle="Confere se o banco e a segurança por usuário estão funcionando."
      />
      <section className="card">
        <button type="button" className="btn btn-primary" onClick={runAll} disabled={running}>
          {running ? 'Rodando…' : 'Rodar testes'}
        </button>
        <ul className="check-list">
          {checks.map((c) => (
            <li key={c.id} className="check">
              <div>
                <p>{c.label}</p>
                {c.detail && <p className="check-detail">{c.detail}</p>}
              </div>
              <span className={`mono status status-${c.status}`}>{STATUS_LABEL[c.status]}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
