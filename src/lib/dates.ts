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
