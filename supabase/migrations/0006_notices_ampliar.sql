-- 0006: el aviso gana tipo (rutina o salida), tiempo de gracia y la regla de un solo aviso activo o en alerta.

alter table public.notices add column if not exists kind text not null default 'routine'
  check (kind in ('routine', 'trip'));

-- Tiempo de gracia en minutos: 15 a 1440 (hasta 24 h). Por defecto 30 (Cerca).
alter table public.notices add column if not exists grace_minutes integer not null default 30
  check (grace_minutes between 15 and 1440);

-- fire_at es el próximo plazo (para salidas, la hora de regreso).

-- Un solo aviso activo o en alerta por persona (antes solo "active").
drop index if exists public.notices_one_active_per_issuer;
create unique index if not exists notices_one_open_per_issuer
  on public.notices (issuer_id) where state in ('active', 'alert');
