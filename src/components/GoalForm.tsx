import { useState, type FormEvent } from 'react'
import type { GoalsState } from '../data/useGoals'
import { userMessage } from '../lib/api/errors'
import type { Goal, GoalStatus, ProgressType } from '../lib/types'
import { ConfirmBlock } from './ConfirmBlock'
import { Segmented } from './Segmented'
import { useToast } from './Toast'

interface GoalFormProps {
  goals: GoalsState
  /** Presente no modo de edição. */
  goal?: Goal
  onDone: () => void
}

const TYPE_OPTIONS: { value: ProgressType; label: string }[] = [
  { value: 'numeric', label: 'Número' },
  { value: 'percent', label: 'Porcentagem' },
]

const WHY_MAX = 500

/** Texto de um campo numérico → número, ou null se vazio ou inválido. */
function parseNumber(text: string): number | null {
  const value = Number(text.replace(',', '.'))
  return text.trim() === '' || Number.isNaN(value) ? null : value
}

/** Conteúdo do Sheet para criar ou editar uma meta. */
export function GoalForm({ goals, goal, onDone }: GoalFormProps) {
  const toast = useToast()
  const [title, setTitle] = useState(goal?.title ?? '')
  const [why, setWhy] = useState(goal?.why ?? '')
  const [dueDate, setDueDate] = useState(goal?.due_date ?? '')
  const [type, setType] = useState<ProgressType>(goal?.progress_type ?? 'numeric')
  const [current, setCurrent] = useState(String(goal?.current_value ?? 0))
  const [target, setTarget] = useState(goal?.target_value != null ? String(goal.target_value) : '')
  const [unit, setUnit] = useState(goal?.unit ?? '')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const currentValue = parseNumber(current) ?? 0
  const targetValue = parseNumber(target)

  const titleError = title.trim() === '' ? 'Dê um nome à meta.' : null
  const currentError =
    currentValue < 0
      ? 'O valor atual não pode ser negativo.'
      : type === 'percent' && currentValue > 100
        ? 'Use um valor entre 0 e 100.'
        : null
  const targetError =
    type === 'numeric' && (targetValue === null || targetValue <= 0)
      ? 'Defina um alvo maior que zero.'
      : null

  async function run(action: () => Promise<void>, doneMessage?: string) {
    setBusy(true)
    setFormError(null)
    try {
      await action()
      if (doneMessage) toast.show(doneMessage)
      onDone()
    } catch (e) {
      setFormError(userMessage(e))
      setBusy(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (titleError || currentError || targetError) return

    const input = {
      title,
      why,
      due_date: dueDate,
      progress_type: type,
      current_value: currentValue,
      target_value: targetValue,
      unit,
    }
    run(() => (goal ? goals.update(goal.id, input) : goals.create(input)))
  }

  const statusAction = (next: GoalStatus, label: string, doneMessage: string) =>
    goal && (
      <button
        type="button"
        className="btn btn-text"
        disabled={busy}
        onClick={() => run(() => goals.changeStatus(goal, next), doneMessage)}
      >
        {label}
      </button>
    )

  return (
    <form className="sheet-form" onSubmit={handleSubmit} noValidate>
      <div className="sheet-body">
        <div className="field">
          <label htmlFor="goal-title">Título</label>
          <input
            id="goal-title"
            data-autofocus
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Ler 24 livros em 2026"
            aria-invalid={submitted && !!titleError}
          />
          {submitted && titleError && <p className="field-error">{titleError}</p>}
        </div>

        <div className="field">
          <label htmlFor="goal-why">Por quê (opcional)</label>
          <textarea
            id="goal-why"
            maxLength={WHY_MAX}
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="O que muda na sua vida quando você chegar lá?"
          />
          <p className="field-hint field-counter">
            {why.length}/{WHY_MAX}
          </p>
        </div>

        <div className="field">
          <label htmlFor="goal-due">Prazo (opcional)</label>
          <input
            id="goal-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          {dueDate && (
            <button type="button" className="btn btn-text field-action" onClick={() => setDueDate('')}>
              Remover prazo
            </button>
          )}
        </div>

        <Segmented
          name="progress-type"
          legend="Como medir"
          options={TYPE_OPTIONS}
          value={type}
          onChange={setType}
        />

        {type === 'numeric' ? (
          <div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="goal-current">Atual</label>
                <input
                  id="goal-current"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="goal-target">Alvo</label>
                <input
                  id="goal-target"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  aria-invalid={submitted && !!targetError}
                />
              </div>
              <div className="field">
                <label htmlFor="goal-unit">Unidade</label>
                <input
                  id="goal-unit"
                  maxLength={30}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="livros, km, R$"
                />
              </div>
            </div>
            {submitted && currentError && <p className="field-error">{currentError}</p>}
            {submitted && targetError && <p className="field-error">{targetError}</p>}
          </div>
        ) : (
          <div className="field">
            <label htmlFor="goal-current">Atual (%)</label>
            <input
              id="goal-current"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="any"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              aria-invalid={submitted && !!currentError}
            />
            {submitted && currentError && <p className="field-error">{currentError}</p>}
          </div>
        )}

        {confirmingDelete && goal && (
          <ConfirmBlock
            message="Excluir esta meta? Isso não pode ser desfeito."
            confirmLabel="Excluir"
            busy={busy}
            onCancel={() => setConfirmingDelete(false)}
            onConfirm={() => run(() => goals.remove(goal), 'Meta excluída.')}
          />
        )}

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
      </div>

      <div className="sheet-footer">
        {goal ? (
          <div className="sheet-footer-secondary">
            {goal.status === 'done'
              ? statusAction('active', 'Reabrir', 'Meta reaberta.')
              : statusAction('done', 'Concluir', 'Meta concluída.')}
            {goal.status === 'archived'
              ? statusAction('active', 'Desarquivar', 'Meta desarquivada.')
              : statusAction('archived', 'Arquivar', 'Meta arquivada.')}
            <button
              type="button"
              className="btn btn-text text-negative"
              disabled={busy || confirmingDelete}
              onClick={() => setConfirmingDelete(true)}
            >
              Excluir
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={onDone}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Salvando…' : goal ? 'Salvar' : 'Criar meta'}
        </button>
      </div>
    </form>
  )
}
