-- =========================================================
-- Mast — 0002_lineage.sql
-- Linhagem de objetivos + substituição atômica de versão
-- =========================================================

-- ---------- Coluna de linhagem ----------
alter table public.objectives add column lineage_id uuid;

update public.objectives
set lineage_id = id
where lineage_id is null;

alter table public.objectives
  alter column lineage_id set default gen_random_uuid(),
  alter column lineage_id set not null;

create index objectives_user_lineage_idx
  on public.objectives (user_id, lineage_id);

-- ---------- Substituir a versão de um objetivo ----------
-- Arquiva a versão atual e cria uma nova na mesma linhagem, começando hoje.
-- Roda com as permissões do usuário (security invoker): o RLS continua valendo.
create or replace function public.replace_objective(
  p_old_id    uuid,
  p_title     text,
  p_weight    smallint,
  p_schedule  text,
  p_weekdays  smallint[],
  p_once_date date
)
returns public.objectives
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_old   public.objectives;
  v_new   public.objectives;
  v_today date := public.today_sp();
begin
  select * into v_old
  from public.objectives
  where id = p_old_id
    and archived_at is null
  for update;

  if not found then
    raise exception 'objective % not found or already archived', p_old_id;
  end if;

  update public.objectives
  set archived_at = now()
  where id = p_old_id;

  insert into public.objectives
    (title, polarity, weight, schedule, weekdays, once_date, starts_on, lineage_id, sort_order)
  values
    (p_title, v_old.polarity, p_weight, p_schedule, p_weekdays, p_once_date, v_today, v_old.lineage_id, v_old.sort_order)
  returning * into v_new;

  -- O registro de hoje, se existir, passa para a nova versão.
  -- (objective_logs não tem política de update: move-se com insert + delete.)
  if exists (
    select 1 from public.objective_logs
    where objective_id = p_old_id and log_date = v_today
  ) then
    insert into public.objective_logs (objective_id, log_date)
    values (v_new.id, v_today);

    delete from public.objective_logs
    where objective_id = p_old_id and log_date = v_today;
  end if;

  return v_new;
end;
$$;

revoke execute on function public.replace_objective(uuid, text, smallint, text, smallint[], date) from public, anon;
grant  execute on function public.replace_objective(uuid, text, smallint, text, smallint[], date) to authenticated;
