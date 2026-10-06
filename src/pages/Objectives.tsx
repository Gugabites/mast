import { useState } from 'react'
import { FlameIcon, PlusIcon, RestoreIcon } from '../components/icons'
import { ObjectiveForm } from '../components/ObjectiveForm'
import { PageHeader } from '../components/PageHeader'
import { Sheet } from '../components/Sheet'
import { useToast } from '../components/Toast'
import { TrackerStatus } from '../components/TrackerStatus'
import { useTracker } from '../data/TrackerProvider'
import { userMessage } from '../lib/api/errors'
import { formatShort } from '../lib/dates'
import { frequencyLabel, WEIGHT_LABEL } from '../lib/format'
import { archivedOn, currentVersion, groupByLineage, latestVersion } from '../lib/schedule'
import type { StreakInfo } from '../lib/streaks'
import type { Objective, Polarity } from '../lib/types'

type SheetState = { mode: 'create-recurring' } | { mode: 'edit'; objective: Objective } | null

const NO_STREAK: StreakInfo = { current: 0, best: 0 }

/** Gerencia só os objetivos recorrentes; os avulsos vivem na tela Hoje. */
export function Objectives() {
  const tracker = useTracker()
  const toast = useToast()
  const [sheet, setSheet] = useState<SheetState>(null)
  const [showArchived, setShowArchived] = useState(false)

  const header = (
    <PageHeader
      eyebrow="Rotina"
      title="Objetivos"
      subtitle="O que você faz e o que você evita."
      action={
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setSheet({ mode: 'create-recurring' })}
        >
          <PlusIcon size={18} />
          Novo
        </button>
      }
    />
  )

  if (tracker.status !== 'ready') {
    return (
      <>
        {header}
        <TrackerStatus />
      </>
    )
  }

  // Uma linha por linhagem, na ordem em que cada uma foi criada.
  const firstCreated = (versions: Objective[]) => versions.map((v) => v.created_at).sort()[0]
  const lineages = [
    ...groupByLineage(tracker.objectives.filter((o) => o.schedule !== 'once')).values(),
  ].sort((a, b) => firstCreated(a).localeCompare(firstCreated(b)))

  const active = lineages.flatMap((versions) => {
    const current = currentVersion(versions)
    return current ? [current] : []
  })
  const archived = lineages.filter((versions) => !currentVersion(versions))
  const byPolarity = (polarity: Polarity) => active.filter((o) => o.polarity === polarity)

  async function restore(versions: Objective[]) {
    try {
      await tracker.restore(versions)
      toast.show('Objetivo restaurado.')
    } catch (e) {
      toast.show(userMessage(e), 'error')
    }
  }

  const renderGroup = (title: string, list: Objective[]) =>
    list.length > 0 && (
      <section className="card">
        <h2 className="section-title">{title}</h2>
        <ul className="plain-list">
          {list.map((o) => (
            <li key={o.lineage_id}>
              <ObjectiveRow
                objective={o}
                streak={tracker.streaks.get(o.lineage_id) ?? NO_STREAK}
                onEdit={() => setSheet({ mode: 'edit', objective: o })}
              />
            </li>
          ))}
        </ul>
      </section>
    )

  return (
    <>
      {header}

      {lineages.length === 0 ? (
        <section className="card empty-state">
          <h2>Sua rotina começa aqui</h2>
          <p>Crie o primeiro hábito que você quer manter, ou algo que quer evitar.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setSheet({ mode: 'create-recurring' })}
          >
            Criar objetivo
          </button>
        </section>
      ) : (
        <div className="stack">
          {renderGroup('Fazer', byPolarity('positive'))}
          {renderGroup('Evitar', byPolarity('negative'))}

          {archived.length > 0 && (
            <div>
              <button
                type="button"
                className="btn btn-text"
                aria-expanded={showArchived}
                onClick={() => setShowArchived((v) => !v)}
              >
                {showArchived ? 'Ocultar' : 'Mostrar'} arquivados ({archived.length})
              </button>
              {showArchived && (
                <section className="card">
                  <ul className="plain-list">
                    {archived.map((versions) => {
                      const last = latestVersion(versions)
                      const date = archivedOn(last)
                      return (
                        <li key={last.lineage_id} className="obj-row obj-row-archived">
                          <div>
                            <p className="item-title muted">{last.title}</p>
                            <p className="item-meta">
                              {date ? `Arquivado em ${formatShort(date)}` : 'Arquivado'}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => restore(versions)}
                          >
                            <RestoreIcon size={16} />
                            Restaurar
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      )}

      <Sheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet?.mode === 'edit' ? 'Editar objetivo' : 'Novo objetivo'}
      >
        {sheet && (
          <ObjectiveForm
            mode={sheet.mode}
            objective={sheet.mode === 'edit' ? sheet.objective : undefined}
            onDone={() => setSheet(null)}
          />
        )}
      </Sheet>
    </>
  )
}

interface ObjectiveRowProps {
  objective: Objective
  streak: StreakInfo
  onEdit: () => void
}

function ObjectiveRow({ objective: o, streak, onEdit }: ObjectiveRowProps) {
  return (
    <button type="button" className="obj-row" aria-label={`Editar ${o.title}`} onClick={onEdit}>
      <span>
        <span className="item-title">{o.title}</span>
        <span className="item-meta">
          {frequencyLabel(o.schedule, o.weekdays)}
          <span className="chip">
            {WEIGHT_LABEL[o.weight]} · {o.weight} pts
          </span>
        </span>
      </span>
      <span className="obj-streak">
        <span className="streak streak-lg">
          {o.polarity === 'positive' && <FlameIcon size={14} />}
          <span className="mono">{streak.current}</span>
          {o.polarity === 'negative' && (
            <span className="streak-unit">{streak.current === 1 ? 'dia limpo' : 'dias limpo'}</span>
          )}
        </span>
        <span className="streak-best">recorde {streak.best}</span>
      </span>
    </button>
  )
}
