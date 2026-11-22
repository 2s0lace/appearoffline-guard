-- Run this once in Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- Creates tables + Row Level Security (RLS) so each user can only access their own data.

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  blocked text[] not null default '{}',
  unlock_mode text not null default 'PAUSE_AND_REASON',
  language text not null default 'pl',
  theme text not null default 'LIGHT',
  resolution text not null default 'SHOW_BLOCKED_INFO_PAGE',
  counter_show boolean not null default true,
  counter_period text not null default 'ALL_TIME',
  updated_at timestamptz not null default now()
);

create table if not exists public.unlock_history (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  timestamp_ms bigint not null,
  url text not null,
  rule text not null,
  category text not null,
  reason text not null,
  duration_minutes integer not null,
  kind text not null default 'SITE_UNLOCK',
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists unlock_history_user_ts_idx
  on public.unlock_history (user_id, timestamp_ms desc);

alter table public.user_settings enable row level security;
alter table public.unlock_history enable row level security;

-- Policies for user_settings
drop policy if exists "Users can view own settings" on public.user_settings;
create policy "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies for unlock_history
drop policy if exists "Users can view own history" on public.unlock_history;
create policy "Users can view own history"
  on public.unlock_history for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own history" on public.unlock_history;
create policy "Users can insert own history"
  on public.unlock_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own history" on public.unlock_history;
create policy "Users can update own history"
  on public.unlock_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own history" on public.unlock_history;
create policy "Users can delete own history"
  on public.unlock_history for delete
  using (auth.uid() = user_id);

-- Explicit grants required for authenticated role
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.user_settings to authenticated;
grant select, insert, update, delete on table public.unlock_history to authenticated;
