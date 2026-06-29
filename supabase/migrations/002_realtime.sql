-- Bite Brands Partner CRM — Realtime Setup
-- Run in Supabase SQL editor after 001_initial_schema.sql.
-- Idempotent: safe to re-run.

-- ─── Replica identity ────────────────────────────────────────────────────────
-- FULL causes the full row to be included in UPDATE/DELETE WAL events,
-- so Supabase Realtime can deliver the old AND new row to subscribers.

alter table public.tasks replica identity full;
alter table public.chat_messages replica identity full;

-- ─── Realtime publication ────────────────────────────────────────────────────
-- supabase_realtime is the default publication Supabase uses.
-- Adding tables here enables postgres_changes subscriptions for them.

do $$
begin
  -- Add tasks if not already a member of the publication
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;

  -- Add chat_messages if not already a member
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;
