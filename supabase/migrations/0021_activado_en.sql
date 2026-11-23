-- Hora en que se encendió el aviso. Inicio la muestra como "Desde" en el plazo.
-- Los avisos que ya estaban encendidos quedan en null: Inicio usa la hora de la ventana como antes.
alter table public.notices
  add column if not exists activated_at timestamptz;
