-- 0007: alertas, a quién se avisó, cada apertura del link, y cada intento de aviso. RLS activado.
-- expires_at: vencimiento por tiempo (S5). Decidido: 48 h. Lo guarda el servidor al disparar la alerta.

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  notice_id uuid not null references public.notices (id) on delete cascade,
  issuer_id uuid not null references public.profiles (id) on delete cascade,
  started_at timestamptz not null default now(),
  closed_at timestamptz,
  expires_at timestamptz,
  outcome text not null default 'open' check (outcome in ('open', 'closed', 'unresolved')),
  last_stage smallint not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists alerts_issuer_idx on public.alerts (issuer_id);
create index if not exists alerts_notice_idx on public.alerts (notice_id);

create table if not exists public.alert_recipients (
  alert_id uuid not null references public.alerts (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  notified_at timestamptz,
  token_hash text,
  primary key (alert_id, contact_id)
);

-- Cada apertura del link del correo (link_opened) o toque en "Ya lo vi" (button_tap).
create table if not exists public.alert_views (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.alerts (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  event text not null check (event in ('link_opened', 'button_tap')),
  viewed_at timestamptz not null default now(),
  user_agent_hash text
);

create index if not exists alert_views_alert_idx on public.alert_views (alert_id);

-- Cada intento de aviso, por canal y con su resultado (S3).
create table if not exists public.delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.alerts (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  channel text not null check (channel in ('push', 'email')),
  result text not null check (result in ('sent', 'failed', 'bounced')),
  attempted_at timestamptz not null default now(),
  provider_message_id text
);

create index if not exists delivery_attempts_alert_idx on public.delivery_attempts (alert_id);

alter table public.alerts enable row level security;
alter table public.alert_recipients enable row level security;
alter table public.alert_views enable row level security;
alter table public.delivery_attempts enable row level security;

-- Quien emite ve sus propias alertas y sus intentos.
create policy "alerts_select_own" on public.alerts
  for select using (auth.uid() = issuer_id);

create policy "alert_recipients_select_own" on public.alert_recipients
  for select using (
    exists (select 1 from public.alerts a where a.id = alert_id and a.issuer_id = auth.uid())
  );

create policy "alert_views_select_own" on public.alert_views
  for select using (
    exists (select 1 from public.alerts a where a.id = alert_id and a.issuer_id = auth.uid())
  );

create policy "delivery_attempts_select_own" on public.delivery_attempts
  for select using (
    exists (select 1 from public.alerts a where a.id = alert_id and a.issuer_id = auth.uid())
  );

-- Las escrituras de alertas las hace solo el servidor (service_role), sin políticas para usuarios.
