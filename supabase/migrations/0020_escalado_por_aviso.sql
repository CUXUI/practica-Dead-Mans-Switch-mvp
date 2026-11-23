-- Tiempo entre contactos de la alerta (escalado), configurable por aviso.
-- Antes era una constante del núcleo (30 min). Los avisos existentes quedan en 30.
alter table public.notices
  add column if not exists escalation_minutes integer not null default 30
  check (escalation_minutes between 5 and 240);
