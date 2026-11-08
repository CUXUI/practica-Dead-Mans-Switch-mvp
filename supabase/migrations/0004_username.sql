-- 0004: usuario para ingresar (además del correo). RLS sigue activo en profiles.

alter table public.profiles add column if not exists username text;

-- Formato: 3 a 20 caracteres, letras minúsculas, números, punto o guion bajo.
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format
  check (username is null or username ~ '^[a-z0-9._]{3,20}$');

create unique index if not exists profiles_username_unique
  on public.profiles (lower(username)) where username is not null;

-- El trigger de alta ahora también guarda el usuario elegido en el registro.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, is_adult, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce((new.raw_user_meta_data ->> 'is_adult')::boolean, false),
    nullif(lower(new.raw_user_meta_data ->> 'username'), '')
  );
  return new;
end;
$$;

-- Devuelve el correo para ingresar: si recibe un correo lo devuelve tal cual;
-- si recibe un usuario, busca el correo de esa cuenta. No expone otros datos.
create or replace function public.resolve_login_email(identifier text)
returns text
language sql
stable
security definer set search_path = ''
as $$
  select case
    when position('@' in identifier) > 0 then identifier
    else (
      select u.email
      from public.profiles p
      join auth.users u on u.id = p.id
      where lower(p.username) = lower(identifier)
      limit 1
    )
  end;
$$;

grant execute on function public.resolve_login_email(text) to anon, authenticated;
