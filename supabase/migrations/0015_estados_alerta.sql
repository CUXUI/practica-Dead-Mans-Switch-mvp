-- 0015: los cinco estados de la alerta para quien recibe (R2):
--   enviada        : la alerta salió y nadie la abrió todavía
--   alguien_la_vio : otro contacto ya abrió la alerta
--   sin_respuesta  : toda la lista fue avisada y nadie la abrió
--   cerrada        : quien emite confirmó que está bien o canceló
--   sin_resolver   : venció por tiempo sin que nadie la cerrara
-- Reemplaza get_alert_view (0013) para calcular el estado desde los datos.

create or replace function public.get_alert_view(p_token text)
returns jsonb
language plpgsql
stable
security definer set search_path = ''
as $$
declare
  r record;
  v_estado text;
  v_ultima timestamptz;
  v_pasos jsonb;
  v_otros_vieron boolean;
  v_alguien_vio boolean;
  v_pendientes boolean;
begin
  select a.id, a.notice_id, a.issuer_id, a.started_at, a.outcome, n.fire_at, p.full_name, p.phone, ar.contact_id
  into r
  from public.alert_recipients ar
  join public.alerts a on a.id = ar.alert_id
  join public.notices n on n.id = a.notice_id
  join public.profiles p on p.id = a.issuer_id
  where ar.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  limit 1;

  if not found then
    return null;
  end if;

  select exists (select 1 from public.alert_views v where v.alert_id = r.id and v.contact_id <> r.contact_id),
         exists (select 1 from public.alert_views v where v.alert_id = r.id)
  into v_otros_vieron, v_alguien_vio;

  select exists (select 1 from public.alert_recipients x where x.alert_id = r.id and x.notified_at is null)
  into v_pendientes;

  v_estado := case
    when r.outcome = 'closed' then 'cerrada'
    when r.outcome = 'unresolved' then 'sin_resolver'
    when v_otros_vieron then 'alguien_la_vio'
    when not v_alguien_vio and not v_pendientes then 'sin_respuesta'
    else 'enviada'
  end;

  select max(c.confirmed_at) into v_ultima
  from public.confirmations c
  where c.issuer_id = r.issuer_id;

  select coalesce(jsonb_agg(jsonb_build_object('orden', s.position, 'texto', s.body) order by s.position), '[]'::jsonb)
  into v_pasos
  from public.notice_steps s
  where s.notice_id = r.notice_id;

  return jsonb_build_object(
    'estado', v_estado,
    'nombre_quien_emite', coalesce(nullif(r.full_name, ''), 'Una persona'),
    'telefono_quien_emite', nullif(r.phone, ''),
    'iniciada_en', r.started_at,
    'hora_deberia_confirmar', r.fire_at,
    'ultima_confirmacion', v_ultima,
    'pasos', v_pasos
  );
end;
$$;

grant execute on function public.get_alert_view(text) to anon, authenticated;
