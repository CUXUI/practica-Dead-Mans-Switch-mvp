-- Tiempo de gracia mínimo de 2 min (temporal, para la demo). Antes era 15 min.
-- Para volver a 15 después de la demo: cambiar el límite aquí y CONFIG_EMISOR.gracia.minimoMin.
alter table public.notices drop constraint if exists notices_grace_minutes_check;
alter table public.notices
  add constraint notices_grace_minutes_check check (grace_minutes between 2 and 1440);
