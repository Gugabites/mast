import { useState } from 'react'
import { GoalForm } from '../components/GoalForm'
import { EditIcon, MinusIcon, PlusIcon } from '../components/icons'
import { PageHeader } from '../components/PageHeader'
import { ProgressBar } from '../components/ProgressBar'
import { Sheet } from '../components/Sheet'
import { useToast } from '../components/Toast'
import { useTracker } from '../data/TrackerProvider'
import { useGoals } from '../data/useGoals'
import { userMessage } from '../lib/api/errors'
import {
  dueLabel,
  formatGoalValue,
  goalPercent,
  goalReached,
  sortByDueDate,
  steppedValue,
} from '../lib/goals'
import type { Goal, GoalStatus } from '../lib/types'

type SheetState = { goal?: Goal } | null

export function Goals() {
  const { today } = useTracker()
  const goals = useGoals()
  const toast = useToast()
  const [sheet, setSheet] = useState<SheetState>(null)
  const [expanded, setExpanded] = useState<GoalStatus[]>([])

  const withStatus = (status: GoalStatus) =>
    sortByDueDate(goals.goals.filter((g) => g.status === status))
  const active = withStatus('active')

  async function complete(goal: Goal) {
    try {
      await goals.changeStatus(goal, 'done')
      toast.show('Meta concluída.')
    } catch (e) {
      toast.show(userMessage(e), 'error')
    }
  }

  const renderCard = (goal: Goal) => (
    <GoalCard
      key={goal.id}
      goal={goal}
      today={today}
      onEdit={() => setSheet({ goal })}
      onStep={(direction) => goals.setProgress(goal, steppedValue(goal, direction))}
      onComplete={() => complete(goal)}
    />
  )

  const renderCollapsed = (status: GoalStatus, label: string) => {
    const list = withStatus(status)
    const open = expanded.includes(status)
    return (
      list.length > 0 && (
        <div className="stack">
          <button
            type="button"
            className="btn btn-text collapse-toggle"
            aria-expanded={open}
            onClick={() =>
              setExpanded((prev) => (open ? prev.filter((s) => s !== status) : [...prev, status]))
            }
          >
            {open ? 'Ocultar' : 'Mostrar'} {label} ({list.length})
          </button>
          {open && list.map(renderCard)}
        </div>
      )
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Longo prazo"
        title="Metas"
        subtitle="Para onde a disciplina te leva."
        action={
          <button type="button" className="btn btn-primary" onClick={() => setSheet({})}>
            <PlusIcon size={18} />
            Nova
          </button>
        }
      />

      {goals.status === 'loading' ? (
        <div className="stack" role="status" aria-label="Carregando">
          <div className="skeleton skeleton-short" />
          <div className="skeleton skeleton-short" />
        </div>
      ) : goals.status === 'error' ? (
        <section className="card empty-state" role="alert">
          <p>{goals.error}</p>
          <button type="button" className="btn btn-primary" onClick={goals.reload}>
            Tentar novamente
          </button>
        </section>
      ) : goals.goals.length === 0 ? (
        <section className="card empty-state">
          <h2>Qual é o seu próximo grande objetivo?</h2>
          <p>Metas de longo prazo dão sentido aos hábitos do dia a dia.</p>
          <button type="button" className="btn btn-primary" onClick={() => setSheet({})}>
            Criar meta
          </button>
        </section>
      ) : (
        <div className="stack">
          {active.map(renderCard)}
          {active.length === 0 && (
            <section className="card empty-state">
              <p>Nenhuma meta ativa no momento.</p>
              <button type="button" className="btn btn-primary" onClick={() => setSheet({})}>
                Criar meta
              </button>
            </section>
          )}
          {renderCollapsed('done', 'concluídas')}
          {renderCollapsed('archived', 'arquivadas')}
        </div>
      )}

      <Sheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet?.goal ? 'Editar meta' : 'Nova meta'}
      >
        {sheet && <GoalForm goals={goals} goal={sheet.goal} onDone={() => setSheet(null)} />}
      </Sheet>
    </>
  )
}

interface GoalCardProps {
  goal: Goal
  today: string
  onEdit: () => void
  onStep: (direction: 1 | -1) => void
  onComplete: () => void
}

function GoalCard({ goal, today, onEdit, onStep, onComplete }: GoalCardProps) {
  const pct = goalPercent(goal)
  const isActive = goal.status === 'active'
  const due = goal.due_date && isActive ? dueLabel(goal.due_date, today) : null

  return (
    <article className="card">
      <div className="goal-head">
        <h2 className="goal-title">{goal.title}</h2>
        <button
          type="button"
          className="icon-btn icon-btn-plain"
          aria-label={`Editar ${goal.title}`}
          onClick={onEdit}
        >
          <EditIcon />
        </button>
      </div>
      {goal.why && <p className="goal-why">{goal.why}</p>}

      <div className="goal-progress">
        <ProgressBar value={pct} label={`Progresso de ${goal.title}`} />
      </div>

      <div className="goal-row">
        <p>
          <span className="mono goal-value">{formatGoalValue(goal)}</span>
          {goal.progress_type === 'numeric' && <span className="goal-pct">{pct}%</span>}
        </p>
        {isActive && (
          <div className="goal-stepper">
            <button
              type="button"
              className="icon-btn"
              aria-label="Diminuir progresso"
              disabled={goal.current_value <= 0}
              onClick={() => onStep(-1)}
            >
              <MinusIcon />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Aumentar progresso"
              disabled={goalReached(goal)}
              onClick={() => onStep(1)}
            >
              <PlusIcon />
            </button>
          </div>
        )}
      </div>

      {due && <p className={`goal-due text-${due.tone}`}>{due.text}</p>}

      {isActive && goalReached(goal) && (
        <div className="goal-reached">
          <span>Meta atingida.</span>
          <button type="button" className="btn btn-primary" onClick={onComplete}>
            Marcar como concluída
          </button>
        </div>
      )}
    </article>
  )
}
