# Mast — Plano do Dia 2: Núcleo

> **Para o Claude Code:** leia o `CLAUDE.md` e o `docs/resumo-dia-1.md` antes deste plano. Hoje é construído o coração do app: objetivos, registros, pontuação, sequências e metas. Execute as etapas na ordem. Etapas **[GUGA]** são manuais; etapas **[CLAUDE CODE]** são suas.

---

## Regras de interação com o Guga (valem para a sessão inteira)

Aprendidas no Dia 1. Siga à risca:

1. **Um passo manual por vez.** Explique um único passo, espere o Guga responder "feito" e só então passe ao próximo. Nunca envie listas de várias ações manuais de uma vez.
2. **Faça por ele o que puder:** copie SQL para a área de transferência (`pbcopy < arquivo.sql`) e abra as páginas necessárias (`open <url>`). O Guga só cola e clica.
3. **Confira você mesmo** pelo terminal ou pela API pública do GitHub sempre que possível, em vez de pedir que ele confira.
4. **Publicação:** você faz o commit local; o Guga clica em **"Push origin" no GitHub Desktop**. Depois, acompanhe o deploy pela API pública do GitHub e avise quando estiver no ar.
5. **Telas logadas** só o Guga consegue testar. Peça uma **foto da tela** para cada verificação visual importante.
6. Links úteis do projeto:
   - SQL Editor: `https://supabase.com/dashboard/project/gbxbamgyttpidqvdtffo/sql/new`
   - Site: `https://gugabites.github.io/mast/`
   - Local: `http://localhost:5173/mast/`

---

## Objetivo do dia

Ao fim da sessão, o Guga consegue, no celular:

- criar objetivos recorrentes ("Fazer") e hábitos a evitar ("Evitar") com peso e frequência;
- abrir **Hoje**, marcar o que fez e o que ocorreu, e ver o saldo do dia e as sequências se atualizarem na hora;
- adicionar um objetivo só para um dia específico;
- voltar a dias anteriores e corrigir registros;
- editar, arquivar e excluir objetivos sem perder sequência por causa de uma edição;
- criar metas de longo prazo e atualizar o progresso delas.

## Critério de pronto

- [ ] Migração `0002` aplicada e verificada.
- [ ] `npm run lint`, `npm test` e `npm run build` sem erros, com testes de agenda, pontuação, sequências e formatação.
- [ ] Telas **Objetivos**, **Hoje** e **Metas** funcionando no site publicado, confirmadas pelo Guga com fotos do celular.
- [ ] Diagnóstico atualizado e passando em produção.
- [ ] `CLAUDE.md` atualizado (regra de pontuação, linhagem, decisões, status) e resumo entregue.

## Fora do escopo hoje

Journal, versículo do dia, tela Progresso (gráfico), PWA, reordenar objetivos por arrastar, objetivos quantitativos, "X vezes por semana", lembretes. Não antecipe.

---

## Regras de negócio fechadas para hoje

Estas regras substituem qualquer ambiguidade do `CLAUDE.md`. Atualize o `CLAUDE.md` com elas na etapa final.

### Quando um objetivo vale para um dia D
- **Avulso (`once`):** só se `once_date = D`.
- **Diário (`daily`):** se `starts_on ≤ D`.
- **Dias da semana (`weekdays`):** se `starts_on ≤ D` e o dia da semana de D está em `weekdays`.
- **Arquivado:** deixa de valer a partir da data local (São Paulo) de `archived_at`, inclusive. Ou seja, conta até o dia anterior ao arquivamento.

### Pontuação do dia
| Situação | Pontos |
|---|---|
| Positivo feito | **+peso** |
| Positivo não feito, em dia já encerrado | **−peso ÷ 2** (10 → −5, 20 → −10, 30 → −15) |
| Positivo não feito, no dia corrente | 0 (ainda não desconta) |
| Negativo que ocorreu | **−peso** |
| Negativo que não ocorreu | 0 |

- **Saldo** = ganhos − perdas.
- **Máximo possível** = soma dos pesos dos positivos programados.
- **Aproveitamento** = ganhos ÷ máximo possível, arredondado. Se o máximo for 0, exibir "—".
- A razão do desconto fica numa constante, `MISSED_PENALTY_RATIO = 0.5`, para poder ser ajustada depois.

### Linhagem (editar sem perder a sequência)
- Cada objetivo tem `lineage_id`. Todas as versões de um mesmo objetivo compartilham a mesma linhagem.
- **Editar só o título:** `update` direto na versão atual.
- **Editar peso, frequência ou dias:** a versão atual é arquivada agora e uma nova versão é criada com `starts_on = hoje` e a mesma linhagem, numa única operação no banco (função `replace_objective`). Se havia registro de hoje na versão antiga, ele passa para a nova.
- **O tipo (Fazer / Evitar) não pode ser alterado** depois de criado.
- **Sequências e recordes são calculados por linhagem**, não por versão.
- **Excluir** apaga a linhagem inteira, com todos os registros, e muda pontuações passadas. **Arquivar** é a ação padrão e preserva tudo.
- **Restaurar** um arquivado cria uma nova versão na mesma linhagem, começando hoje. Os dias em que ficou arquivado não contam nem quebram a sequência.

### Sequências (por linhagem recorrente; objetivos avulsos não têm sequência)
Percorrer os dias do primeiro `starts_on` da linhagem até hoje. Em cada dia, procurar a versão programada para aquele dia:
- Nenhuma versão programada: ignorar o dia (não soma, não quebra).
- **Positivo:** feito → soma 1. Não feito em dia encerrado → zera. Não feito hoje → neutro.
- **Negativo:** ocorreu → zera (inclusive hoje). Não ocorreu em dia encerrado → soma 1. Hoje sem ocorrência → neutro (o dia ainda não acabou).
- **Sequência atual** = contagem ao final; **recorde** = maior contagem atingida.

### Carregamento
- Ao entrar no app, carregar **todos** os objetivos (inclusive arquivados) e **todos** os registros, paginando de 1.000 em 1.000 (limite de linhas por consulta do Supabase). Sem isso, sequências e recordes ficam errados depois de alguns meses.

---

## Etapa 0 — Pendências do Dia 1 [GUGA, guiado] (~10 min)

### 0.1 Conferência de segurança do banco
Copie para a área de transferência e abra o SQL Editor:
```sql
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, cmd;
```
Esperado: 16 linhas (4 em `goals`, 4 em `journal_entries`, 3 em `objective_logs`, 4 em `objectives`, 1 em `verses`). Peça ao Guga uma foto do resultado.

Depois, abra **Advisors → Security Advisor** (`https://supabase.com/dashboard/project/gbxbamgyttpidqvdtffo/advisors/security`) e peça uma foto. Alertas de "RLS disabled" ou "policy" são bloqueantes; avisos genéricos de configuração de Auth (ex.: proteção contra senhas vazadas) podem ser anotados e seguir.

### 0.2 Testes de login que ficaram sem confirmação
Um por vez, no site publicado:
1. Sair, tentar entrar com senha errada → deve aparecer "E-mail ou senha incorretos."
2. Entrar corretamente e recarregar a página → deve continuar logado.
3. Tocar em "Sair" → deve voltar ao login.

Se algo falhar, corrija antes de continuar.

---

## Etapa 1 — Migração 0002: linhagem [CLAUDE CODE escreve, GUGA executa] (~15 min)

### 1.1 Arquivo
Crie `supabase/migrations/0002_lineage.sql` (conteúdo: ver o próprio arquivo no repositório, que segue o plano à risca — coluna `lineage_id`, índice `objectives_user_lineage_idx` e função `replace_objective` com `security invoker`, revogada de `public`/`anon` e concedida a `authenticated`).

### 1.2 Executar [GUGA]
Copie o arquivo para a área de transferência, abra o SQL Editor e peça ao Guga para colar e clicar em **Run**. Esperado: "Success. No rows returned".

### 1.3 Verificar [GUGA]
Copie e peça para rodar (uma consulta só):
```sql
select
  (select count(*) from information_schema.columns
     where table_schema = 'public' and table_name = 'objectives'
       and column_name = 'lineage_id' and is_nullable = 'NO')           as lineage_ok,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = 'replace_objective')    as function_ok;
```
Esperado: `lineage_ok = 1` e `function_ok = 1`. Peça uma foto.

### 1.4 Tipos
Em `src/lib/types.ts`, adicione `lineage_id: string` à interface `Objective`.

**Commit:** `feat(db): objective lineage and atomic replace_objective`

---

## Etapa 2 — Utilitários de data e formatação [CLAUDE CODE] (~20 min)

### 2.1 Acréscimos em `src/lib/dates.ts`
```ts
/** Lista de datas de `from` a `to`, inclusive. Vazia se from > to. */
export function eachDay(from: string, to: string): string[]

/** Data local (São Paulo) de um timestamp do banco. */
export function localDateOf(timestamp: string): string   // = todayISO(new Date(timestamp))

/** Ex.: "6 out" (sem ponto no mês). */
export function formatShort(iso: string): string

/** "Hoje", "Ontem" ou formatShort. */
export function relativeDayLabel(iso: string, today: string): string

/** Dias entre duas datas (to − from). */
export function daysBetween(from: string, to: string): number

/** Primeira letra maiúscula: "terça-feira, 6 de outubro" → "Terça-feira, 6 de outubro". */
export function capitalize(s: string): string
```
Strings `'YYYY-MM-DD'` podem ser comparadas diretamente com `<`, `<=` e `>`. Use isso em todo o código.

Testes a acrescentar em `dates.test.ts`:
- `eachDay('2026-10-30', '2026-11-02')` → 4 datas, atravessando o mês; `eachDay('2026-10-02', '2026-10-01')` → `[]`.
- `localDateOf('2026-10-06T01:00:00Z')` → `'2026-10-05'` (22h em SP).
- `formatShort('2026-10-06')` → `'6 out'`; `formatShort('2026-05-01')` → `'1 mai'`.
- `relativeDayLabel` para hoje, ontem e anteontem.
- `daysBetween('2026-10-06', '2026-12-31')` → 86.

### 2.2 Novo `src/lib/format.ts`
```ts
export const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const WEEKDAY_LONG  = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
                              'Quinta-feira', 'Sexta-feira', 'Sábado']
export const WEEKDAY_LETTER = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

/** +20, −10 (sinal de menos tipográfico U+2212), 0 */
export function formatPoints(n: number): string

/** Rótulo de frequência de um objetivo recorrente. */
export function frequencyLabel(schedule: Schedule, weekdays: number[] | null): string

/** Normaliza dias: ordena, remove duplicados. 7 dias → retorna null e o chamador salva como 'daily'. */
export function normalizeWeekdays(days: number[]): number[] | null

export const WEIGHT_LABEL: Record<Weight, string> = { 10: 'Baixo', 20: 'Médio', 30: 'Alto' }
```

Regras de `frequencyLabel`:
| Entrada | Saída |
|---|---|
| `daily` | "Todos os dias" |
| `weekdays` `[1,2,3,4,5]` | "Dias úteis" |
| `weekdays` `[0,6]` | "Fins de semana" |
| `weekdays` `[1,3,5]` | "Seg, Qua, Sex" |
| `weekdays` `[0,2]` | "Ter, Dom" (ordem de segunda a domingo) |
| `once` | "Só neste dia" |

`src/lib/format.test.ts` cobre: `formatPoints(20)` → "+20", `(-10)` → "−10", `(0)` → "0"; todas as linhas da tabela acima; `normalizeWeekdays([5,1,1,3])` → `[1,3,5]`; `normalizeWeekdays([0,1,2,3,4,5,6])` → `null`.

**Commit:** `feat: date and formatting helpers`

---

## Etapa 3 — Regras puras com testes [CLAUDE CODE] (~50 min)

Três módulos sem nenhuma dependência do banco ou do React. São a parte mais importante do dia: escreva os testes junto.

### 3.1 `src/lib/logIndex.ts`
```ts
import type { ObjectiveLog } from './types'

export class LogIndex {
  private keys: Set<string>
  constructor(logs: Pick<ObjectiveLog, 'objective_id' | 'log_date'>[]) {
    this.keys = new Set(logs.map(l => LogIndex.key(l.objective_id, l.log_date)))
  }
  static key(objectiveId: string, date: string) { return `${objectiveId}|${date}` }
  has(objectiveId: string, date: string) { return this.keys.has(LogIndex.key(objectiveId, date)) }
}
```

### 3.2 `src/lib/schedule.ts`
Implementação de referência:
```ts
import type { Objective } from './types'
import { localDateOf, weekday } from './dates'

export function archivedOn(o: Objective): string | null {
  return o.archived_at ? localDateOf(o.archived_at) : null
}

export function isScheduledOn(o: Objective, d: string): boolean {
  const arch = archivedOn(o)
  if (arch && d >= arch) return false
  switch (o.schedule) {
    case 'once':     return o.once_date === d
    case 'daily':    return o.starts_on <= d
    case 'weekdays': return o.starts_on <= d && (o.weekdays ?? []).includes(weekday(d))
  }
}

export function objectivesForDay(objectives: Objective[], d: string): Objective[] {
  return objectives
    .filter(o => isScheduledOn(o, d))
    .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
}

/** Agrupa versões por linhagem. */
export function groupByLineage(objectives: Objective[]): Map<string, Objective[]>

/** Versão atual (não arquivada) de uma linhagem, ou null se toda a linhagem está arquivada. */
export function currentVersion(versions: Objective[]): Objective | null

/** Versão mais recente por created_at (usada para exibir linhagens arquivadas). */
export function latestVersion(versions: Objective[]): Objective
```

### 3.3 `src/lib/scoring.ts`
```ts
import type { Objective } from './types'
import { LogIndex } from './logIndex'
import { objectivesForDay } from './schedule'
import { eachDay } from './dates'

export const MISSED_PENALTY_RATIO = 0.5

export interface DayScore {
  date: string
  earned: number
  lost: number
  balance: number
  maxPossible: number
  pct: number | null
  positivesDone: number
  positivesTotal: number
  negativesOccurred: number
  negativesTotal: number
  final: boolean            // true se o dia já terminou
}

export function scoreDay(objectives: Objective[], logs: LogIndex, date: string, today: string): DayScore {
  const items = objectivesForDay(objectives, date)
  const final = date < today
  let earned = 0, lost = 0, maxPossible = 0
  let positivesDone = 0, positivesTotal = 0, negativesOccurred = 0, negativesTotal = 0

  for (const o of items) {
    const logged = logs.has(o.id, date)
    if (o.polarity === 'positive') {
      positivesTotal++
      maxPossible += o.weight
      if (logged) { earned += o.weight; positivesDone++ }
      else if (final) lost += o.weight * MISSED_PENALTY_RATIO
    } else {
      negativesTotal++
      if (logged) { lost += o.weight; negativesOccurred++ }
    }
  }

  return {
    date, earned, lost, balance: earned - lost, maxPossible,
    pct: maxPossible > 0 ? Math.round((earned / maxPossible) * 100) : null,
    positivesDone, positivesTotal, negativesOccurred, negativesTotal, final,
  }
}

/** Para o gráfico de sexta: uma DayScore por dia do intervalo. */
export function scoreRange(objectives: Objective[], logs: LogIndex, from: string, to: string, today: string): DayScore[] {
  return eachDay(from, to).map(d => scoreDay(objectives, logs, d, today))
}
```

### 3.4 `src/lib/streaks.ts`
```ts
import type { Objective } from './types'
import { LogIndex } from './logIndex'
import { isScheduledOn } from './schedule'
import { eachDay } from './dates'

export interface StreakInfo { current: number; best: number }

export function lineageStreak(versions: Objective[], logs: LogIndex, today: string): StreakInfo {
  const recurring = versions.filter(v => v.schedule !== 'once')
  if (recurring.length === 0) return { current: 0, best: 0 }

  const polarity = recurring[0].polarity
  const start = recurring.map(v => v.starts_on).sort()[0]
  let run = 0
  let best = 0

  for (const d of eachDay(start, today)) {
    const v = recurring.find(x => isScheduledOn(x, d))
    if (!v) continue
    const logged = logs.has(v.id, d)
    const isToday = d === today

    if (polarity === 'positive') {
      if (logged) { run++; best = Math.max(best, run) }
      else if (!isToday) run = 0
    } else {
      if (logged) run = 0
      else if (!isToday) { run++; best = Math.max(best, run) }
    }
  }
  return { current: run, best }
}

/** Sequência de todas as linhagens recorrentes, por lineage_id. */
export function allStreaks(objectives: Objective[], logs: LogIndex, today: string): Map<string, StreakInfo>
```

### 3.5 Testes
Crie uma fábrica de objetos de teste em `src/lib/testing.ts` (só usada em testes):
```ts
export function obj(partial: Partial<Objective> & Pick<Objective, 'id'>): Objective
// defaults: user_id 'u', title = id, polarity 'positive', weight 10, schedule 'daily',
// weekdays null, once_date null, starts_on '2026-10-01', archived_at null,
// sort_order 0, created_at '2026-10-01T12:00:00Z', lineage_id = id
```

Calendário de referência: 1/10/2026 é quinta; 4/10 domingo; 5/10 segunda; 6/10 terça; 7/10 quarta; 8/10 quinta. **Em todos os testes, `today = '2026-10-08'`.**

**`schedule.test.ts`**
| Caso | Esperado |
|---|---|
| daily com `starts_on` 01/10: em 30/09 / 01/10 / 08/10 | false / true / true |
| weekdays `[1,3,5]`: em 05/10 (seg) / 06/10 (ter) / 07/10 (qua) | true / false / true |
| once com `once_date` 07/10: em 07/10 / 08/10 | true / false |
| daily arquivado em `2026-10-05T15:00:00Z` (12h SP de 05/10): em 04/10 / 05/10 | true / false |
| daily arquivado em `2026-10-06T01:00:00Z` (22h SP de **05/10**): em 05/10 | false (fuso de SP, não UTC) |
| `objectivesForDay` ordena por `sort_order` e depois `created_at` | ordem correta |

**`scoring.test.ts`** — objetos:
- **A:** positivo, daily, peso 20
- **B:** positivo, weekdays `[1,3,5]`, peso 10
- **C:** negativo, daily, peso 30
- **D:** positivo, once 07/10, peso 10

| Dia | Registros | earned | lost | balance | max | pct | final |
|---|---|---|---|---|---|---|---|
| 07/10 (qua) | A, C | 20 | 5 (B) + 5 (D) + 30 (C) = 40 | −20 | 40 | 50 | true |
| 07/10 (qua) | A, B, D | 40 | 0 | 40 | 40 | 100 | true |
| 08/10 (hoje, qui) | nenhum | 0 | 0 | 0 | 20 | 0 | false |
| 08/10 (hoje) | C | 0 | 30 | −30 | 20 | 0 | false |
| 30/09 | nenhum | 0 | 0 | 0 | 0 | null | true |

E um teste que confirma `MISSED_PENALTY_RATIO === 0.5` e que peso 30 não feito em dia encerrado desconta 15.

**`streaks.test.ts`**
| Caso | Esperado |
|---|---|
| Positivo daily; feito 01–03 e 05–07/10 (falhou 04/10); hoje não feito | current 3, best 3 |
| Mesmo caso + feito hoje (08/10) | current 4, best 4 |
| Positivo daily; feito 01–05, falhou 06, feito 07 | current 1, best 5 |
| Positivo weekdays `[1,3,5]`, início 01/10; feito 02 (sex), 05 (seg), 07 (qua) | current 3 (dias não programados não quebram) |
| Negativo daily; ocorreu em 03/10; hoje sem ocorrência | current 4 (04–07), best 4 |
| Negativo daily; ocorreu hoje | current 0 |
| Linhagem com duas versões: v1 daily peso 20 arquivada `2026-10-05T15:00:00Z`; v2 daily peso 30, `starts_on` 05/10, mesmo `lineage_id`; feito v1 01–04 e v2 05–07 | current 7 (a edição não zera) |
| Linhagem só com objetivo once | current 0, best 0 |

Rode `npm test` até todos passarem.

**Commit:** `feat: scheduling, scoring and streak rules with tests`

---

## Etapa 4 — Camada de dados [CLAUDE CODE] (~30 min)

As páginas nunca chamam o `supabase` diretamente: usam funções de `src/lib/api/`. Nenhuma função envia `user_id` (o banco preenche).

### 4.1 `src/lib/api/errors.ts`
```ts
export class ApiError extends Error {
  code?: string
  constructor(message: string, code?: string) { super(message); this.code = code }
}

/** Converte qualquer erro em mensagem para o usuário, em português. */
export function userMessage(err: unknown): string
```
| Código / situação | Mensagem |
|---|---|
| `23505` (duplicado) | "Isso já estava registrado." |
| `23514` (check) | "Algum dado está inválido. Revise o formulário." |
| `42501` / `PGRST301` / sessão expirada | "Sua sessão expirou. Entre novamente." |
| `TypeError: Failed to fetch` | "Sem conexão. Tente novamente." |
| outros | "Algo deu errado. Tente novamente." |

Um helper `unwrap<T>({ data, error })` que lança `ApiError` se houver erro e devolve `data`.

### 4.2 `src/lib/api/objectives.ts`
```ts
export interface ObjectiveInput {
  title: string
  polarity: Polarity
  weight: Weight
  schedule: Schedule
  weekdays: number[] | null
  once_date: string | null
}

listObjectives(): Promise<Objective[]>               // todos, inclusive arquivados
createObjective(input: ObjectiveInput, lineageId?: string): Promise<Objective>
renameObjective(id: string, title: string): Promise<Objective>
updateOnceObjective(id: string, title: string, weight: Weight): Promise<Objective>
replaceObjective(oldId: string, input: Omit<ObjectiveInput, 'polarity'>): Promise<Objective>
  // supabase.rpc('replace_objective', { p_old_id, p_title, p_weight, p_schedule, p_weekdays, p_once_date })
archiveObjective(id: string): Promise<void>          // archived_at = new Date().toISOString()
deleteLineage(lineageId: string): Promise<void>      // delete where lineage_id = …
deleteObjective(id: string): Promise<void>           // para avulsos
```
Antes de enviar, `title` sempre passa por `.trim()`. Se `schedule === 'weekdays'`, aplique `normalizeWeekdays`; se o resultado for `null`, envie `schedule: 'daily'` e `weekdays: null`.

### 4.3 `src/lib/api/logs.ts`
```ts
listAllLogs(): Promise<Pick<ObjectiveLog, 'id' | 'objective_id' | 'log_date'>[]>
addLog(objectiveId: string, date: string): Promise<void>      // ignora erro 23505
removeLog(objectiveId: string, date: string): Promise<void>
```
Paginação de `listAllLogs`:
```ts
const PAGE = 1000
const all = []
for (let from = 0; ; from += PAGE) {
  const { data, error } = await supabase
    .from('objective_logs')
    .select('id, objective_id, log_date')
    .order('log_date', { ascending: true })
    .order('id', { ascending: true })
    .range(from, from + PAGE - 1)
  if (error) throw new ApiError(error.message, error.code)
  all.push(...data)
  if (data.length < PAGE) break
}
return all
```

### 4.4 `src/lib/api/goals.ts`
```ts
export interface GoalInput {
  title: string
  why: string | null
  due_date: string | null
  progress_type: ProgressType
  current_value: number
  target_value: number | null
  unit: string | null
}
listGoals(): Promise<Goal[]>
createGoal(input: GoalInput): Promise<Goal>
updateGoal(id: string, input: GoalInput): Promise<Goal>
setGoalProgress(id: string, currentValue: number): Promise<Goal>
setGoalStatus(id: string, status: GoalStatus): Promise<Goal>
deleteGoal(id: string): Promise<void>
```
Strings vazias viram `null` (`why`, `unit`, `due_date`). No tipo `percent`, `target_value` e `unit` são enviados como `null` e `current_value` é limitado a 0–100.

**Commit:** `feat: data access layer`

---

## Etapa 5 — Estado compartilhado [CLAUDE CODE] (~30 min)

### 5.1 `src/data/TrackerProvider.tsx`
Um contexto carregado uma vez após o login, compartilhado por **Hoje** e **Objetivos** (assim as duas telas ficam sempre em sincronia, sem nova consulta ao trocar de aba).

Monte o provider dentro do `Layout` (logo, só existe com usuário logado).

Expõe via `useTracker()`:
```ts
{
  status: 'loading' | 'ready' | 'error'
  error: string | null
  objectives: Objective[]
  logs: LogIndex
  today: string                                 // atualiza ao virar o dia (ver 5.2)
  streaks: Map<string, StreakInfo>              // por lineage_id; recalculado com useMemo
  reload(): Promise<void>
  toggleLog(objectiveId: string, date: string): Promise<void>
  createObjective(input, lineageId?): Promise<void>
  saveObjectiveEdit(o: Objective, input): Promise<void>  // decide entre rename, updateOnce e replace
  archive(o: Objective): Promise<void>
  restore(lineageVersions: Objective[]): Promise<void>   // createObjective com dados da última versão + mesmo lineage_id
  remove(o: Objective): Promise<void>                    // once → deleteObjective; recorrente → deleteLineage
}
```

**`toggleLog` otimista:**
1. Se a chave já está em andamento (um `Set` de pendentes), ignora o toque (evita duplo toque).
2. Atualiza o estado local imediatamente (adiciona ou remove o registro).
3. Chama `addLog` ou `removeLog`.
4. Em caso de erro: desfaz a mudança local e mostra um toast com `userMessage(err)`.

**`saveObjectiveEdit(o, input)`:**
- `o.schedule === 'once'` → `updateOnceObjective`.
- Só o título mudou → `renameObjective`.
- Peso, frequência ou dias mudaram → `replaceObjective`, e depois `reload()` (precisa trazer a versão nova e o registro movido).

As demais ações atualizam o estado local com o retorno do banco, sem recarregar tudo.

### 5.2 Virada do dia
`today` é calculado com `todayISO()` e reavaliado quando a aba volta a ficar visível (`visibilitychange`) e a cada 60 segundos. Assim, um app aberto de um dia para o outro não fica marcando o dia errado.

### 5.3 Toast
`src/components/Toast.tsx` + `ToastProvider` com `useToast().show(message, kind?)`:
- Aparece acima da barra inferior no celular e no canto inferior direito no desktop.
- Some sozinho após 4s; tem botão de fechar.
- `role="status"` e `aria-live="polite"`.
- Visual: fundo `--ink`, texto branco, raio `--r-md`, 14px. Tipo `error` com barra lateral `--negative`.

**Commit:** `feat: tracker state provider with optimistic toggles`

---

## Etapa 6 — Componentes de interface [CLAUDE CODE] (~40 min)

### 6.1 Ícones novos em `icons.tsx`
Mesmo estilo dos existentes (SVG de traço, `stroke="currentColor"`, `stroke-width="2"`, 20px padrão, prop `size`): `PlusIcon`, `MinusIcon`, `EditIcon` (lápis), `ArchiveIcon` (caixa), `TrashIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `CloseIcon` (X), `FlameIcon` (chama, para sequência), `MoreIcon` (três pontos horizontais), `RestoreIcon` (seta circular).

### 6.2 `Sheet` (padrão único de formulário)
`src/components/Sheet.tsx`, usando o elemento nativo `<dialog>` com `showModal()`:
- Props: `open`, `onClose`, `title`, `children`, `footer?`.
- **Celular (< 900px):** fixo na base, largura total, raio de 18px só nos cantos de cima, altura máxima de 90dvh, com rolagem interna. Pequena "alça" cinza (36×4px) no topo, decorativa.
- **Desktop (≥ 900px):** centralizado, largura de 520px, raio de 18px.
- Cabeçalho: título (Space Grotesk 600, 20px) e botão fechar (`CloseIcon`, 44×44, `aria-label="Fechar"`).
- Rodapé fixo, se houver `footer`: botões alinhados à direita no desktop e de largura total, empilhados, no celular.
- Fecha com Esc (nativo do `<dialog>`), com clique no fundo e com o botão fechar.
- Fundo do backdrop: `rgba(18, 22, 20, 0.45)`.
- Animação de entrada: subir 16px + fade em 180ms. Desligar com `prefers-reduced-motion: reduce`.
- Ao abrir, foco no primeiro campo. Ao fechar, o foco volta ao botão que abriu (o `<dialog>` faz isso nativamente; confirme).
- Respeitar `env(safe-area-inset-bottom)` no rodapé no celular.

### 6.3 `Segmented`
`src/components/Segmented.tsx`: grupo de opções exclusivas, implementado com `<input type="radio">` visualmente oculto e `<label>` estilizado (acessível por teclado nativamente).
- Props: `name`, `legend`, `options: { value, label, hint? }[]`, `value`, `onChange`, `disabled?`.
- Envolvido em `<fieldset>` com `<legend>` no mesmo estilo do label de `.field`.
- Visual: trilho com fundo `--surface-2`, borda `--line` e raio `--r-sm`; opções de largura igual e altura de 44px; opção selecionada com fundo `--ink`, texto branco e peso 600. O `hint` aparece embaixo do rótulo em 11px (ex.: "10 pts").
- Foco visível no label quando o input interno recebe foco (`:focus-visible + label`).

### 6.4 `WeekdayPicker`
`src/components/WeekdayPicker.tsx`:
- 7 botões em ordem **segunda → domingo** (S T Q Q S S D), cada um com 44×44, raio 12px.
- `aria-pressed` e `aria-label` com o nome completo do dia (`WEEKDAY_LONG`).
- Selecionado: fundo `--ink` e texto branco. Não selecionado: borda `--line` e fundo `--surface`.
- Abaixo, atalhos em texto: "Dias úteis", "Fins de semana" e "Todos" (botões `.btn-text`).
- Valor no padrão do banco (0 = domingo).

### 6.5 `ProgressBar`
`src/components/ProgressBar.tsx`: trilho de 8px de altura, raio total, fundo `#E6EAE5`; preenchimento `--accent` com transição de largura de 300ms. `role="progressbar"` com `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100` e `aria-label`.

### 6.6 `ConfirmBlock`
Um bloco de confirmação **dentro** do Sheet (não um segundo diálogo), usado em exclusões:
- Fundo `#FBEDEC`, borda `#F0C9C6`, raio `--r-md`, padding `--s-4`.
- Texto explicativo e dois botões: "Cancelar" (`.btn-ghost`) e a ação destrutiva (fundo `--negative`, texto branco).

### 6.7 Estilos novos em `global.css`
- `.field select` e `.field textarea` no mesmo estilo do input (16px de fonte, para o iOS não dar zoom). `textarea` com `resize: vertical` e altura mínima de 96px.
- `.field-hint` (12px, `--muted`) e `.field-error` (12px, `--negative`).
- `.section-title`: Space Grotesk 600, 17px, com contador à direita em mono `--muted`.
- `.item-row` (ver etapa 8).
- `.chip`: 12px, padding 2px 8px, raio total, fundo `--surface-2`, borda `--line`.
- `.btn-danger`: fundo `--negative`, texto branco.
- `.empty-state`: card centralizado, padding de 32px, título em Space Grotesk 600, 18px, texto `--muted` e botão.
- `.text-negative`, `.text-streak` e `.text-accent`.

**Commit:** `feat: sheet, segmented, weekday picker and supporting styles`

---

## Etapa 7 — Tela Objetivos [CLAUDE CODE] (~45 min)

Rota `/objetivos`. Gerencia **só objetivos recorrentes** (os avulsos vivem na tela Hoje).

### 7.1 Estrutura
- `PageHeader`: eyebrow "Rotina"; título "Objetivos"; subtítulo "O que você faz e o que você evita."; `action`: botão "+ Novo" (`.btn-primary`, com `PlusIcon`).
- Card **"Fazer"**: linhagens recorrentes positivas ativas.
- Card **"Evitar"**: linhagens recorrentes negativas ativas.
- **"Arquivados"**: botão de texto "Mostrar arquivados (N)" que expande uma lista; só aparece se N > 0.
- Estado vazio (nenhum recorrente): `.empty-state` com o título "Sua rotina começa aqui", o texto "Crie o primeiro hábito que você quer manter, ou algo que quer evitar." e o botão "Criar objetivo".

### 7.2 Linha de objetivo
Altura mínima de 64px, separador `--line-soft` no topo (exceto a primeira linha), layout em grid `1fr auto`:
- **Esquerda:** título (15px, 500); embaixo, em 12px `--muted`: `frequencyLabel` · chip de peso ("Médio · 20 pts").
- **Direita:**
  - Positivo: `FlameIcon` 14px + sequência atual (mono 15px 600, `--streak`) e, embaixo, "recorde N" (11px, `--muted`).
  - Negativo: mesma coisa, com o rótulo "dias limpo" no lugar da chama.
- A linha inteira é um `<button>` que abre o Sheet de edição (`aria-label="Editar {título}"`).

Linha arquivada: título em `--muted`, "Arquivado em 6 out" e um botão "Restaurar" à direita (`RestoreIcon` + texto) que chama `restore`.

### 7.3 `ObjectiveForm` (dentro do Sheet)
`src/components/ObjectiveForm.tsx`, reutilizado pela tela Hoje. Props: `mode: 'create-recurring' | 'create-once' | 'edit'`, `objective?`, `onceDate?`, `onDone()`.

Campos, nesta ordem:
1. **Título:** input com `maxLength` 120, obrigatório, com foco automático. Placeholder conforme o tipo: "Ex.: Ler 20 minutos" / "Ex.: Celular depois das 23h".
2. **Tipo:** `Segmented` com "Fazer" e "Evitar". Desabilitado na edição, com o hint "O tipo não pode ser alterado depois de criado."
3. **Peso:** `Segmented` com "Baixo" (hint "10 pts"), "Médio" ("20 pts") e "Alto" ("30 pts"). Padrão: Médio.
   - Hint dinâmico abaixo: Fazer → "Vale +20 quando feito; −10 se ficar pendente ao fim do dia." Evitar → "Desconta −20 se ocorrer."
4. **Frequência** (só nos modos recorrentes): `Segmented` com "Todos os dias" e "Dias específicos". Em "Dias específicos", aparece o `WeekdayPicker`.
   - Modo `create-once` não tem esse campo; mostra o texto "Vale só para {relativeDayLabel(onceDate)}."

Validação (mostrar só depois da primeira tentativa de salvar):
- Título vazio → "Dê um nome ao objetivo."
- "Dias específicos" sem nenhum dia → "Escolha ao menos um dia."

Aviso na edição, quando peso, frequência ou dias mudarem (aparece assim que o usuário altera um desses campos): bloco informativo com fundo `--surface-2` e o texto "A mudança vale a partir de hoje. Seu histórico e sua sequência são mantidos."

Rodapé do Sheet:
- Criar: "Cancelar" (ghost) e "Criar objetivo" (primary).
- Editar: "Salvar" (primary) e, à esquerda, os botões de texto "Arquivar" e "Excluir" (este em `--negative`).
- Durante o salvamento: botões desabilitados e o texto "Salvando…".

**Excluir** abre um `ConfirmBlock` dentro do Sheet:
- Recorrente: "Excluir apaga todo o histórico deste objetivo e altera as pontuações dos dias passados. Para só parar de acompanhar, use Arquivar." Botão: "Excluir definitivamente".
- Avulso: "Excluir este objetivo do dia?" Botão: "Excluir".

**Arquivar** fecha o Sheet e mostra o toast "Objetivo arquivado."

**Commit:** `feat: objectives screen with create, edit, archive, restore and delete`

---

## Etapa 8 — Tela Hoje [CLAUDE CODE] (~60 min)

Rota `/`. O dia exibido vem do parâmetro `?d=YYYY-MM-DD` (via `useSearchParams`); sem parâmetro, é hoje. Datas futuras ou inválidas redirecionam para hoje.

### 8.1 Cabeçalho e navegação entre dias
- **Hoje:** eyebrow com `capitalize(formatLong(hoje))`; título `${greeting()}, Guga.`; botão "Sair" no celular (como já existe).
- **Dia anterior:** eyebrow "Revisando um dia anterior"; título `capitalize(formatLong(d))`.
- **Navegador de dia**, logo abaixo do cabeçalho: `[‹]  Hoje / Ontem / 6 out  [›]`.
  - Botões de 44×44 com `aria-label` "Dia anterior" e "Próximo dia". O "›" fica desabilitado quando o dia exibido é hoje.
  - Quando não é hoje, aparece à direita o botão de texto "Voltar para hoje".

### 8.2 Card de resumo do dia
Card escuro (`.card-ink`), em layout de duas colunas que vira uma coluna abaixo de 360px:
- **Esquerda:**
  - Rótulo "Saldo do dia" (12px, caixa alta, `--muted-on-ink`).
  - Saldo com `formatPoints` (JetBrains Mono 600, 44px). Cor: positivo `--accent-bright`; negativo `#F2A49C`; zero, branco.
  - Linha de status (13px, `--muted-on-ink`): "{feitos} de {total} feitos" e, se houver negativos ocorridos, " · {n} deslize(s)".
  - Selo pequeno: "Parcial" (hoje) ou "Dia encerrado" (passado). Hoje, com o tooltip `title`: "Pendências descontam metade do peso ao fim do dia."
- **Direita:** anel de aproveitamento (SVG de 96px, traço de 10px, trilho `#2B332E`, progresso `--accent-bright`, pontas arredondadas, transição de 400ms no `stroke-dasharray`), com o percentual no centro em mono 22px, ou "—" se for `null`.

### 8.3 Lista "Fazer"
Card com `.section-title` "Fazer" e o contador "3/5" à direita.

**`.item-row`** (altura mínima de 64px, separador `--line-soft`), em grid `44px 1fr auto`, com 12px de espaço entre colunas:
1. **Botão de marcar** (44×44 de área de toque, com um quadrado visual de 26px e raio de 8px):
   - Pendente: borda de 2px `#9AA49E`.
   - Feito: fundo `--accent` e check branco. Ao marcar, animação de escala de 0.85 para 1 em 140ms (sem animação com `prefers-reduced-motion`).
   - `aria-pressed`; `aria-label` "Marcar {título} como feito" ou "Desmarcar {título}".
2. **Texto:** título (15px, 500); quando feito, cor `--muted` e riscado. Embaixo, em 12px `--muted`:
   - Recorrente: "+20 · Todos os dias"
   - Avulso: "+10 · Só hoje" (ou "Só neste dia" em dias anteriores)
3. **Direita:**
   - Recorrente: `FlameIcon` + sequência atual (mono 14px, `--streak`); oculto se a sequência for 0.
   - Avulso: botão `MoreIcon` (44×44, `aria-label="Opções de {título}"`) que abre o Sheet de edição em modo `edit`.

Ordenação: recorrentes primeiro (`sort_order`, depois `created_at`), avulsos por último.

Ao final da lista, o botão de texto "+ Objetivo só para {hoje / este dia}", que abre o Sheet em modo `create-once` com `onceDate = d`.

### 8.4 Lista "Evitar"
Card com `.section-title` "Evitar" (sem contador). Só aparece se houver negativos programados no dia.

Mesma estrutura de linha, com o botão em formato de **círculo**:
- Não ocorreu: borda de 2px `--line`.
- Ocorreu: fundo `--negative` e um X branco.
- `aria-label` "Registrar que {título} ocorreu" ou "Desfazer registro de {título}".
- Metadados: "−30 se ocorrer". Quando ocorreu: "Ocorreu · −30", em `--negative`.
- Direita: sequência de dias limpo (mono, `--streak`), oculta se for 0.

### 8.5 Estados
- **Carregando:** dois cards em esqueleto (blocos `--line-soft` pulsando suavemente; estáticos com `prefers-reduced-motion`).
- **Erro de carregamento:** card com a mensagem de `userMessage` e o botão "Tentar novamente" (`reload`).
- **Nenhum objetivo programado no dia, mas existem objetivos:** card com o texto "Nada programado para este dia." e o botão "+ Objetivo só para este dia".
- **Nenhum objetivo cadastrado:** `.empty-state` com o título "Vamos montar sua rotina", o texto "Comece pelos hábitos que você quer manter todo dia." e dois botões: "Criar objetivos" (vai para `/objetivos`) e "Só para hoje" (abre o Sheet `create-once`).

### 8.6 Atualização imediata
Marcar ou desmarcar atualiza na hora o saldo, o anel, os contadores e as sequências (estado otimista do `TrackerProvider`). Não deve haver recarregamento visível.

**Commit:** `feat: today screen with day navigation, scoring and streaks`

---

## Etapa 9 — Ponto de controle: publicar e testar [GUGA, guiado] (~15 min)

1. **[CLAUDE CODE]** Rode `npm run lint`, `npm test` e `npm run build`. Corrija tudo.
2. **[GUGA]** "Push origin" no GitHub Desktop.
3. **[CLAUDE CODE]** Acompanhe o deploy pela API pública do GitHub e avise quando estiver no ar.
4. **[GUGA]** No celular, um passo por vez, com foto quando indicado:
   1. Em Objetivos, criar "Ler 20 minutos" (Fazer, Médio, Todos os dias). → foto da tela Objetivos
   2. Criar "Treinar" (Fazer, Alto, Dias específicos: Seg, Qua, Sex).
   3. Criar "Celular depois das 23h" (Evitar, Médio, Todos os dias).
   4. Ir para Hoje e marcar "Ler 20 minutos". O saldo deve ir para +20. → foto
   5. Marcar "Celular depois das 23h" como ocorrido. O saldo deve ir para 0. Desmarcar em seguida.
   6. Adicionar um objetivo só para hoje e marcá-lo.
   7. Voltar para ontem com "‹". Nenhum recorrente deve aparecer (foram criados hoje) e o "›" deve funcionar.
   8. Em Objetivos, editar o peso de "Ler 20 minutos" para Alto. O aviso de mudança deve aparecer. Salvar e voltar para Hoje: o item deve continuar marcado, valendo +30. → foto
   9. Arquivar "Treinar", ver em "Mostrar arquivados" e restaurar.

Se algo falhar, corrija, faça um novo commit e repita o push antes de seguir para as metas.

---

## Etapa 10 — Tela Metas [CLAUDE CODE] (~45 min)

Rota `/metas`. Usa um hook próprio, `useGoals()` (estado local à página, carregado ao abrir; não precisa entrar no `TrackerProvider`).

### 10.1 Estrutura
- `PageHeader`: eyebrow "Longo prazo"; título "Metas"; subtítulo "Para onde a disciplina te leva."; `action` "+ Nova".
- Lista de metas **ativas**, cada uma em um card próprio, ordenadas por prazo (mais próximo primeiro; sem prazo no fim) e depois por `created_at`.
- "Mostrar concluídas (N)" e "Mostrar arquivadas (N)": botões de texto que expandem as listas.
- Estado vazio: `.empty-state` com o título "Qual é o seu próximo grande objetivo?", o texto "Metas de longo prazo dão sentido aos hábitos do dia a dia." e o botão "Criar meta".

### 10.2 Card de meta
- **Linha 1:** título (Space Grotesk 600, 18px) e botão `EditIcon` (44×44, `aria-label="Editar {título}"`).
- **Linha 2** (se houver `why`): texto em itálico, 14px, `--muted`, até 2 linhas com reticências.
- **Barra de progresso**, com margem de 12px acima e abaixo.
- **Linha 3**, em grid `1fr auto`:
  - Esquerda: valor em mono 15px 600. Numérico: "17 / 24 livros". Percentual: "40%". À direita do valor, em 13px `--muted`, o percentual equivalente no caso numérico ("71%").
  - Direita: botões "−" e "+" (44×44 cada, `.btn-ghost`, `aria-label` "Diminuir progresso" e "Aumentar progresso"). O passo é 1 no numérico e 5 no percentual. Os valores ficam limitados a 0 e ao alvo (ou 100).
- **Linha 4** (se houver prazo), em 12px: "até 31 dez · faltam 86 dias" (`--muted`); "vence hoje" (`--streak`); "prazo vencido há 3 dias" (`--negative`).
- **Meta atingida** (valor ≥ alvo, ou 100%): a barra fica completa e aparece um bloco com fundo `#E3F1E8` e o texto "Meta atingida." com o botão "Marcar como concluída".

Os botões "−" e "+" atualizam na hora (otimista) e revertem com toast em caso de erro.

### 10.3 `GoalForm` (no Sheet)
1. **Título:** obrigatório, máximo de 120 caracteres. Placeholder "Ex.: Ler 24 livros em 2026".
2. **Por quê:** textarea opcional com no máximo 500 caracteres e contador "0/500". Placeholder "O que muda na sua vida quando você chegar lá?"
3. **Prazo:** `input type="date"` opcional, com o botão de texto "Remover prazo" quando preenchido.
4. **Como medir:** `Segmented` com "Número" e "Porcentagem".
   - **Número:** três campos em linha (que viram coluna abaixo de 400px): "Atual" (padrão 0), "Alvo" (obrigatório, > 0) e "Unidade" (opcional, até 30 caracteres; placeholder "livros", "km", "R$").
   - **Porcentagem:** campo "Atual (%)", de 0 a 100.

Validação:
- Título vazio → "Dê um nome à meta."
- Alvo vazio ou menor ou igual a 0 → "Defina um alvo maior que zero."
- Percentual fora de 0–100 → "Use um valor entre 0 e 100."
- Atual negativo → "O valor atual não pode ser negativo."

Rodapé:
- Criar: "Cancelar" e "Criar meta".
- Editar: "Salvar" e, à esquerda, os botões de texto "Concluir" (ou "Reabrir", se concluída), "Arquivar" (ou "Desarquivar") e "Excluir". Excluir abre um `ConfirmBlock` com o texto "Excluir esta meta? Isso não pode ser desfeito."

**Commit:** `feat: goals screen with progress tracking`

---

## Etapa 11 — Diagnóstico atualizado [CLAUDE CODE] (~10 min)

Acrescente à página `/diagnostico`, depois das verificações existentes:

8. **Linhagem:** criar um objetivo `daily` de teste e conferir que o retorno tem `lineage_id`.
9. **Substituição:** marcar o objetivo hoje, chamar `replaceObjective` com peso 30 e conferir:
   - a versão antiga voltou com `archived_at` preenchido;
   - a nova tem o mesmo `lineage_id`, `weight = 30` e `starts_on = hoje`;
   - o registro de hoje agora pertence à nova versão (e não à antiga).
10. **Limpeza:** `deleteLineage` e confirmar que nenhuma versão nem registro restou.

A limpeza roda em `try/finally`, mesmo se algo falhar.

**Commit:** `chore: diagnostics cover lineage and replace_objective`

---

## Etapa 12 — Publicação final e testes [GUGA, guiado] (~15 min)

1. **[CLAUDE CODE]** Rode `npm run lint`, `npm test` e `npm run build`.
2. **[GUGA]** "Push origin". **[CLAUDE CODE]** Acompanhe o deploy.
3. **[GUGA]** No celular, um passo por vez:
   1. Abrir `/#/diagnostico` e rodar os testes. Os 10 devem passar. → foto
   2. Em Metas, criar "Ler 24 livros" (Número, atual 17, alvo 24, unidade "livros", prazo 31/12). → foto
   3. Tocar em "+" até 24. O bloco "Meta atingida" deve aparecer. Marcar como concluída.
   4. Criar uma meta em porcentagem, tocar em "+" duas vezes (deve ir a 10%) e depois excluí-la.
   5. Em Hoje, conferir que tudo da etapa 9 continua como estava. → foto
4. **[GUGA]** Antes de dormir: abrir Hoje e marcar o que realmente fez hoje. Este é o primeiro dia real de uso do Mast.

---

## Etapa 13 — Encerramento [CLAUDE CODE] (~10 min)

### 13.1 Atualizar o `CLAUDE.md`
- **Seção 5 (Regras de negócio):** substitua pelas regras da seção "Regras de negócio fechadas para hoje" deste plano, especialmente:
  - positivo não feito desconta **metade** do peso (`MISSED_PENALTY_RATIO = 0.5`);
  - linhagem, `replace_objective` e sequência por linhagem;
  - regra de arquivamento pela data local;
  - excluir apaga a linhagem; restaurar cria nova versão.
- **Seção 6 (Modelo de dados):** acrescente `lineage_id` e a função `replace_objective`.
- **Status:** marque "Qui 8/10 — núcleo" como concluído (a sessão foi antecipada; registre a data real).
- **Decisões** (com a data):
  - Desconto de positivo não feito = metade do peso.
  - Linhagem de objetivos para preservar a sequência em edições.
  - Todos os registros são carregados com paginação de 1.000.
  - `TrackerProvider` compartilha objetivos e registros entre Hoje e Objetivos; metas usam um hook próprio.
  - Formulários sempre em `Sheet` (`<dialog>` nativo).
  - Qualquer outra decisão tomada durante a sessão.

**Commit:** `docs: update CLAUDE.md after day 2`. Peça ao Guga o último "Push origin".

### 13.2 Resumo para o Guga
Salve em `docs/resumo-dia-2.md` (e commite) e mostre no chat, no mesmo formato do Dia 1:
```
## Resumo — Dia 2
**Concluído:** …
**Pendente / não concluído:** …
**Problemas encontrados e como foram resolvidos:** …
**Decisões tomadas fora do plano:** …
**O que o Dia 3 já pode usar:** (funções, componentes, estilos novos)
**Pontos para o plano do Dia 3:** …
```

---

## Solução de problemas

| Sintoma | Causa provável | Correção |
|---|---|---|
| `function replace_objective does not exist` | Migração 0002 não aplicada, ou assinatura diferente | Rodar a verificação 1.3; conferir os tipos dos parâmetros (`p_weight` como `smallint`) |
| `rpc` falha com `42501` | Grant ausente | Rodar de novo as duas últimas linhas da migração |
| Item volta a ficar desmarcado depois de marcar | Erro no `addLog`, revertido pelo otimista | Ler o toast; checar a política de insert de `objective_logs` (o objetivo precisa ser do usuário) |
| Sequência zera depois de editar o peso | Cálculo por id, e não por `lineage_id` | Usar `groupByLineage` + `lineageStreak` |
| Objetivo arquivado ainda aparece hoje | Comparação com `archived_at` em UTC | Usar `localDateOf(archived_at)` |
| Saldo de ontem não desconta pendências | `final` calculado errado | `final = date < today`, com `today` vindo do provider |
| App aberto desde ontem marca no dia errado | `today` congelado | Conferir o `visibilitychange` e o intervalo de 60s |
| Sheet abre atrás da barra inferior no celular | Contexto de empilhamento | `<dialog>` com `showModal()` fica na camada superior; não envolver em contêiner com `transform` |
| Zoom ao focar um campo no iPhone | Fonte do campo menor que 16px | `font-size: 16px` em input, select e textarea |
| Teste de data falha só no GitHub Actions | Uso de `new Date()` sem fuso | Sempre `todayISO()` e `localDateOf()`; nos testes, passar datas fixas |

---

## Tempo estimado

| Etapa | Tempo |
|---|---|
| 0. Pendências do Dia 1 | 10 min |
| 1. Migração 0002 | 15 min |
| 2. Utilitários | 20 min |
| 3. Regras puras e testes | 50 min |
| 4. Camada de dados | 30 min |
| 5. Estado compartilhado | 30 min |
| 6. Componentes | 40 min |
| 7. Objetivos | 45 min |
| 8. Hoje | 60 min |
| 9. Ponto de controle | 15 min |
| 10. Metas | 45 min |
| 11. Diagnóstico | 10 min |
| 12. Publicação final | 15 min |
| 13. Encerramento | 10 min |
| **Total** | **~6h45** |

O tempo ativo do Guga é de cerca de 45 minutos: etapas 0, 1.2–1.3, 9, 12 e os pushes. É o dia mais longo do projeto. Se a sessão precisar ser dividida, o ponto natural de pausa é depois da etapa 9: Objetivos e Hoje já estão no ar e utilizáveis, e as Metas ficam para a próxima sessão.
