-- 0012: invitación de contacto (R1). Quien recibe no tiene cuenta: accede solo con el token.
-- El token se compara por su hash SHA-256 en hexadecimal contra contacts.invite_token_hash.
-- No modifica tablas existentes; solo crea dos funciones.

-- Datos mínimos para mostrar la invitación: quién la manda y a qué correo llegó.
create or replace function public.get_invitation(p_token text)
returns table (issuer_name text, contact_email text, status text)
language sql
stable
security definer set search_path = ''
as $$
  select p.full_name, c.email, c.status
  from public.contacts c
  join public.profiles p on p.id = c.issuer_id
  where c.invite_token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  limit 1;
$$;

-- Responde la invitación. Solo cambia el estado si el contacto está pendiente.
-- Devuelve: 'ok' (con el nuevo estado), 'inactive' (ya respondida o dada de baja) o 'not_found'.
create or replace function public.respond_invitation(p_token text, p_decision text)
returns table (result text, new_status text, issuer_id uuid, contact_email text)
language plpgsql
security definer set search_path = ''
as $$
declare
  c public.contacts%rowtype;
  v_status text;
begin
  if p_decision not in ('accept', 'reject') then
    raise exception 'Decisión inválida';
  end if;

  select * into c
  from public.contacts
  where invite_token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  for update;

  if not found then
    return query select 'not_found'::text, null::text, null::uuid, null::text;
    return;
  end if;

  if c.status <> 'pending' then
    return query select 'inactive'::text, c.status, c.issuer_id, c.email;
    return;
  end if;

  v_status := case when p_decision = 'accept' then 'accepted' else 'rejected' end;

  update public.contacts
  set status = v_status,
      accepted_at = case when v_status = 'accepted' then now() else accepted_at end
  where id = c.id;

  return query select 'ok'::text, v_status, c.issuer_id, c.email;
end;
$$;

grant execute on function public.get_invitation(text) to anon, authenticated;
grant execute on function public.respond_invitation(text, text) to anon, authenticated;
