-- 0008: cada "estoy bien" de quien emite (E1, E2, E3). RLS activado.

create table if not exists public.confirmations (
  id uuid primary key default gen_random_uuid(),
  issuer_id uuid not null references public.profiles (id) on delete cascade,
  notice_id uuid references public.notices (id) on delete set null,
  confirmed_at timestamptz not null default now(),
  source text not null default 'app' check (source in ('app', 'notification'))
);

create index if not exists confirmations_issuer_idx on public.confirmations (issuer_id, confirmed_at desc);

alter table public.confirmations enable row level security;

create policy "confirmations_select_own" on public.confirmations
  for select using (auth.uid() = issuer_id);

create policy "confirmations_insert_own" on public.confirmations
  for insert with check (auth.uid() = issuer_id);
