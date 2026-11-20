-- 0019: plataforma desde la que se registró la persona (ios, android, escritorio). Para medir el uso.
-- Las cuentas anteriores quedan en null: no se sabe desde dónde se registraron.

alter table public.profiles add column if not exists plataforma text
  check (plataforma in ('ios', 'android', 'escritorio'));

-- El trigger de alta guarda la plataforma que manda el formulario de registro.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, is_adult, username, plataforma)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce((new.raw_user_meta_data ->> 'is_adult')::boolean, false),
    nullif(lower(new.raw_user_meta_data ->> 'username'), ''),
    case when new.raw_user_meta_data ->> 'plataforma' in ('ios', 'android', 'escritorio')
         then new.raw_user_meta_data ->> 'plataforma' end
  );
  return new;
end;
$$;
