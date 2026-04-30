-- PROJECT:SCORE submissions table
-- Run once in Neon SQL Editor

create extension if not exists "pgcrypto";

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  topic text not null,
  mode text not null,
  types text[] not null,
  track text not null,
  white_score numeric(4,2),
  black_score numeric(4,2),
  white_decision text,
  black_decision text,
  passed_gates smallint,
  penalties numeric(4,2),
  answers jsonb not null,
  gates jsonb not null,
  flags jsonb not null,
  inputs jsonb not null,
  memos jsonb not null,
  vector text not null,
  terms_version text not null,
  app_version text not null,
  estimated_hours integer,
  worth_it boolean
);

create index if not exists submissions_created_at_idx on submissions (created_at desc);
create index if not exists submissions_mode_idx on submissions (mode);
