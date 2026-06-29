-- Bite Brands Partner CRM — Initial Schema
-- Run in Supabase SQL editor (Database > SQL Editor).
-- TODO (security hardening): tighten RLS policies role-by-role before production.

-- ─── Extensions ─────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ─── Config tables ───────────────────────────────────────────────────────────

create table if not exists countries (
  code  text primary key,
  name  text not null,
  flag  text
);

create table if not exists concepts (
  id         text primary key,
  name       text not null,
  color      text,
  logo_url   text,
  sort_order integer default 0
);

create table if not exists onboarding_steps (
  id         text primary key,
  name       text not null,
  sub        text,
  optional   boolean default false,
  general    boolean default false,
  sort_order integer default 0
);

create table if not exists custom_fields (
  id         text primary key,
  label      text not null,
  type       text not null,
  sort_order integer default 0
);

create table if not exists platforms (
  id         text primary key,
  name       text not null,
  kind       text not null,  -- 'delivery' | 'web'
  sort_order integer default 0
);

create table if not exists message_templates (
  id           text primary key,
  country_code text references countries(code) on delete cascade,
  channel      text not null,
  title        text not null,
  subject      text,
  body         text not null
);

create table if not exists relation_categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  sort_order integer default 0
);

create table if not exists settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz default now()
);

-- ─── Profiles ────────────────────────────────────────────────────────────────

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  role       text not null,
  color      text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Partners ────────────────────────────────────────────────────────────────

create table if not exists partners (
  id           text primary key,
  name         text not null,
  contact      text,
  city         text,
  country_code text references countries(code),
  phone        text,
  email        text,
  fee          numeric default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  created_by   uuid references profiles(id)
);

create table if not exists partner_concepts (
  partner_id text references partners(id) on delete cascade,
  concept_id text references concepts(id),
  primary key (partner_id, concept_id)
);

create table if not exists partner_general_steps (
  partner_id text references partners(id) on delete cascade,
  step_id    text references onboarding_steps(id),
  done       boolean default false,
  updated_at timestamptz default now(),
  primary key (partner_id, step_id)
);

create table if not exists partner_concept_steps (
  partner_id text references partners(id) on delete cascade,
  concept_id text references concepts(id),
  step_id    text references onboarding_steps(id),
  done       boolean default false,
  updated_at timestamptz default now(),
  primary key (partner_id, concept_id, step_id)
);

create table if not exists partner_custom (
  partner_id text references partners(id) on delete cascade,
  field_id   text references custom_fields(id),
  value      text,
  primary key (partner_id, field_id)
);

create table if not exists partner_platforms (
  partner_id          text references partners(id) on delete cascade,
  platform_id         text references platforms(id),
  active              boolean default false,
  login               text,
  pass                text,   -- TODO (security hardening): replace with vault reference
  partner_external_id text,
  url                 text,
  updated_at          timestamptz default now(),
  primary key (partner_id, platform_id)
);

create table if not exists partner_billing (
  partner_id text references partners(id) on delete cascade,
  concept_id text references concepts(id),
  invoiced   boolean default false,
  live       boolean default false,
  verif_done boolean default false,
  verif_code text,
  updated_at timestamptz default now(),
  primary key (partner_id, concept_id)
);

-- ─── Relations ───────────────────────────────────────────────────────────────

create table if not exists relations (
  id            text primary key,
  name          text not null,
  category_name text,
  contact       text,
  phone         text,
  email         text,
  website       text,
  notes         text,
  created_at    timestamptz default now()
);

-- ─── Events (partner + relation contact logs) ────────────────────────────────

create table if not exists events (
  id          text primary key,
  partner_id  text references partners(id) on delete cascade,
  relation_id text references relations(id) on delete cascade,
  kind        text not null,   -- 'contact' | 'system'
  type        text not null,
  text        text not null,
  by_name     text,
  created_at  timestamptz not null
);

-- ─── Team chat ───────────────────────────────────────────────────────────────

create table if not exists chat_messages (
  id           text primary key,
  by_user_id   uuid references profiles(id),
  by_user_name text,
  text         text not null,
  created_at   timestamptz not null
);

-- ─── Tasks ───────────────────────────────────────────────────────────────────

create table if not exists tasks (
  id            text primary key,
  title         text not null,
  description   text,
  assignee_id   uuid references profiles(id),
  created_by_id uuid references profiles(id),
  partner_id    text references partners(id) on delete set null,
  status        text not null default 'open',
  created_at    timestamptz not null,
  done_at       timestamptz
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Basic: authenticated users can read and write everything.
-- TODO (security hardening): tighten policies per role before production.

do $$ declare
  tbl text;
begin
  foreach tbl in array array[
    'countries','concepts','onboarding_steps','custom_fields','platforms',
    'message_templates','relation_categories','settings','profiles',
    'partners','partner_concepts','partner_general_steps','partner_concept_steps',
    'partner_custom','partner_platforms','partner_billing',
    'relations','events','chat_messages','tasks'
  ] loop
    execute format('alter table %I enable row level security', tbl);
    execute format(
      'create policy "auth_all_%s" on %I for all to authenticated using (true) with check (true)',
      tbl, tbl
    );
  end loop;
end $$;

-- Allow profiles to be created by the system on signup (no auth yet at that moment).
-- The service role will handle profile insertion during seed/setup.
