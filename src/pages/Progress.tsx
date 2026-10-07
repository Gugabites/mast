import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { BalanceChart, type ChartPoint } from '../components/BalanceChart'
import { PageHeader } from '../components/PageHeader'
import { Segmented } from '../components/Segmented'
import { TrackerStatus } from '../components/TrackerStatus'
import { useTracker } from '../data/TrackerProvider'
import { addDays, formatShort, formatTime, localDateOf } from '../lib/dates'
import { formatPoints } from '../lib/format'
import {
  chartRange,
  firstTrackedDay,
  movingAverage,
  summarizeRange,
  type RangeDays,
  type RangeSummary,
} from '../lib/progress'
import { scoreRange } from '../lib/scoring'

const RANGE_KEY = 'mast:progress-range'
const RANGE_OPTIONS: { value: RangeDays; label: string }[] = [
  { value: 7, label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
]

function readRange(): RangeDays {
  try {
    const stored = Number(localStorage.getItem(RANGE_KEY))
    return stored === 7 || stored === 90 ? stored : 30
  } catch {
    return 30
  }
}

export function Progress() {
  const tracker = useTracker()
  const { objectives, logs, today } = tracker
  const [days, setDays] = useState<RangeDays>(readRange)

  function chooseRange(next: RangeDays) {
    setDays(next)
    try {
      localStorage.setItem(RANGE_KEY, String(next))
    } catch {
      // Sem armazenamento local: a escolha vale só para esta visita.
    }
  }

  const header = (
    <PageHeader eyebrow="Evolução" title="Progresso" subtitle="Constância vence intensidade. Um dia de cada vez." />
  )

  if (tracker.status !== 'ready') {
    return (
      <>
        {header}
        <TrackerStatus />
      </>
    )
  }

  const range = chartRange(objectives, today, days)
  const first = firstTrackedDay(objectives)

  if (!range || !first) {
    return (
      <>
        {header}
        <div className="stack">
          <section className="card empty-state">
            <h2>Seu gráfico começa com o primeiro objetivo</h2>
            <p>Cada dia marcado vira uma barra aqui.</p>
            <Link to="/objetivos" className="btn btn-primary">
              Criar objetivos
            </Link>
          </section>
          <AccountCard />
        </div>
      </>
    )
  }

  // A média móvel do primeiro dia do gráfico olha 6 dias para trás.
  const lookback = addDays(range.from, -6)
  const extended = scoreRange(objectives, logs, lookback > first ? lookback : first, range.to, today)
  const averages = movingAverage(extended)
  const hidden = extended.findIndex((s) => s.date === range.from)
  const scores = extended.slice(hidden)
  const showAverage = days !== 7

  const points: ChartPoint[] = scores.map((score, i) => ({
    date: score.date,
    balance: score.positivesTotal + score.negativesTotal > 0 ? score.balance : null,
    average: showAverage ? averages[hidden + i] : null,
    score,
    isToday: score.date === today,
  }))
  const summary = summarizeRange(scores)

  const chartLabel =
    `Saldo diário dos últimos ${days} dias. ` +
    (summary.avgBalance === null
      ? 'Ainda sem dias encerrados.'
      : `Saldo médio ${formatPoints(summary.avgBalance)}, ${summary.positiveDays} de ${summary.closedDays} dias no positivo.`)

  return (
    <>
      {header}
      <div className="stack">
        <Segmented
          name="range"
          legend="Período"
          options={RANGE_OPTIONS}
          value={days}
          onChange={chooseRange}
        />

        {summary.closedDays > 0 ? (
          <Indicators summary={summary} />
        ) : (
          <p className="info-block">Os indicadores aparecem depois do primeiro dia completo.</p>
        )}

        <section className="card">
          <div className="chart-head">
            <h2 className="section-title">Saldo diário</h2>
            <ul className="chart-legend">
              <li>
                <span className="legend-swatch legend-positive" />
                Positivo
              </li>
              <li>
                <span className="legend-swatch legend-negative" />
                Negativo
              </li>
              {showAverage && (
                <li>
                  <span className="legend-line" />
                  Média 7 dias
                </li>
              )}
            </ul>
          </div>

          <BalanceChart points={points} showAverage={showAverage} label={chartLabel} />

          <details className="chart-table">
            <summary>Ver como tabela</summary>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Data</th>
                  <th scope="col">Saldo</th>
                  <th scope="col">Aproveitamento</th>
                </tr>
              </thead>
              <tbody>
                {[...points].reverse().map((point) => (
                  <tr key={point.date}>
                    <th scope="row">
                      {formatShort(point.date)}
                      {point.isToday && ' (parcial)'}
                    </th>
                    <td className="mono">
                      {point.balance === null ? '—' : formatPoints(point.balance)}
                    </td>
                    <td className="mono">
                      {point.balance === null || point.score.pct === null
                        ? '—'
                        : `${point.score.pct}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>

        <AccountCard />
      </div>
    </>
  )
}

function Indicators({ summary }: { summary: RangeSummary }) {
  const { avgBalance, avgPct, positiveDays, closedDays, bestDay } = summary
  const balanceTone =
    avgBalance === null || avgBalance === 0
      ? ''
      : avgBalance > 0
        ? 'text-accent'
        : 'text-negative'

  const stats = [
    {
      label: 'Saldo médio',
      value: avgBalance === null ? '—' : formatPoints(avgBalance),
      note: 'por dia encerrado',
      tone: balanceTone,
    },
    {
      label: 'Aproveitamento',
      value: avgPct === null ? '—' : `${avgPct}%`,
      note: 'média do período',
    },
    {
      label: 'Dias no positivo',
      value: String(positiveDays),
      note: `de ${closedDays} ${closedDays === 1 ? 'dia' : 'dias'}`,
    },
    {
      label: 'Melhor dia',
      value: bestDay ? formatPoints(bestDay.balance) : '—',
      note: bestDay ? formatShort(bestDay.date) : '',
    },
  ]

  return (
    <dl className="stat-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="card stat">
          <dt className="stat-label">{stat.label}</dt>
          <dd className={`mono stat-value ${stat.tone ?? ''}`}>{stat.value}</dd>
          <dd className="stat-note">{stat.note}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Conta: e-mail, versão do app e, no celular, o botão Sair. */
function AccountCard() {
  const { user, signOut } = useAuth()
  const build = new Date(__BUILD_TIME__)

  return (
    <section className="card account">
      <h2 className="section-title">Conta</h2>
      <p className="account-email">{user?.email}</p>
      <p className="account-version">
        Versão {__APP_VERSION__} · {formatShort(localDateOf(__BUILD_TIME__))}, {formatTime(build)}
      </p>
      <button type="button" className="btn btn-ghost only-mobile" onClick={signOut}>
        Sair
      </button>
    </section>
  )
}
