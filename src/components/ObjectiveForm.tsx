import { useState, type FormEvent } from 'react'
import { useTracker } from '../data/TrackerProvider'
import { userMessage } from '../lib/api/errors'
import { changesHistory, type ObjectiveEdit } from '../lib/api/objectives'
import { relativeDayLabel } from '../lib/dates'
import { formatPoints } from '../lib/format'
import { MISSED_PENALTY_RATIO } from '../lib/scoring'
import type { Objective, Polarity, Weight } from '../lib/types'
import { ConfirmBlock } from './ConfirmBlock'
import { Segmented } from './Segmented'
import { useToast } from './Toast'
import { WeekdayPicker } from './WeekdayPicker'

interface ObjectiveFormProps {
  mode: 'create-recurring' | 'create-once' | 'edit'
  /** Obrigatório no modo 'edit'. */
  objective?: Objective
  /** Obrigatório no modo 'create-once'. */
  onceDate?: string
  onDone: () => void
}

type Frequency = 'daily' | 'weekdays'

const POLARITY_OPTIONS: { value: Polarity; label: string }[] = [
  { value: 'positive', label: 'Fazer' },
  { value: 'negative', label: 'Evitar' },
]

const WEIGHT_OPTIONS: { value: Weight; label: string; hint: string }[] = [
  { value: 10, label: 'Baixo', hint: '10 pts' },
  { value: 20, label: 'Médio', hint: '20 pts' },
  { value: 30, label: 'Alto', hint: '30 pts' },
]

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Todos os dias' },
  { value: 'weekdays', label: 'Dias específicos' },
]

/** Conteúdo do Sheet para criar ou editar um objetivo (recorrente ou avulso). */
export function ObjectiveForm({ mode, objective, onceDate, onDone }: ObjectiveFormProps) {
  const tracker = useTracker()
  const toast = useToast()
  const isOnce = mode === 'create-once' || objective?.schedule === 'once'
  const day = objective?.once_date ?? onceDate ?? null

  const [title, setTitle] = useState(objective?.title ?? '')
  const [polarity, setPolarity] = useState<Polarity>(objective?.polarity ?? 'positive')
  const [weight, setWeight] = useState<Weight>(objective?.weight ?? 20)
  const [frequency, setFrequency] = useState<Frequency>(
    objective?.schedule === 'weekdays' ? 'weekdays' : 'daily',
  )
  const [days, setDays] = useState<number[]>(objective?.weekdays ?? [])
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const edit: ObjectiveEdit = {
    title,
    weight,
    schedule: isOnce ? 'once' : frequency,
    weekdays: !isOnce && frequency === 'weekdays' ? days : null,
    once_date: isOnce ? day : null,
  }

  const titleError = title.trim() === '' ? 'Dê um nome ao objetivo.' : null
  const daysError = edit.schedule === 'weekdays' && days.length === 0 ? 'Escolha ao menos um dia.' : null
  const startsNewVersion = !!objective && !isOnce && !daysError && changesHistory(objective, edit)

  const weightHint =
    polarity === 'positive'
      ? `Vale ${formatPoints(weight)} quando feito; ${formatPoints(-weight * MISSED_PENALTY_RATIO)} se ficar pendente ao fim do dia.`
      : `Desconta ${formatPoints(-weight)} se ocorrer.`

  // Erros aparecem dentro do formulário: um toast ficaria atrás do Sheet.
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
    if (titleError || daysError) return
    run(() =>
      objective
        ? tracker.saveObjectiveEdit(objective, edit)
        : tracker.createObjective({ ...edit, polarity }),
    )
  }

  return (
    <form className="sheet-form" onSubmit={handleSubmit} noValidate>
      <div className="sheet-body">
        <div className="field">
          <label htmlFor="objective-title">Título</label>
          <input
            id="objective-title"
            data-autofocus
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              polarity === 'positive' ? 'Ex.: Ler 20 minutos' : 'Ex.: Celular depois das 23h'
            }
            aria-invalid={submitted && !!titleError}
            aria-describedby={submitted && titleError ? 'objective-title-error' : undefined}
          />
          {submitted && titleError && (
            <p id="objective-title-error" className="field-error">
              {titleError}
            </p>
          )}
        </div>

        <div>
          <Segmented
            name="polarity"
            legend="Tipo"
            options={POLARITY_OPTIONS}
            value={polarity}
            onChange={setPolarity}
            disabled={!!objective}
          />
          {objective && (
            <p className="field-hint">O tipo não pode ser alterado depois de criado.</p>
          )}
        </div>

        <div>
          <Segmented
            name="weight"
            legend="Peso"
            options={WEIGHT_OPTIONS}
            value={weight}
            onChange={setWeight}
          />
          <p className="field-hint">{weightHint}</p>
        </div>

        {isOnce ? (
          day && (
            <p className="field-hint">
              Vale só para {relativeDayLabel(day, tracker.today).toLowerCase()}.
            </p>
          )
        ) : (
          <div>
            <Segmented
              name="frequency"
              legend="Frequência"
              options={FREQUENCY_OPTIONS}
              value={frequency}
              onChange={setFrequency}
            />
            {frequency === 'weekdays' && <WeekdayPicker value={days} onChange={setDays} />}
            {submitted && daysError && <p className="field-error">{daysError}</p>}
          </div>
        )}

        {confirmingDelete && objective && (
          <ConfirmBlock
            message={
              isOnce
                ? 'Excluir este objetivo do dia?'
                : 'Excluir apaga todo o histórico deste objetivo e altera as pontuações dos dias passados. Para só parar de acompanhar, use Arquivar.'
            }
            confirmLabel={isOnce ? 'Excluir' : 'Excluir definitivamente'}
            busy={busy}
            onCancel={() => setConfirmingDelete(false)}
            onConfirm={() => run(() => tracker.remove(objective), 'Objetivo excluído.')}
          />
        )}

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
      </div>

      <div className="sheet-footer">
        {startsNewVersion && (
          <p className="sheet-notice">
            A mudança vale a partir de hoje. Seu histórico e sua sequência são mantidos.
          </p>
        )}
        <div className="sheet-actions">
          {objective ? (
            <div className="sheet-footer-secondary">
              {!isOnce && (
                <button
                  type="button"
                  className="btn btn-text"
                  disabled={busy}
                  onClick={() => run(() => tracker.archive(objective), 'Objetivo arquivado.')}
                >
                  Arquivar
                </button>
              )}
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
            {busy ? 'Salvando…' : objective ? 'Salvar' : 'Criar objetivo'}
          </button>
        </div>
      </div>
    </form>
  )
}
