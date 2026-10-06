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
