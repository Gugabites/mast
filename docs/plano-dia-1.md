# Mast — Plano do Dia 1: Fundação

> **Para o Claude Code:** leia o `CLAUDE.md` antes deste plano. Este documento detalha a sessão de hoje. Execute as etapas na ordem. Etapas marcadas com **[GUGA]** são feitas manualmente pelo Guga em sites externos (GitHub, Supabase); quando chegar nelas, pare, explique ao Guga exatamente o que fazer e aguarde a confirmação antes de seguir. Etapas **[CLAUDE CODE]** são suas.

---

## Objetivo do dia

Ao fim desta sessão, existe um app no ar no GitHub Pages em que o Guga faz login, navega entre as cinco telas (ainda vazias) e o app comprovadamente lê e grava no banco do Supabase com a segurança por usuário (RLS) funcionando.

Nenhuma funcionalidade de negócio é construída hoje. O objetivo é eliminar todo o risco de infraestrutura agora, para que quinta e sexta sejam só produto.

## Critério de pronto

- [ ] `npm run build`, `npm run lint` e `npm test` rodam sem erros.
- [ ] Banco criado no Supabase com as 5 tabelas, RLS ativado e políticas aplicadas.
- [ ] Login com e-mail e senha funciona localmente e no site publicado.
- [ ] Rotas protegidas redirecionam para o login quando não há sessão.
- [ ] Navegação funcionando no celular (barra inferior) e no desktop (barra lateral).
- [ ] A página de diagnóstico cria, lê e apaga um registro de teste com sucesso.
- [ ] Site publicado automaticamente a cada push na `main`.
- [ ] `CLAUDE.md` atualizado (Status e Decisões) e resumo da sessão entregue ao Guga.

## Fora do escopo hoje

Lógica de objetivos, pontuação, metas, journal, versículos, gráficos e PWA. Não antecipe nada disso.

---

## Etapa 0 — Pré-requisitos [GUGA] (~20 min)

### 0.1 Ferramentas locais
Confirme no terminal:
```bash
node -v   # precisa ser 20 ou superior
npm -v
git --version
```
Se o Node estiver abaixo de 20, instale a versão LTS em nodejs.org.

### 0.2 Repositório no GitHub
1. Crie um repositório chamado exatamente **`mast`** (o nome entra na URL e na configuração do Vite).
2. **Visibilidade:** o GitHub Pages gratuito exige repositório **público**. Isso expõe apenas o código, nunca seus dados (eles ficam protegidos no Supabase). Se quiser o repositório privado, é preciso GitHub Pro, que é gratuito para estudantes pelo GitHub Student Developer Pack (vale verificar com o e-mail do IBMEC).
3. Não marque a opção de criar README, `.gitignore` ou licença (o projeto será criado do zero).
4. Clone o repositório vazio e abra o Claude Code dentro da pasta:
   ```bash
   git clone https://github.com/<seu-usuario>/mast.git
   cd mast
   ```
5. Coloque o arquivo `CLAUDE.md` na raiz da pasta e este plano em `docs/plano-dia-1.md`.

### 0.3 Projeto no Supabase
1. No painel do Supabase, crie um novo projeto:
   - **Nome:** `mast`
   - **Região:** South America (São Paulo)
   - **Senha do banco:** gere uma forte e guarde no seu gerenciador de senhas. Ela não vai para o código.
2. Aguarde o provisionamento (1 a 2 minutos).
3. Em **Project Settings → API** (ou **API Keys**), anote:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **Chave pública:** a *publishable key* (`sb_publishable_...`) ou, se o painel mostrar, a *anon public key*. Qualquer uma das duas funciona.
   - **Nunca** copie a `service_role` / *secret key* para o projeto.

**Avise o Claude Code quando as etapas 0.1 a 0.3 estiverem concluídas.**

---

## Etapa 1 — Estrutura do projeto [CLAUDE CODE] (~15 min)

### 1.1 Criar o app
Dentro da pasta do repositório (que já contém `CLAUDE.md` e `docs/`):
```bash
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom @supabase/supabase-js
npm install -D vitest
```
Se o `create vite` reclamar da pasta não estar vazia, escolha a opção de ignorar os arquivos existentes e prosseguir (sem apagar `CLAUDE.md` nem `docs/`).

Não instale `date-fns`: as funções de data serão próprias (etapa 4), o que dispensa a dependência. Registre essa decisão no `CLAUDE.md`.

### 1.2 Limpeza do template
- Apague `src/App.css`, `src/assets/react.svg`, `public/vite.svg` e o conteúdo de exemplo do `App.tsx`.
- Substitua `src/index.css` pela estrutura de estilos da etapa 5.

### 1.3 Estrutura de pastas final
```
mast/
├── CLAUDE.md
├── docs/
│   └── plano-dia-1.md
├── .env.example
├── .env.local                 # criado pelo Guga, nunca commitado
├── .github/workflows/deploy.yml
├── index.html
├── public/
│   └── favicon.svg
├── supabase/
│   └── migrations/
│       └── 0001_init.sql
├── src/
│   ├── main.tsx
│   ├── App.tsx                # rotas
│   ├── vite-env.d.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── dates.ts
│   │   ├── dates.test.ts
│   │   └── types.ts
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   └── RequireAuth.tsx
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Nav.tsx
│   │   ├── PageHeader.tsx
│   │   └── icons.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Today.tsx
│   │   ├── Objectives.tsx
│   │   ├── Goals.tsx
│   │   ├── Journal.tsx
│   │   ├── Progress.tsx
│   │   └── Diagnostics.tsx    # temporária, removida na sexta
│   └── styles/
│       ├── tokens.css
│       └── global.css
└── vite.config.ts
```

### 1.4 Configuração do Vite
`vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/mast/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
```
Se o TypeScript reclamar da chave `test`, adicione `/// <reference types="vitest/config" />` no topo do arquivo.

Em `package.json`, adicione o script `"test": "vitest run"`.

### 1.5 Variáveis de ambiente
`.env.example` (commitado):
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=cole-aqui-a-chave-publica
```
Confirme que `.gitignore` cobre `*.local` (o template do Vite já faz isso). Se não cobrir, adicione `.env.local`.

**[GUGA]** Crie o arquivo `.env.local` na raiz, copiando o formato do `.env.example`, com a URL e a chave pública anotadas na etapa 0.3. Faça isso você mesmo, no editor, sem colar as chaves no chat.

`src/vite-env.d.ts`:
```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

**Commit:** `chore: scaffold vite react-ts project`

---

## Etapa 2 — Banco de dados [CLAUDE CODE escreve, GUGA executa] (~20 min)

### 2.1 Migração
Crie `supabase/migrations/0001_init.sql` com exatamente o conteúdo abaixo:

```sql
-- =========================================================
-- Mast — 0001_init.sql
-- Schema inicial + Row Level Security
-- =========================================================

-- ---------- Função utilitária: data local de São Paulo ----------
create or replace function public.today_sp()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'America/Sao_Paulo')::date;
$$;

-- ---------- Função utilitária: updated_at automático ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- objectives: objetivos positivos e hábitos negativos
-- =========================================================
create table public.objectives (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 120),
  polarity    text not null check (polarity in ('positive', 'negative')),
  weight      smallint not null check (weight in (10, 20, 30)),
  schedule    text not null check (schedule in ('once', 'daily', 'weekdays')),
  weekdays    smallint[],
  once_date   date,
  starts_on   date not null default public.today_sp(),
  archived_at timestamptz,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  constraint objectives_schedule_fields check (
    (schedule = 'once'     and once_date is not null and weekdays is null)
    or
    (schedule = 'daily'    and once_date is null and weekdays is null)
    or
    (schedule = 'weekdays' and once_date is null and weekdays is not null
       and cardinality(weekdays) between 1 and 7
       and weekdays <@ array[0,1,2,3,4,5,6]::smallint[])
  )
);

create index objectives_user_active_idx
  on public.objectives (user_id)
  where archived_at is null;

-- =========================================================
-- objective_logs: existência = positivo feito / negativo ocorrido
-- =========================================================
create table public.objective_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  objective_id uuid not null references public.objectives (id) on delete cascade,
  log_date     date not null,
  created_at   timestamptz not null default now(),
  constraint objective_logs_unique_per_day unique (objective_id, log_date)
);

create index objective_logs_user_date_idx
  on public.objective_logs (user_id, log_date);

-- =========================================================
-- goals: metas de longo prazo
-- =========================================================
create table public.goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 120),
  why           text check (why is null or char_length(why) <= 500),
  due_date      date,
  progress_type text not null check (progress_type in ('numeric', 'percent')),
  current_value numeric not null default 0 check (current_value >= 0),
  target_value  numeric,
  unit          text check (unit is null or char_length(unit) <= 30),
  status        text not null default 'active' check (status in ('active', 'done', 'archived')),
  created_at    timestamptz not null default now(),
  constraint goals_progress_fields check (
    (progress_type = 'numeric' and target_value is not null and target_value > 0)
    or
    (progress_type = 'percent' and current_value <= 100)
  )
);

create index goals_user_idx on public.goals (user_id);

-- =========================================================
-- journal_entries: journal livre
-- =========================================================
create table public.journal_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  entry_date date not null default public.today_sp(),
  title      text check (title is null or char_length(title) <= 120),
  body       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journal_entries_user_date_idx
  on public.journal_entries (user_id, entry_date desc);

create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

-- =========================================================
-- verses: versículo do dia (conteúdo global, somente leitura)
-- =========================================================
create table public.verses (
  id         serial primary key,
  position   int not null unique check (position >= 1),
  reference  text not null,
  text       text not null,
  reflection text not null,
  question   text not null,
  theme      text
);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.objectives      enable row level security;
alter table public.objective_logs  enable row level security;
alter table public.goals           enable row level security;
alter table public.journal_entries enable row level security;
alter table public.verses          enable row level security;

-- ---------- objectives ----------
create policy objectives_select_own on public.objectives
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy objectives_insert_own on public.objectives
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy objectives_update_own on public.objectives
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy objectives_delete_own on public.objectives
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------- objective_logs ----------
-- Na inserção, além do dono, o objetivo referenciado precisa ser do mesmo usuário.
create policy objective_logs_select_own on public.objective_logs
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy objective_logs_insert_own on public.objective_logs
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.objectives o
      where o.id = objective_id
        and o.user_id = (select auth.uid())
    )
  );

create policy objective_logs_delete_own on public.objective_logs
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- (sem update: um log é criado ou apagado, nunca editado)

-- ---------- goals ----------
create policy goals_select_own on public.goals
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy goals_insert_own on public.goals
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy goals_update_own on public.goals
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy goals_delete_own on public.goals
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------- journal_entries ----------
create policy journal_select_own on public.journal_entries
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy journal_insert_own on public.journal_entries
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy journal_update_own on public.journal_entries
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy journal_delete_own on public.journal_entries
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------- verses ----------
-- Leitura para qualquer usuário logado. Nenhuma política de escrita:
-- o conteúdo é inserido apenas pelo SQL Editor.
create policy verses_select_authenticated on public.verses
  for select to authenticated
  using (true);
```

### 2.2 Executar [GUGA]
1. No Supabase, abra **SQL Editor → New query**.
2. Cole todo o conteúdo de `supabase/migrations/0001_init.sql` e clique em **Run**.
3. Deve aparecer "Success. No rows returned". Se der erro, copie a mensagem completa para o Claude Code.

### 2.3 Verificar [GUGA]
Rode no SQL Editor e confira o resultado:

```sql
-- Deve listar as 5 tabelas, todas com rowsecurity = true
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- Deve listar 16 políticas
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, cmd;
```

Esperado na segunda consulta: 4 em `goals`, 4 em `journal_entries`, 3 em `objective_logs`, 4 em `objectives`, 1 em `verses`.

Abra também **Advisors → Security Advisor** no painel. Não deve haver alertas sobre tabelas sem RLS.

### 2.4 Tipos no front-end [CLAUDE CODE]
`src/lib/types.ts`, espelhando o schema:
```ts
export type Polarity = 'positive' | 'negative'
export type Weight = 10 | 20 | 30
export type Schedule = 'once' | 'daily' | 'weekdays'

export interface Objective {
  id: string
  user_id: string
  title: string
  polarity: Polarity
  weight: Weight
  schedule: Schedule
  weekdays: number[] | null
  once_date: string | null      // 'YYYY-MM-DD'
  starts_on: string             // 'YYYY-MM-DD'
  archived_at: string | null
  sort_order: number
  created_at: string
}

export interface ObjectiveLog {
  id: string
  user_id: string
  objective_id: string
  log_date: string              // 'YYYY-MM-DD'
  created_at: string
}

export type GoalStatus = 'active' | 'done' | 'archived'
export type ProgressType = 'numeric' | 'percent'

export interface Goal {
  id: string
  user_id: string
  title: string
  why: string | null
  due_date: string | null
  progress_type: ProgressType
  current_value: number
  target_value: number | null
  unit: string | null
  status: GoalStatus
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  entry_date: string
  title: string | null
  body: string
  created_at: string
  updated_at: string
}

export interface Verse {
  id: number
  position: number
  reference: string
  text: string
  reflection: string
  question: string
  theme: string | null
}
```

**Commit:** `feat(db): initial schema with row level security`

---

## Etapa 3 — Conta do Guga e configuração de login [GUGA] (~5 min)

O app não terá tela de cadastro. A única conta é criada pelo painel.

1. **Authentication → Users → Add user → Create new user.** Informe seu e-mail e uma senha forte, e marque **Auto Confirm User**.
2. **Authentication → Sign In / Providers** (ou **Providers → Email**): confirme que o login por e-mail está ativado e **desative "Allow new users to sign up"**. Assim ninguém mais consegue criar conta, mesmo tendo a URL.
3. **Authentication → URL Configuration:**
   - **Site URL:** `https://<seu-usuario>.github.io/mast/`
   - **Redirect URLs:** adicione `https://<seu-usuario>.github.io/mast/**` e `http://localhost:5173/**`

---

## Etapa 4 — Cliente Supabase, datas e autenticação [CLAUDE CODE] (~40 min)

### 4.1 Cliente
`src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error(
    'Configuração ausente: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local',
  )
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // HashRouter: evita conflito com o '#' da rota
  },
})
```

### 4.2 Funções de data
Regra do projeto: o "dia" é sempre a data local de São Paulo, representada como string `'YYYY-MM-DD'`. Nunca use `new Date().toISOString()` para obter "hoje" (retorna UTC e erra o dia entre 21h e meia-noite).

`src/lib/dates.ts`:
```ts
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
```

`src/lib/dates.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { addDays, dayOfYear, greeting, todayISO, weekday, formatLong } from './dates'

describe('dates', () => {
  it('todayISO usa o fuso de São Paulo, não UTC', () => {
    // 02:30 UTC de 7/10 = 23:30 de 6/10 em São Paulo
    expect(todayISO(new Date('2026-10-07T02:30:00Z'))).toBe('2026-10-06')
    // 03:30 UTC de 7/10 = 00:30 de 7/10 em São Paulo
    expect(todayISO(new Date('2026-10-07T03:30:00Z'))).toBe('2026-10-07')
  })

  it('weekday segue 0=domingo', () => {
    expect(weekday('2026-10-04')).toBe(0) // domingo
    expect(weekday('2026-10-06')).toBe(2) // terça
    expect(weekday('2026-10-10')).toBe(6) // sábado
  })

  it('dayOfYear', () => {
    expect(dayOfYear('2026-01-01')).toBe(1)
    expect(dayOfYear('2026-12-31')).toBe(365)
    expect(dayOfYear('2028-12-31')).toBe(366) // ano bissexto
  })

  it('addDays atravessa mês e ano', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('formatLong em português', () => {
    expect(formatLong('2026-10-06')).toBe('terça-feira, 6 de outubro')
  })

  it('greeting por faixa de horário em São Paulo', () => {
    expect(greeting(new Date('2026-10-06T10:00:00Z'))).toBe('Bom dia')   // 07h SP
    expect(greeting(new Date('2026-10-06T17:00:00Z'))).toBe('Boa tarde') // 14h SP
    expect(greeting(new Date('2026-10-06T23:00:00Z'))).toBe('Boa noite') // 20h SP
  })
})
```

Rode `npm test`. Todos os testes devem passar antes de seguir.

**Commit:** `feat: date helpers pinned to Sao Paulo timezone`

### 4.3 AuthProvider
`src/auth/AuthProvider.tsx`:
- Contexto React com `{ session, user, loading, signIn(email, password), signOut() }`.
- No mount: `supabase.auth.getSession()` para restaurar a sessão, e `supabase.auth.onAuthStateChange` para acompanhar mudanças. Limpar a inscrição no unmount.
- `loading` fica `true` até a primeira resposta do `getSession`, para evitar redirecionar ao login por engano enquanto a sessão carrega.
- `signIn` chama `supabase.auth.signInWithPassword` e retorna o erro (sem lançar exceção).
- Exportar um hook `useAuth()` que lança erro se usado fora do provider.

### 4.4 RequireAuth
`src/auth/RequireAuth.tsx`:
- Enquanto `loading`: mostrar uma tela de carregamento simples (fundo `--bg`, logo do Mast centralizado, sem spinner chamativo).
- Sem sessão: `<Navigate to="/login" replace state={{ from: location }} />`.
- Com sessão: renderiza `<Outlet />`.

### 4.5 Tela de login
`src/pages/Login.tsx`:
- Se já houver sessão, redirecionar para `/` (ou para a rota de origem em `state.from`).
- Layout: fundo `--bg`, card branco centralizado (largura máxima de 400px), logo e nome "Mast" no topo, subtítulo "Disciplina é escolher antes." em `--muted`.
- Campos: `E-mail` (`type="email"`, `autoComplete="email"`) e `Senha` (`type="password"`, `autoComplete="current-password"`), cada um com `<label>` visível.
- Botão "Entrar" de largura total, fundo `--ink`, texto branco, altura de 48px. Durante o envio: desabilitado, com o texto "Entrando…".
- Erros em português, abaixo do botão, em `--negative`:
  - credenciais inválidas → "E-mail ou senha incorretos."
  - falha de rede → "Sem conexão. Tente novamente."
  - qualquer outro → "Não foi possível entrar. Tente novamente."
- Sem link de cadastro e sem "esqueci a senha" (a senha pode ser redefinida pelo painel do Supabase).
- Enter no campo de senha envia o formulário (use `<form onSubmit>`).

**Commit:** `feat: supabase client, auth provider and login`

---

## Etapa 5 — Estilos, layout e navegação [CLAUDE CODE] (~45 min)

### 5.1 index.html
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/mast/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#EEF0EC" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;600&family=Space+Grotesk:wght@500;600;700&display=swap"
      rel="stylesheet"
    />
    <title>Mast</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```
Se o caminho do favicon não resolver com o `base`, use `%BASE_URL%favicon.svg`.

### 5.2 Favicon / logo
`public/favicon.svg` (mastro com vela, sobre o verde do app):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#1E6B47"/>
  <path d="M30 12 V52" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
  <path d="M34 16 L50 44 H34 Z" fill="#FFFFFF"/>
  <path d="M16 52 H48" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
</svg>
```
Crie também um componente `Logo` em `components/icons.tsx` com o mesmo desenho, para usar no login e na barra lateral.

### 5.3 Tokens
`src/styles/tokens.css`:
```css
:root {
  /* cores */
  --bg: #EEF0EC;
  --surface: #FFFFFF;
  --surface-2: #F7F8F6;
  --ink: #121614;
  --ink-2: #232A26;
  --muted: #5A635E;
  --muted-on-ink: #A9B3AD;
  --line: #DCE0DB;
  --line-soft: #EDF0EC;
  --accent: #1E6B47;
  --accent-bright: #7FD1A3;
  --streak: #A04D0C;
  --negative: #B3261E;

  /* tipografia */
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* espaçamento (escala de 4px) */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px;
  --s-5: 20px; --s-6: 24px; --s-8: 32px; --s-10: 40px; --s-12: 48px;

  /* raios */
  --r-sm: 10px;
  --r-md: 12px;
  --r-lg: 18px;

  /* layout */
  --sidebar-w: 232px;
  --bottom-nav-h: 64px;
  --content-max: 1180px;
  --touch: 44px;
}
```

### 5.4 Global
`src/styles/global.css` (importar `tokens.css` primeiro):
- Reset leve: `box-sizing: border-box` em tudo, `margin: 0` em `body`, `h1–h4`, `p`.
- `body`: `background: var(--bg)`, `color: var(--ink)`, `font-family: var(--font-body)`, `font-size: 15px`, `line-height: 1.5`, `-webkit-font-smoothing: antialiased`.
- `h1`, `h2`: `font-family: var(--font-display)`, `letter-spacing: -0.02em`.
- `button`, `input`, `textarea`: herdar a fonte.
- Foco visível: `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`.
- Classes utilitárias mínimas:
  - `.card`: fundo `--surface`, borda `1px solid var(--line)`, raio `--r-lg`, padding `--s-6`.
  - `.btn`: altura mínima `--touch`, padding horizontal `--s-4`, raio `--r-sm`, peso 600, cursor pointer.
  - `.btn-primary`: fundo `--ink`, texto branco, sem borda.
  - `.btn-ghost`: fundo transparente, borda `1px solid var(--line)`.
  - `.field`: label 13px `--muted`; input com altura 48px, raio `--r-sm`, borda `--line`, fundo `--surface-2`.
  - `.mono`: `font-family: var(--font-mono)`.

### 5.5 Rotas
`src/App.tsx` com `HashRouter`:

| Caminho | Página | Protegida |
|---|---|---|
| `/login` | Login | não |
| `/` | Today ("Hoje") | sim |
| `/objetivos` | Objectives | sim |
| `/metas` | Goals | sim |
| `/journal` | Journal | sim |
| `/progresso` | Progress | sim |
| `/diagnostico` | Diagnostics | sim, sem item no menu |
| `*` | redireciona para `/` | — |

Estrutura: `<AuthProvider>` → `<HashRouter>` → rota `/login` solta; demais rotas dentro de `<RequireAuth>` → `<Layout>`.

### 5.6 Layout e navegação
`src/components/Layout.tsx` + `Nav.tsx`:

**Desktop (largura ≥ 900px):**
- Barra lateral fixa à esquerda com largura `--sidebar-w`, fundo `--ink`, texto `#E9ECE8`.
- Topo: logo e "Mast" (Space Grotesk 700, 20px).
- Itens de navegação com ícone e texto, altura mínima 44px, raio `--r-sm`. Item ativo: fundo `--ink-2`, texto branco, peso 600. Inativo: `--muted-on-ink`.
- Rodapé da barra: e-mail do usuário (13px, `--muted-on-ink`, com reticências se for longo) e botão "Sair".
- Conteúdo: `margin-left: var(--sidebar-w)`, padding `40px 48px`, largura máxima `--content-max`.

**Celular (< 900px):**
- Barra inferior fixa, altura `--bottom-nav-h` mais `env(safe-area-inset-bottom)`, fundo `--surface`, borda superior `--line`.
- 5 itens iguais (ícone 22px e rótulo 11px). Ativo: `--ink` com peso 600. Inativo: `--muted`.
- Conteúdo com padding `24px 20px` e `padding-bottom: calc(var(--bottom-nav-h) + env(safe-area-inset-bottom) + 24px)`, para nada ficar escondido atrás da barra.
- O botão "Sair" no celular fica no topo da tela Hoje, como um botão discreto de texto à direita do cabeçalho.

**Itens (ordem fixa):** Hoje (sol), Objetivos (check), Metas (alvo), Journal (folha com linhas), Progresso (gráfico de barras).

Use `NavLink` do React Router para o estado ativo e `aria-current="page"` no item ativo. Os ícones são SVG inline de traço (`stroke="currentColor"`, `stroke-width="2"`, sem preenchimento), definidos em `components/icons.tsx`. Sem emoji e sem biblioteca de ícones.

### 5.7 Páginas provisórias
`components/PageHeader.tsx`: recebe `eyebrow` (texto pequeno em caixa alta, `--muted`, 12–13px, espaçamento 0.08em), `title` (h1, 32px no celular / 40px no desktop) e `subtitle` (opcional).

- **Hoje:** eyebrow = data longa (`formatLong(todayISO())`, com a primeira letra maiúscula); title = `${greeting()}, Guga.`; subtitle = "Sua base está pronta. As funcionalidades chegam na quinta." Abaixo, um card escuro (fundo `--ink`) com o texto "Pontuação do dia" e "—" em mono grande, apenas para validar o visual.
- **Objetivos / Metas / Journal / Progresso:** PageHeader com o título correspondente e um card vazio com o texto "Em construção".

**Commit:** `feat: layout, navigation and placeholder pages`

---

## Etapa 6 — Página de diagnóstico [CLAUDE CODE] (~20 min)

Página temporária em `/#/diagnostico` para provar que o banco e o RLS funcionam do jeito que o app vai usar. Será removida na sexta.

Ela mostra uma lista de verificações, cada uma com status (aguardando / ok / erro) e a mensagem de erro, se houver, e um botão "Rodar testes". Sequência, executada ao clicar:

1. **Sessão:** existe `user.id`.
2. **Leitura:** `select` em `objectives`, `goals`, `journal_entries` e `verses` (`limit 1`) sem erro.
3. **Inserção:** cria em `objectives` o registro `{ title: '[teste] diagnóstico', polarity: 'positive', weight: 10, schedule: 'once', once_date: todayISO() }`. Confirma que o retorno veio com `user_id` igual ao do usuário logado (prova que o `default auth.uid()` funciona).
4. **Log:** insere em `objective_logs` um registro para esse objetivo na data de hoje. Depois, tenta inserir de novo e confirma que **falha** (restrição de unicidade).
5. **Restrição de dados:** tenta inserir um objetivo com `weight: 15` e confirma que **falha**.
6. **Limpeza:** apaga o objetivo de teste e confirma que o log foi apagado junto (`on delete cascade`).
7. **Fuso:** exibe `todayISO()`, `formatLong(todayISO())` e `dayOfYear(todayISO())` para conferência visual.

Se algum teste falhar no meio, a limpeza deve rodar mesmo assim (use `try/finally`).

**Commit:** `feat: temporary diagnostics page`

---

## Etapa 7 — Teste local [CLAUDE CODE + GUGA] (~10 min)

```bash
npm run dev
```
Abra `http://localhost:5173/mast/` e verifique:

- [ ] Sem login, qualquer rota leva para `/login`.
- [ ] Senha errada mostra "E-mail ou senha incorretos."
- [ ] Login correto leva para Hoje, com saudação e data corretas.
- [ ] Recarregar a página mantém a sessão.
- [ ] Os 5 itens do menu navegam e o item ativo fica destacado.
- [ ] Reduzindo a janela abaixo de 900px, a barra lateral vira barra inferior.
- [ ] `/#/diagnostico` → "Rodar testes" → todos os itens ok.
- [ ] "Sair" volta para o login.

Depois rode `npm run lint`, `npm test` e `npm run build`. Corrija tudo antes de seguir.

---

## Etapa 8 — Deploy no GitHub Pages [CLAUDE CODE + GUGA] (~20 min)

### 8.1 Workflow [CLAUDE CODE]
`.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm test
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```
Se houver versões major mais novas dessas actions, use-as.

### 8.2 Configuração no GitHub [GUGA]
1. **Settings → Pages → Build and deployment → Source:** selecione **GitHub Actions**.
2. **Settings → Secrets and variables → Actions → New repository secret:** crie dois secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   Use os mesmos valores do `.env.local`.

### 8.3 Publicar [CLAUDE CODE]
**Commit:** `ci: github pages deploy workflow`

```bash
git push origin main
```
Acompanhe a execução em **Actions** no GitHub. Ao terminar, o site fica em `https://<usuario>.github.io/mast/`.

### 8.4 Teste em produção [GUGA]
No celular e no computador:
- [ ] O site abre sem tela branca.
- [ ] O login funciona.
- [ ] A navegação inferior aparece corretamente no celular e não fica atrás da barra do sistema.
- [ ] `/#/diagnostico` passa em todos os testes no site publicado.

---

## Etapa 9 — Encerramento [CLAUDE CODE] (~5 min)

### 9.1 Atualizar o CLAUDE.md
- Em **Status**, marque "Ter 6/10 — preparação" e "Qua 7/10 — fundação" como concluídos (ou indique o que ficou pendente).
- Na seção 3 (Stack), troque "date-fns" por "funções próprias em `src/lib/dates.ts` (Intl API)".
- Em **Decisões**, adicione:
  - Sem `date-fns`: datas com `Intl` e strings `'YYYY-MM-DD'`, fuso de São Paulo.
  - Conta única criada pelo painel do Supabase; novos cadastros desativados; o app não tem tela de cadastro.
  - Página `/diagnostico` temporária, a remover na sexta.
  - Qualquer outra decisão tomada durante a sessão.

**Commit:** `docs: update status after day 1`

### 9.2 Resumo para o Guga
Entregue ao Guga, no chat, um resumo neste formato, para ele repassar ao planejamento:

```
## Resumo — Dia 1
**Concluído:** …
**Pendente / não concluído:** …
**Problemas encontrados e como foram resolvidos:** …
**Decisões tomadas fora do plano:** …
**URL publicada:** …
**Observações para o Dia 2:** …
```

---

## Solução de problemas

| Sintoma | Causa provável | Correção |
|---|---|---|
| Tela branca no GitHub Pages; erros 404 de arquivos `.js` | `base` errado no Vite | Confirmar `base: '/mast/'` e que o repositório se chama `mast` |
| Funciona local, falha publicado com "Configuração ausente" | Secrets não criados ou com nome errado | Revisar a etapa 8.2 e rodar o workflow de novo (**Actions → Run workflow**) |
| `Invalid API key` | Chave copiada errada ou é a `service_role` | Usar a chave pública (publishable/anon) |
| `new row violates row-level security policy` | Insert enviando `user_id` diferente ou sem sessão | Não enviar `user_id` no insert (o default preenche); confirmar sessão ativa |
| Login dá "Email not confirmed" | Usuário criado sem auto confirmação | Authentication → Users → confirmar o usuário |
| Data de "hoje" errada à noite | Uso de `toISOString()` para obter hoje | Usar sempre `todayISO()` |
| Erro no SQL "relation already exists" | Migração rodada duas vezes | Nada a fazer se a verificação 2.3 passar; senão, pedir ao Claude Code um script de reset |

---

## Tempo estimado

| Etapa | Tempo |
|---|---|
| 0. Pré-requisitos | 20 min |
| 1. Estrutura | 15 min |
| 2. Banco | 20 min |
| 3. Conta e login | 5 min |
| 4. Cliente, datas e auth | 40 min |
| 5. Layout e navegação | 45 min |
| 6. Diagnóstico | 20 min |
| 7. Teste local | 10 min |
| 8. Deploy | 20 min |
| 9. Encerramento | 5 min |
| **Total** | **~3h20** |

A maior parte do tempo é do Claude Code. O tempo ativo do Guga é de cerca de 1 hora, concentrado nas etapas 0, 2.2–2.3, 3, 8.2 e nos testes.
