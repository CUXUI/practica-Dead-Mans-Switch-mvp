-- 0002: avisos programados de quien emite. RLS activado.
-- Un aviso por vez y por persona (regla del AGENTS.md). recurrence queda en 'once'
-- para el MVP; 'daily' y 'weekly' están previstos para escalar.

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  issuer_id uuid not null references public.profiles (id) on delete cascade,
  fire_at timestamptz not null,
  recurrence text not null default 'once' check (recurrence in ('once', 'daily', 'weekly')),
  state text not null default 'off' check (state in ('off', 'active', 'alert')),
  qstash_message_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Solo un aviso activo por persona.
create unique index if not exists notices_one_active_per_issuer
  on public.notices (issuer_id) where state = 'active';

create index if not exists notices_issuer_idx on public.notices (issuer_id);

alter table public.notices enable row level security;

create policy "notices_select_own" on public.notices
  for select using (auth.uid() = issuer_id);

create policy "notices_insert_own" on public.notices
  for insert with check (auth.uid() = issuer_id);

create policy "notices_update_own" on public.notices
  for update using (auth.uid() = issuer_id) with check (auth.uid() = issuer_id);

create policy "notices_delete_own" on public.notices
  for delete using (auth.uid() = issuer_id);
