-- 0017: la baja de un contacto pasa a confirmarse con un enlace por correo, sin código de seis dígitos
-- (hallazgo del test con usuarios: el código frenaba a quien intentaba dejar de ser contacto).
-- El enlace opaco sigue siendo el secreto. Abrir la página no ejecuta nada: la baja la confirma
-- una acción deliberada en pantalla (mantener 2 s), que llama a confirm_contact_removal_by_link.
-- Las columnas code_hash / code_sent_at / code_attempts se conservan sin tocar; code_sent_at
-- se sigue usando solo para espaciar los envíos de correo.

-- La lectura pública ahora también trata un enlace vencido como inactivo.
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
      when c.status <> 'accepted' or r.expires_at < now() then 'inactive'
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

-- Confirma la baja de forma atómica a partir del enlace. Mismo efecto que la función anterior,
-- sin verificar código.
create or replace function public.confirm_contact_removal_by_link(
  p_token text,
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
  if c.status <> 'accepted' or r.expires_at < now() then
    return query select 'expired'::text, c.issuer_id, v_issuer_name, c.name, v_message_ids;
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

revoke all on function public.confirm_contact_removal_by_link(text, boolean) from public;
grant execute on function public.confirm_contact_removal_by_link(text, boolean) to anon, authenticated;

-- La función con código ya no se usa: se retira para no dejar abierta una vía de confirmación vieja.
drop function if exists public.confirm_contact_removal(text, text, boolean);
