-- Execute este SQL no Supabase: Dashboard > SQL Editor > New query
create table if not exists public.tournament_data (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- A API usa a chave service_role somente no servidor Vercel.
-- Não habilite acesso público de leitura/escrita para esta tabela.
alter table public.tournament_data enable row level security;
