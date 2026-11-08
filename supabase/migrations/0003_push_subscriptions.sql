-- 0003: suscripciones push de quien emite (un dispositivo = una fila). RLS activado.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  issuer_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_issuer_idx on public.push_subscriptions (issuer_id);

alter table public.push_subscriptions enable row level security;

create policy "push_select_own" on public.push_subscriptions
  for select using (auth.uid() = issuer_id);

create policy "push_insert_own" on public.push_subscriptions
  for insert with check (auth.uid() = issuer_id);

create policy "push_delete_own" on public.push_subscriptions
  for delete using (auth.uid() = issuer_id);
