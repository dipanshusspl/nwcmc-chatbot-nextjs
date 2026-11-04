-- Idempotent upgrade for existing installations.
begin;

-- Serverless-safe rate limiting (also present in the fresh-install schema).
create table if not exists public.chatbot_ratelimit (
  key          text primary key,
  count        integer not null,
  window_start timestamptz not null default now()
);
alter table public.chatbot_ratelimit enable row level security;

-- Global, persistent AI selection. No row means AI_PROVIDER (or groq) is used.
create table if not exists public.chatbot_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now(),
  constraint chatbot_settings_provider_check check (key <> 'ai_provider' or value in ('groq', 'gemini'))
);
alter table public.chatbot_settings enable row level security;

-- Fixed UTC anchor survives cleanup, restarts and redeployments.
create table if not exists public.chatbot_retention_state (
  id integer primary key check (id = 1),
  anchor_at timestamptz not null,
  last_cutoff_at timestamptz,
  last_run_at timestamptz
);
alter table public.chatbot_retention_state enable row level security;
insert into public.chatbot_retention_state (id, anchor_at)
select 1, coalesce(min(created_at), now()) from public.chatbot_chatlog
on conflict (id) do nothing;

commit;
