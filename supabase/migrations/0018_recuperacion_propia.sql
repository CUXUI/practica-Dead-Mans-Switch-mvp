-- 0018: recuperación de contraseña gestionada por la app (no por Supabase Auth).
-- Solo el servidor (service_role) toca esta tabla. Se guarda el hash del token, nunca el token.

create table if not exists public.password_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists password_resets_user_idx on public.password_resets (user_id, created_at desc);

alter table public.password_resets enable row level security;

-- Búsqueda de usuario por correo, solo para el servidor. Sin esto, cualquiera podría averiguar correos registrados.
create or replace function public.id_usuario_por_correo(p_email text)
returns uuid
language sql
stable
security definer set search_path = ''
as $$
  select u.id from auth.users u where lower(u.email) = lower(p_email) limit 1;
$$;

revoke all on function public.id_usuario_por_correo(text) from public, anon, authenticated;
grant execute on function public.id_usuario_por_correo(text) to service_role;
