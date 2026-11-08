-- 0009: vistas para que las duplas consulten sin armar SQL complejo.
-- security_invoker = true: las vistas respetan el RLS de quien consulta.

create or replace view public.v_my_notice
with (security_invoker = true) as
select n.id, n.kind, n.state, n.fire_at, n.recurrence, n.grace_minutes, n.created_at
from public.notices n
where n.issuer_id = auth.uid()
  and n.state in ('active', 'alert', 'off');

create or replace view public.v_my_history
with (security_invoker = true) as
select 'confirmation'::text as kind, c.confirmed_at as happened_at, c.notice_id, null::uuid as alert_id
from public.confirmations c
where c.issuer_id = auth.uid()
union all
select 'alert'::text, a.started_at, a.notice_id, a.id
from public.alerts a
where a.issuer_id = auth.uid();

grant select on public.v_my_notice, public.v_my_history to authenticated;
