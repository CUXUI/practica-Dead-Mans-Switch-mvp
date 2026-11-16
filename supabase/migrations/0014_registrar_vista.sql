-- 0014: registrar "visto" (R3). Cuando quien recibe abre la pantalla de la alerta con un token válido,
-- se guarda un evento en alert_views. Plan A (MVP): abrir el enlace cuenta como visto.
-- Se guarda una sola vez por contacto y alerta, así que recargar la página no genera filas nuevas.

create or replace function public.registrar_vista_alerta(p_token text)
returns boolean
language plpgsql
security definer set search_path = ''
as $$
declare
  r record;
begin
  select ar.alert_id, ar.contact_id
  into r
  from public.alert_recipients ar
  where ar.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  limit 1;

  if not found then
    return false;
  end if;

  if not exists (
    select 1 from public.alert_views v
    where v.alert_id = r.alert_id and v.contact_id = r.contact_id and v.event = 'link_opened'
  ) then
    insert into public.alert_views (alert_id, contact_id, event)
    values (r.alert_id, r.contact_id, 'link_opened');
  end if;

  return true;
end;
$$;

grant execute on function public.registrar_vista_alerta(text) to anon, authenticated;
