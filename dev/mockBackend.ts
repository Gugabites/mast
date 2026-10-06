// Banco falso em memória para a prévia local (ver preview.ts).
// Imita só o que o app usa da API do Supabase: sessão salva, tabelas com
// filtros `eq`, e a função replace_objective. Nada sai para a internet.
import { addDays, todayISO, weekday } from '../src/lib/dates'

type Row = Record<string, unknown>

const USER_ID = 'preview-user'
const today = todayISO()
const day = (offset: number) => addDays(today, offset)
const noon = (date: string) => `${date}T12:00:00Z`

let lastId = 0
const newId = () => `preview-${++lastId}`

const db: Record<string, Row[]> = {
  objectives: [],
  objective_logs: [],
  goals: [],
  journal_entries: [],
  verses: [],
}

function insertObjective(row: Row): Row {
  const id = newId()
  const created: Row = {
    id,
    user_id: USER_ID,
    weekdays: null,
    once_date: null,
    starts_on: today,
    archived_at: null,
    sort_order: 0,
    created_at: new Date().toISOString(),
    lineage_id: id,
    ...row,
  }
  db.objectives.push(created)
  return created
}

function insertLog(objectiveId: unknown, date: unknown): Row {
  const log = { id: newId(), user_id: USER_ID, objective_id: objectiveId, log_date: date }
  db.objective_logs.push(log)
  return log
}

function seed() {
  const start = day(-9)
  const base = { starts_on: start, created_at: noon(start) }

  const read = insertObjective({ ...base, title: 'Ler 20 minutos', polarity: 'positive', weight: 20, schedule: 'daily' })
  for (const offset of [-9, -8, -7, -6, -4, -3, -2, -1]) insertLog(read.id, day(offset))

  const train = insertObjective({
    ...base,
    title: 'Treinar',
    polarity: 'positive',
    weight: 30,
    schedule: 'weekdays',
    weekdays: [1, 3, 5],
  })
  for (let offset = -9; offset < 0; offset++) {
    if ([1, 3, 5].includes(weekday(day(offset)))) insertLog(train.id, day(offset))
  }

  const phone = insertObjective({
    ...base,
    title: 'Celular depois das 23h',
    polarity: 'negative',
    weight: 20,
    schedule: 'daily',
  })
  insertLog(phone.id, day(-3))

  insertObjective({
    ...base,
    title: 'Meditar 10 minutos',
    polarity: 'positive',
    weight: 10,
    schedule: 'daily',
    archived_at: noon(day(-2)),
  })

  insertObjective({
    title: 'Ligar para o contador',
    polarity: 'positive',
    weight: 10,
    schedule: 'once',
    once_date: today,
  })

  const goal = { user_id: USER_ID, why: null, due_date: null, unit: null, target_value: null, status: 'active' }
  db.goals.push(
    {
      ...goal,
      id: newId(),
      title: 'Ler 24 livros em 2026',
      why: 'Quero ter repertório para decidir melhor.',
      due_date: `${today.slice(0, 4)}-12-31`,
      progress_type: 'numeric',
      current_value: 17,
      target_value: 24,
      unit: 'livros',
      created_at: noon(day(-9)),
    },
    {
      ...goal,
      id: newId(),
      title: 'Curso de finanças',
      progress_type: 'percent',
      current_value: 40,
      created_at: noon(day(-8)),
    },
    {
      ...goal,
      id: newId(),
      title: 'Correr 5 km sem parar',
      progress_type: 'numeric',
      current_value: 5,
      target_value: 5,
      unit: 'km',
      status: 'done',
      created_at: noon(day(-7)),
    },
  )
}

const json = (body: unknown, status = 200) =>
  new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

function replaceObjective(args: Row): Response {
  const old = db.objectives.find((o) => o.id === args.p_old_id && !o.archived_at)
  if (!old) return json({ code: 'P0001', message: 'objective not found or already archived' }, 400)

  old.archived_at = new Date().toISOString()
  const next = insertObjective({
    title: args.p_title,
    polarity: old.polarity,
    weight: args.p_weight,
    schedule: args.p_schedule,
    weekdays: args.p_weekdays,
    once_date: args.p_once_date,
    lineage_id: old.lineage_id,
  })
  for (const log of db.objective_logs) {
    if (log.objective_id === old.id && log.log_date === today) log.objective_id = next.id
  }
  return json(next)
}

function handle(url: URL, init: RequestInit): Response {
  const resource = url.pathname.split('/rest/v1/')[1] ?? ''
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  const single = (headers.get('Accept') ?? '').includes('vnd.pgrst.object')
  const body: Row | null = init.body ? JSON.parse(String(init.body)) : null

  if (resource === 'rpc/replace_objective' && body) return replaceObjective(body)

  const table = db[resource]
  if (!table) return json({ code: 'PGRST205', message: `unknown table ${resource}` }, 404)

  // Filtros `eq.valor` e `in.(a,b)`; o resto dos parâmetros (select, order…) é ignorado.
  const filters = [...url.searchParams].flatMap(([key, value]) => {
    if (value.startsWith('eq.')) return [(row: Row) => String(row[key]) === value.slice(3)]
    if (value.startsWith('in.(')) {
      const allowed = value.slice(4, -1).split(',').map((v) => v.replace(/^"|"$/g, ''))
      return [(row: Row) => allowed.includes(String(row[key]))]
    }
    return []
  })
  const matches = (row: Row) => filters.every((test) => test(row))
  const reply = (rows: Row[], status = 200) => json(single ? (rows[0] ?? null) : rows, status)

  if (method === 'GET') {
    const offset = Number(url.searchParams.get('offset') ?? 0)
    const limit = Number(url.searchParams.get('limit') ?? 1000)
    return reply(table.filter(matches).slice(offset, offset + limit))
  }

  if (method === 'POST' && body) {
    if (resource === 'objectives') {
      if (![10, 20, 30].includes(Number(body.weight))) {
        return json({ code: '23514', message: 'violates check constraint' }, 400)
      }
      return reply([insertObjective(body)], 201)
    }
    if (resource === 'objective_logs') {
      const duplicate = table.some(
        (l) => l.objective_id === body.objective_id && l.log_date === body.log_date,
      )
      if (duplicate) return json({ code: '23505', message: 'duplicate key' }, 409)
      return reply([insertLog(body.objective_id, body.log_date)], 201)
    }
    const created = { id: newId(), user_id: USER_ID, created_at: new Date().toISOString(), status: 'active', ...body }
    table.push(created)
    return reply([created], 201)
  }

  if (method === 'PATCH' && body) {
    const rows = table.filter(matches)
    for (const row of rows) Object.assign(row, body)
    return reply(rows)
  }

  if (method === 'DELETE') {
    const gone = table.filter(matches)
    db[resource] = table.filter((row) => !gone.includes(row))
    if (resource === 'objectives') {
      const ids = new Set(gone.map((o) => o.id))
      db.objective_logs = db.objective_logs.filter((l) => !ids.has(l.objective_id))
    }
    return reply(gone)
  }

  return json({ code: 'PGRST000', message: 'not mocked' }, 400)
}

export function installMockBackend() {
  const supabaseUrl = new URL(import.meta.env.VITE_SUPABASE_URL)
  seed()

  // Sessão falsa no formato que o supabase-js lê do localStorage.
  const storageKey = `sb-${supabaseUrl.hostname.split('.')[0]}-auth-token`
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      access_token: 'preview',
      refresh_token: 'preview',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: USER_ID, email: 'previa@mast.local', aud: 'authenticated', role: 'authenticated' },
    }),
  )

  const realFetch = window.fetch.bind(window)
  window.fetch = async (input, init = {}) => {
    const url = new URL(input instanceof Request ? input.url : String(input))
    if (url.origin !== supabaseUrl.origin) return realFetch(input, init)
    if (url.pathname.startsWith('/rest/v1/')) return handle(url, init)
    // Sair, renovar token etc.: responde vazio, sem tocar no projeto real.
    return json({})
  }
}
