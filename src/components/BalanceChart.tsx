// Gráfico do saldo diário. Só a tela Progresso importa este arquivo,
// então o Recharts fica fora do carregamento inicial do app.
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { capitalize, formatLong, formatShort } from '../lib/dates'
import { formatPoints } from '../lib/format'
import type { DayScore } from '../lib/scoring'

export interface ChartPoint {
  date: string
  /** null = nada programado no dia (sem barra). */
  balance: number | null
  /** Média móvel de 7 dias; null onde não há dados suficientes. */
  average: number | null
  score: DayScore
  isToday: boolean
}

// O Recharts recebe cores como atributos do SVG; estes valores espelham tokens.css.
const COLOR = {
  positive: '#1E6B47', // --accent
  negative: '#B3261E', // --negative
  zero: '#C9CFC9',
  ink: '#121614',
  muted: '#5A635E',
  line: '#DCE0DB',
  lineSoft: '#EDF0EC',
}

const BAR_RADIUS = 3
const TICK = { fontSize: 11, fill: COLOR.muted }

interface BarShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: ChartPoint
}

/** Barra com a ponta do dado arredondada e a base reta, na linha do zero. */
function BalanceBar({ x = 0, y = 0, width = 0, height = 0, payload }: BarShapeProps) {
  const balance = payload?.balance
  if (balance == null) return <g />

  // Saldo zero: um traço cinza, para o dia não "sumir".
  if (balance === 0) {
    return <rect x={x} y={y - 1} width={width} height={2} fill={COLOR.zero} />
  }

  const top = Math.min(y, y + height)
  const h = Math.abs(height)
  const r = Math.min(BAR_RADIUS, width / 2, h)
  const right = x + width
  const bottom = top + h
  const path =
    balance > 0
      ? `M${x},${bottom} V${top + r} Q${x},${top} ${x + r},${top} H${right - r} Q${right},${top} ${right},${top + r} V${bottom} Z`
      : `M${x},${top} V${bottom - r} Q${x},${bottom} ${x + r},${bottom} H${right - r} Q${right},${bottom} ${right},${bottom - r} V${top} Z`

  return (
    <path
      d={path}
      fill={balance > 0 ? COLOR.positive : COLOR.negative}
      // O dia corrente ainda é parcial.
      fillOpacity={payload?.isToday ? 0.45 : 1}
    />
  )
}

interface TooltipProps {
  active?: boolean
  payload?: readonly { payload?: ChartPoint }[]
}

function ChartTooltip({ active, payload }: TooltipProps) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  const { score } = point

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-date">
        {capitalize(formatLong(point.date))}
        {point.isToday && <span className="chip">parcial</span>}
      </p>
      {point.balance === null ? (
        <p className="muted">Nada programado</p>
      ) : (
        <>
          <p>
            Saldo{' '}
            <strong
              className={
                score.balance > 0 ? 'mono text-accent' : score.balance < 0 ? 'mono text-negative' : 'mono'
              }
            >
              {formatPoints(score.balance)}
            </strong>
          </p>
          <p className="muted">
            Ganhos <span className="mono">{formatPoints(score.earned)}</span> · Perdas{' '}
            <span className="mono">{formatPoints(-score.lost)}</span>
          </p>
          <p className="muted">
            Aproveitamento{' '}
            <span className="mono">{score.pct === null ? '—' : `${score.pct}%`}</span>
          </p>
        </>
      )}
    </div>
  )
}

interface BalanceChartProps {
  points: ChartPoint[]
  showAverage: boolean
  /** Resumo em texto para leitores de tela. */
  label: string
}

export function BalanceChart({ points, showAverage, label }: BalanceChartProps) {
  const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // No máximo 6 ou 7 rótulos de data, qualquer que seja o período.
  const tickInterval = Math.max(0, Math.ceil(points.length / 6) - 1)

  return (
    <div className="chart" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={points}
          margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
          barCategoryGap={points.length > 45 ? 1 : '18%'}
        >
          <CartesianGrid vertical={false} stroke={COLOR.lineSoft} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatShort}
            interval={tickInterval}
            tick={TICK}
            axisLine={false}
            tickLine={false}
            tickMargin={6}
          />
          <YAxis
            width={40}
            tickCount={4}
            tickFormatter={formatPoints}
            tick={TICK}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine y={0} stroke={COLOR.line} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(18, 22, 20, 0.05)' }} />
          <Bar
            dataKey="balance"
            maxBarSize={18}
            shape={(props: unknown) => <BalanceBar {...(props as BarShapeProps)} />}
            isAnimationActive={animate}
            animationDuration={300}
          />
          {/* Contorno na cor do fundo, para a média não se confundir com as barras. */}
          {showAverage && (
            <Line
              dataKey="average"
              type="monotone"
              stroke="#FFFFFF"
              strokeWidth={4}
              dot={false}
              activeDot={false}
              connectNulls={false}
              isAnimationActive={false}
              tooltipType="none"
            />
          )}
          {showAverage && (
            <Line
              dataKey="average"
              type="monotone"
              stroke={COLOR.ink}
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
              connectNulls={false}
              isAnimationActive={animate}
              animationDuration={300}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
