-- 0013: datos de la pantalla de la alerta para quien recibe (R2 a R7). Sin cuenta: se accede solo con el token.
-- El token se compara por su hash SHA-256 en hexadecimal contra alert_recipients.token_hash.
-- No modifica tablas existentes; solo crea la función.

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
begin
  select a.id, a.notice_id, a.issuer_id, a.started_at, a.outcome, n.fire_at, p.full_name, p.phone
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

  v_estado := case r.outcome
    when 'open' then 'abierta'
    when 'closed' then 'cerrada'
    else 'sin_resolver'
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
