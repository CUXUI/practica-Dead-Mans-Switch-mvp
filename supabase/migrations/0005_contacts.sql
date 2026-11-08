-- 0005: contactos de quien emite (hasta 5 activos), sus posiciones y las bajas con código. RLS activado.

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  issuer_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  email text not null,
  position smallint not null check (position between 1 and 5),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'removed')),
  invite_token_hash text,
  accepted_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Una posición por persona entre los contactos que no fueron dados de baja.
create unique index if not exists contacts_position_unique
  on public.contacts (issuer_id, position) where status <> 'removed';

create index if not exists contacts_issuer_idx on public.contacts (issuer_id);

-- Máximo 5 contactos activos (no dados de baja) por persona (E5).
create or replace function public.check_contact_limit()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.status <> 'removed' and (
    select count(*) from public.contacts
    where issuer_id = new.issuer_id and status <> 'removed' and id <> new.id
  ) >= 5 then
    raise exception 'Máximo 5 contactos';
  end if;
  return new;
end;
$$;

drop trigger if exists contacts_limit on public.contacts;
create trigger contacts_limit
  before insert or update on public.contacts
  for each row execute function public.check_contact_limit();

alter table public.contacts enable row level security;

create policy "contacts_select_own" on public.contacts
  for select using (auth.uid() = issuer_id);
create policy "contacts_insert_own" on public.contacts
  for insert with check (auth.uid() = issuer_id);
create policy "contacts_update_own" on public.contacts
  for update using (auth.uid() = issuer_id) with check (auth.uid() = issuer_id);
create policy "contacts_delete_own" on public.contacts
  for delete using (auth.uid() = issuer_id);

-- Qué contactos llama cada aviso, y en qué orden.
create table if not exists public.notice_contacts (
  notice_id uuid not null references public.notices (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  position smallint not null check (position between 1 and 5),
  primary key (notice_id, contact_id)
);

alter table public.notice_contacts enable row level security;

create policy "notice_contacts_own" on public.notice_contacts
  for all using (
    exists (select 1 from public.notices n where n.id = notice_id and n.issuer_id = auth.uid())
  ) with check (
    exists (select 1 from public.notices n where n.id = notice_id and n.issuer_id = auth.uid())
  );

-- Código de baja de un contacto (enviado por correo). Solo servidor: sin políticas para usuarios.
create table if not exists public.contact_removals (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts (id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.contact_removals enable row level security;
