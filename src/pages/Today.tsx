import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  FlameIcon,
  MoreIcon,
  PlusIcon,
  TickIcon,
} from '../components/icons'
import { ObjectiveForm } from '../components/ObjectiveForm'
import { PageHeader } from '../components/PageHeader'
import { Sheet } from '../components/Sheet'
import { TrackerStatus } from '../components/TrackerStatus'
import { useTracker } from '../data/TrackerProvider'
import {
  addDays,
  capitalize,
  formatLong,
  greeting,
  isValidISODate,
  relativeDayLabel,
} from '../lib/dates'
import { formatPoints, frequencyLabel } from '../lib/format'
import { objectivesForDay } from '../lib/schedule'
import { scoreDay, type DayScore } from '../lib/scoring'
import type { Objective, Polarity } from '../lib/types'

type SheetState = { mode: 'create-once' } | { mode: 'edit'; objective: Objective } | null

export function Today() {
  const { signOut } = useAuth()
  const tracker = useTracker()
  const { today, objectives, logs, streaks } = tracker
  const [params, setParams] = useSearchParams()
  const [sheet, setSheet] = useState<SheetState>(null)

  // O dia exibido vem de ?d=YYYY-MM-DD; sem parâmetro, é hoje.
  const requested = params.get('d')
  if (requested && (!isValidISODate(requested) || requested >= today)) {
    return <Navigate to="/" replace />
  }
  const date = requested ?? today
  const isToday = date === today

  const goTo = (day: string) => setParams(day >= today ? {} : { d: day })
  const addOnceLabel = `Objetivo só para ${isToday ? 'hoje' : 'este dia'}`
  const openAddOnce = () => setSheet({ mode: 'create-once' })

  const items = objectivesForDay(objectives, date)
  // Recorrentes primeiro, avulsos por último.
  const ofKind = (polarity: Polarity) => {
    const list = items.filter((o) => o.polarity === polarity)
    return [
      ...list.filter((o) => o.schedule !== 'once'),
      ...list.filter((o) => o.schedule === 'once'),
    ]
  }
  const positives = ofKind('positive')
  const negatives = ofKind('negative')
  const score = scoreDay(objectives, logs, date, today)

  const renderRow = (o: Objective) => (
    <ItemRow
      key={o.id}
      objective={o}
      logged={logs.has(o.id, date)}
      isToday={isToday}
      // A sequência é a de hoje; ao rever um dia anterior ela confundiria.
      streak={isToday ? (streaks.get(o.lineage_id)?.current ?? 0) : 0}
      onToggle={() => tracker.toggleLog(o.id, date)}
      onEdit={() => setSheet({ mode: 'edit', objective: o })}
    />
  )

  return (
    <>
      <PageHeader
        eyebrow={isToday ? capitalize(formatLong(today)) : 'Revisando um dia anterior'}
        title={isToday ? `${greeting()}, Guga.` : capitalize(formatLong(date))}
        action={
          <button type="button" className="btn btn-text only-mobile" onClick={signOut}>
            Sair
          </button>
        }
      />

      <div className="day-nav">
        <button
          type="button"
          className="icon-btn"
          aria-label="Dia anterior"
          onClick={() => goTo(addDays(date, -1))}
        >
          <ChevronLeftIcon />
        </button>
        <span className="day-nav-label">{relativeDayLabel(date, today)}</span>
        <button
          type="button"
          className="icon-btn"
          aria-label="Próximo dia"
          disabled={isToday}
          onClick={() => goTo(addDays(date, 1))}
        >
          <ChevronRightIcon />
        </button>
        {!isToday && (
          <button type="button" className="btn btn-text day-nav-back" onClick={() => goTo(today)}>
            Voltar para hoje
          </button>
        )}
      </div>

      {tracker.status !== 'ready' ? (
        <TrackerStatus />
      ) : objectives.length === 0 ? (
        <section className="card empty-state">
          <h2>Vamos montar sua rotina</h2>
          <p>Comece pelos hábitos que você quer manter todo dia.</p>
          <div className="empty-actions">
            <Link to="/objetivos" className="btn btn-primary">
              Criar objetivos
            </Link>
            <button type="button" className="btn btn-ghost" onClick={openAddOnce}>
              Só para {isToday ? 'hoje' : 'este dia'}
            </button>
          </div>
        </section>
      ) : items.length === 0 ? (
        <section className="card empty-state">
          <p>Nada programado para este dia.</p>
          <button type="button" className="btn btn-ghost" onClick={openAddOnce}>
            <PlusIcon size={18} />
            {addOnceLabel}
          </button>
        </section>
      ) : (
        <div className="stack">
          <SummaryCard score={score} isToday={isToday} />

          <section className="card">
            <h2 className="section-title">
              Fazer
              <span className="mono">
                {score.positivesDone}/{score.positivesTotal}
              </span>
            </h2>
            <ul className="plain-list">{positives.map(renderRow)}</ul>
            <button type="button" className="btn btn-text add-once" onClick={openAddOnce}>
              <PlusIcon size={18} />
              {addOnceLabel}
            </button>
          </section>

          {negatives.length > 0 && (
            <section className="card">
              <h2 className="section-title">Evitar</h2>
              <ul className="plain-list">{negatives.map(renderRow)}</ul>
            </section>
          )}
        </div>
      )}

      <Sheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet?.mode === 'edit' ? 'Editar objetivo' : addOnceLabel}
      >
        {sheet && (
          <ObjectiveForm
            mode={sheet.mode}
            objective={sheet.mode === 'edit' ? sheet.objective : undefined}
            onceDate={date}
            onDone={() => setSheet(null)}
          />
        )}
      </Sheet>
    </>
  )
}

/* ---------- resumo do dia ---------- */

const RING_RADIUS = 43
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

function SummaryCard({ score, isToday }: { score: DayScore; isToday: boolean }) {
  const tone = score.balance > 0 ? 'up' : score.balance < 0 ? 'down' : 'zero'
  const slips = score.negativesOccurred

  return (
    <section className="card card-ink summary">
      <div>
        <p className="summary-label">Saldo do dia</p>
        <p className={`mono summary-balance summary-balance-${tone}`}>
          {formatPoints(score.balance)}
        </p>
        <p className="summary-status">
          {score.positivesDone} de {score.positivesTotal} feitos
          {slips > 0 && ` · ${slips} ${slips === 1 ? 'deslize' : 'deslizes'}`}
        </p>
        <span
          className="summary-badge"
          title={isToday ? 'Pendências descontam metade do peso ao fim do dia.' : undefined}
        >
          {isToday ? 'Parcial' : 'Dia encerrado'}
        </span>
      </div>

      <svg
        className="ring"
        width="96"
        height="96"
        viewBox="0 0 96 96"
        role="img"
        aria-label={score.pct === null ? 'Sem aproveitamento' : `Aproveitamento de ${score.pct}%`}
      >
        <circle cx="48" cy="48" r={RING_RADIUS} className="ring-track" />
        {/* Com 0% a ponta arredondada desenharia um ponto solto. */}
        {!!score.pct && (
          <circle
            cx="48"
            cy="48"
            r={RING_RADIUS}
            className="ring-progress"
            strokeDasharray={`${(RING_LENGTH * score.pct) / 100} ${RING_LENGTH}`}
            transform="rotate(-90 48 48)"
          />
        )}
        <text x="48" y="48" className="ring-text">
          {score.pct === null ? '—' : `${score.pct}%`}
        </text>
      </svg>
    </section>
  )
}

/* ---------- linha de objetivo ---------- */

interface ItemRowProps {
  objective: Objective
  logged: boolean
  isToday: boolean
  streak: number
  onToggle: () => void
  onEdit: () => void
}

function ItemRow({ objective: o, logged, isToday, streak, onToggle, onEdit }: ItemRowProps) {
  const positive = o.polarity === 'positive'
  const recurring = o.schedule !== 'once'

  const toggleLabel = positive
    ? logged
      ? `Desmarcar ${o.title}`
      : `Marcar ${o.title} como feito`
    : logged
      ? `Desfazer registro de ${o.title}`
      : `Registrar que ${o.title} ocorreu`

  const frequency = recurring
    ? frequencyLabel(o.schedule, o.weekdays)
    : isToday
      ? 'Só hoje'
      : 'Só neste dia'
  const meta = positive
    ? `${formatPoints(o.weight)} · ${frequency}`
    : logged
      ? `Ocorreu · ${formatPoints(-o.weight)}`
      : `${formatPoints(-o.weight)} se ocorrer`

  return (
    <li className="item-row">
      <button
        type="button"
        className="check-btn"
        aria-pressed={logged}
        aria-label={toggleLabel}
        onClick={onToggle}
      >
        <span className={positive ? 'check-box' : 'check-box check-box-round'}>
          {logged && (positive ? <TickIcon size={16} /> : <CloseIcon size={14} />)}
        </span>
      </button>

      <div>
        <p className={positive && logged ? 'item-title item-title-done' : 'item-title'}>
          {o.title}
        </p>
        <p className={!positive && logged ? 'item-meta text-negative' : 'item-meta'}>{meta}</p>
      </div>

      {recurring ? (
        streak > 0 && (
          <span className="streak" title={positive ? 'Sequência atual' : 'Dias sem ocorrência'}>
            {positive && <FlameIcon size={14} />}
            <span className="mono">{streak}</span>
            {!positive && <span className="streak-unit">{streak === 1 ? 'dia' : 'dias'}</span>}
          </span>
        )
      ) : (
        <button
          type="button"
          className="icon-btn icon-btn-plain"
          aria-label={`Opções de ${o.title}`}
          onClick={onEdit}
        >
          <MoreIcon />
        </button>
      )}
    </li>
  )
}
