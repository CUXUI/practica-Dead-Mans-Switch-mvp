-- 0016: baja pública de un contacto mediante enlace opaco + código de seis dígitos.
-- La página pública solo usa estas funciones; nunca consulta las tablas directamente.

alter table public.contact_removals
  alter column code_hash drop not null;

alter table public.contact_removals
  add column if not exists request_token_hash text,
  add column if not exists code_sent_at timestamptz,
  add column if not exists code_attempts smallint not null default 0
    check (code_attempts between 0 and 5);

create unique index if not exists contact_removals_request_token_unique
  on public.contact_removals (request_token_hash)
  where request_token_hash is not null;

create index if not exists contact_removals_contact_idx
  on public.contact_removals (contact_id, created_at desc);

-- Devuelve únicamente lo necesario para pintar la página pública.
create or replace function public.get_contact_removal(p_token text)
returns table (
  issuer_name text,
  contact_email_masked text,
  removal_state text,
  has_open_alert boolean
)
language sql
security definer set search_path = ''
as $$
  select
    coalesce(nullif(trim(p.full_name), ''), 'Esta persona') as issuer_name,
    case
      when position('@' in c.email) > 2
        then left(c.email, 1) || repeat('•', greatest(position('@' in c.email) - 2, 3)) || substring(c.email from position('@' in c.email))
      else '•••@correo.com'
    end as contact_email_masked,
    case
      when r.confirmed_at is not null or c.status in ('rejected', 'removed') then 'confirmed'
      when c.status <> 'accepted' then 'inactive'
      else 'ready'
    end as removal_state,
    exists (
      select 1 from public.alerts a
      where a.issuer_id = c.issuer_id and a.outcome = 'open'
    ) as has_open_alert
  from public.contact_removals r
  join public.contacts c on c.id = r.contact_id
  join public.profiles p on p.id = c.issuer_id
  where r.request_token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  order by r.created_at desc
  limit 1;
$$;

-- Confirma la baja de forma atómica. El hash combina token + código para que los seis
-- dígitos no puedan probarse sin conocer también el token opaco del enlace.
create or replace function public.confirm_contact_removal(
  p_token text,
  p_code text,
  p_force boolean default false
)
returns table (
  result text,
  issuer_id uuid,
  issuer_name text,
  contact_name text,
  qstash_message_ids text[]
)
language plpgsql
security definer set search_path = ''
as $$
declare
  r public.contact_removals%rowtype;
  c public.contacts%rowtype;
  v_issuer_name text;
  v_has_open_alert boolean;
  v_message_ids text[] := array[]::text[];
begin
  select * into r
  from public.contact_removals cr
  where cr.request_token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  order by cr.created_at desc
  limit 1
  for update;

  if r.id is null then
    return query select 'inactive'::text, null::uuid, null::text, null::text, v_message_ids;
    return;
  end if;

  select * into c from public.contacts where id = r.contact_id for update;
  select coalesce(nullif(trim(p.full_name), ''), 'Una persona') into v_issuer_name
  from public.profiles p where p.id = c.issuer_id;

  if r.confirmed_at is not null or c.status in ('rejected', 'removed') then
    return query select 'already_confirmed'::text, c.issuer_id, v_issuer_name, c.name, v_message_ids;
    return;
  end if;
  if c.status <> 'accepted' or r.code_hash is null or r.expires_at < now() or r.code_attempts >= 5 then
    return query select 'expired'::text, c.issuer_id, v_issuer_name, c.name, v_message_ids;
    return;
  end if;

  if r.code_hash <> encode(extensions.digest(p_token || ':' || p_code, 'sha256'), 'hex') then
    update public.contact_removals
      set code_attempts = least(code_attempts + 1, 5)
      where id = r.id;
    return query select 'invalid_code'::text, c.issuer_id, v_issuer_name, c.name, v_message_ids;
    return;
  end if;

  select exists (
    select 1 from public.alerts a
    where a.issuer_id = c.issuer_id and a.outcome = 'open'
  ) into v_has_open_alert;
  if v_has_open_alert and not p_force then
    return query select 'alert_open'::text, c.issuer_id, v_issuer_name, c.name, v_message_ids;
    return;
  end if;

  update public.contacts
    set status = 'rejected', removed_at = now(), invite_token_hash = null
    where id = c.id;

  delete from public.notice_contacts where contact_id = c.id;

  select coalesce(array_agg(n.qstash_message_id) filter (where n.qstash_message_id is not null), array[]::text[])
    into v_message_ids
  from public.notices n
  where n.issuer_id = c.issuer_id
    and n.state = 'active'
    and not exists (
      select 1
      from public.notice_contacts nc
      join public.contacts remaining on remaining.id = nc.contact_id
      where nc.notice_id = n.id and remaining.status = 'accepted'
    );

  update public.notices n
    set state = 'off', qstash_message_id = null, updated_at = now()
  where n.issuer_id = c.issuer_id
    and n.state = 'active'
    and not exists (
      select 1
      from public.notice_contacts nc
      join public.contacts remaining on remaining.id = nc.contact_id
      where nc.notice_id = n.id and remaining.status = 'accepted'
    );

  update public.contact_removals
    set confirmed_at = now()
    where id = r.id;

  return query select 'ok'::text, c.issuer_id, v_issuer_name, c.name, v_message_ids;
end;
$$;

revoke all on function public.get_contact_removal(text) from public;
revoke all on function public.confirm_contact_removal(text, text, boolean) from public;
grant execute on function public.get_contact_removal(text) to anon, authenticated;
grant execute on function public.confirm_contact_removal(text, text, boolean) to anon, authenticated;
