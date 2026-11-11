-- 0010: datos extra del aviso (mensaje y días), pasos a seguir (R6) y datos extra del contacto.
-- No modifica tablas existentes. RLS activado en las tres tablas nuevas.

-- Datos extra del aviso: un registro por aviso.
create table if not exists public.notice_extras (
  notice_id uuid primary key references public.notices (id) on delete cascade,
  issuer_id uuid not null references public.profiles (id) on delete cascade,
  message text check (message is null or char_length(message) <= 300),
  weekdays smallint[] check (weekdays is null or weekdays <@ array[0,1,2,3,4,5,6]::smallint[]),
  updated_at timestamptz not null default now()
);

-- Pasos a seguir ante una alerta (R6): hasta 10, cada uno de 1 a 200 caracteres.
create table if not exists public.notice_steps (
  id uuid primary key default gen_random_uuid(),
  notice_id uuid not null references public.notices (id) on delete cascade,
  issuer_id uuid not null references public.profiles (id) on delete cascade,
  position smallint not null check (position between 1 and 10),
  body text not null check (char_length(body) between 1 and 200),
  unique (notice_id, position)
);

-- Datos extra del contacto.
create table if not exists public.contact_details (
  contact_id uuid primary key references public.contacts (id) on delete cascade,
  issuer_id uuid not null references public.profiles (id) on delete cascade,
  relationship text check (relationship is null or char_length(relationship) <= 40),
  invite_sent_at timestamptz
);

-- Triggers: el issuer_id tiene que ser el dueño real del aviso o del contacto.
create or replace function public.check_notice_extras_owner()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  n_issuer uuid;
  n_kind text;
  n_recurrence text;
begin
  select issuer_id, kind, recurrence into n_issuer, n_kind, n_recurrence
  from public.notices where id = new.notice_id;
  if n_issuer is distinct from new.issuer_id then
    raise exception 'El aviso no pertenece a esta persona';
  end if;
  if new.weekdays is not null and n_recurrence <> 'weekly' then
    raise exception 'Los días solo aplican a avisos semanales';
  end if;
  return new;
end;
$$;

drop trigger if exists notice_extras_owner on public.notice_extras;
create trigger notice_extras_owner
  before insert or update on public.notice_extras
  for each row execute function public.check_notice_extras_owner();

create or replace function public.check_notice_steps_owner()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.notices where id = new.notice_id and issuer_id = new.issuer_id
  ) then
    raise exception 'El aviso no pertenece a esta persona';
  end if;
  return new;
end;
$$;

drop trigger if exists notice_steps_owner on public.notice_steps;
create trigger notice_steps_owner
  before insert or update on public.notice_steps
  for each row execute function public.check_notice_steps_owner();

create or replace function public.check_contact_details_owner()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.contacts where id = new.contact_id and issuer_id = new.issuer_id
  ) then
    raise exception 'El contacto no pertenece a esta persona';
  end if;
  return new;
end;
$$;

drop trigger if exists contact_details_owner on public.contact_details;
create trigger contact_details_owner
  before insert or update on public.contact_details
  for each row execute function public.check_contact_details_owner();

-- RLS: select, insert, update y delete solo para quien emite.
alter table public.notice_extras enable row level security;
alter table public.notice_steps enable row level security;
alter table public.contact_details enable row level security;

create policy "notice_extras_select_own" on public.notice_extras for select using (auth.uid() = issuer_id);
create policy "notice_extras_insert_own" on public.notice_extras for insert with check (auth.uid() = issuer_id);
create policy "notice_extras_update_own" on public.notice_extras for update using (auth.uid() = issuer_id) with check (auth.uid() = issuer_id);
create policy "notice_extras_delete_own" on public.notice_extras for delete using (auth.uid() = issuer_id);

create policy "notice_steps_select_own" on public.notice_steps for select using (auth.uid() = issuer_id);
create policy "notice_steps_insert_own" on public.notice_steps for insert with check (auth.uid() = issuer_id);
create policy "notice_steps_update_own" on public.notice_steps for update using (auth.uid() = issuer_id) with check (auth.uid() = issuer_id);
create policy "notice_steps_delete_own" on public.notice_steps for delete using (auth.uid() = issuer_id);

create policy "contact_details_select_own" on public.contact_details for select using (auth.uid() = issuer_id);
create policy "contact_details_insert_own" on public.contact_details for insert with check (auth.uid() = issuer_id);
create policy "contact_details_update_own" on public.contact_details for update using (auth.uid() = issuer_id) with check (auth.uid() = issuer_id);
create policy "contact_details_delete_own" on public.contact_details for delete using (auth.uid() = issuer_id);

-- Pasos para quien recibe (R6). Valida que el token pertenezca a un contacto de esa alerta.
-- El token se compara por su hash SHA-256 en hexadecimal (alert_recipients.token_hash).
create or replace function public.get_alert_steps(p_alert_id uuid, p_token text)
returns table (step_position smallint, step_body text)
language sql
stable
security definer set search_path = ''
as $$
  select s.position, s.body
  from public.alerts a
  join public.alert_recipients r on r.alert_id = a.id
  join public.notice_steps s on s.notice_id = a.notice_id
  where a.id = p_alert_id
    and r.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  order by s.position;
$$;

grant execute on function public.get_alert_steps(uuid, text) to anon, authenticated;
