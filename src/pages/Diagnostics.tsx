// Página temporária (removida na sexta): prova que o banco e o RLS
// funcionam do jeito que o app vai usar.
import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
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

      await check(
        'timezone',
        async () => `${today} · ${formatLong(today)} · dia ${dayOfYear(today)} do ano`,
      )
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
