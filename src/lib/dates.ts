export const TZ = 'America/Sao_Paulo'

const ymdFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const hourFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  hour: 'numeric',
  hourCycle: 'h23',
})

/** Data de hoje em São Paulo, no formato 'YYYY-MM-DD'. */
export function todayISO(now: Date = new Date()): string {
  return ymdFormatter.format(now)
}

/** Hora atual (0–23) em São Paulo. */
export function currentHourSP(now: Date = new Date()): number {
  return Number(hourFormatter.format(now))
}

/**
 * Converte 'YYYY-MM-DD' em Date ao meio-dia UTC.
 * Usar meio-dia evita qualquer erro de fuso ao fazer contas com datas puras.
 */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12))
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function addDays(iso: string, n: number): string {
  const d = parseISODate(iso)
  d.setUTCDate(d.getUTCDate() + n)
  return toISODate(d)
}

/** Dia da semana: 0 = domingo … 6 = sábado (mesma convenção da coluna weekdays). */
export function weekday(iso: string): number {
  return parseISODate(iso).getUTCDay()
}

/** Dia do ano: 1 … 365/366. */
export function dayOfYear(iso: string): number {
  const d = parseISODate(iso)
  const start = Date.UTC(d.getUTCFullYear(), 0, 1, 12)
  return Math.round((d.getTime() - start) / 86_400_000) + 1
}

/** Ex.: "terça-feira, 6 de outubro" */
export function formatLong(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseISODate(iso))
}

/** "Bom dia" (5h–11h), "Boa tarde" (12h–17h), "Boa noite" (18h–4h) */
export function greeting(now: Date = new Date()): string {
  const h = currentHourSP(now)
  if (h >= 5 && h < 12) return 'Bom dia'
  if (h >= 12 && h < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Lista de datas de `from` a `to`, inclusive. Vazia se from > to. */
export function eachDay(from: string, to: string): string[] {
  const days: string[] = []
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d)
  return days
}

/** Data local (São Paulo) de um timestamp do banco. */
export function localDateOf(timestamp: string): string {
  return todayISO(new Date(timestamp))
}

const MONTH_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** Ex.: "6 out" (sem ponto no mês). */
export function formatShort(iso: string): string {
  const [, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTH_SHORT[m - 1]}`
}

/** "Hoje", "Ontem" ou formatShort. */
export function relativeDayLabel(iso: string, today: string): string {
  if (iso === today) return 'Hoje'
  if (iso === addDays(today, -1)) return 'Ontem'
  return formatShort(iso)
}

/** Dias entre duas datas (to − from). */
export function daysBetween(from: string, to: string): number {
  return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / 86_400_000)
}

/** Primeira letra maiúscula: "terça-feira, 6 de outubro" → "Terça-feira, 6 de outubro". */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** true se a string é uma data real no formato 'YYYY-MM-DD'. */
export function isValidISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && toISODate(parseISODate(s)) === s
}
