# Bite Brands Partner CRM — Backend Setup

## Prerequisites

- Node.js 20+
- A Supabase project (free tier is fine)
- `.env.local` file (see below — never commit this)

---

## Environment variables

Create `.env.local` in the project root:

```env
# Public — safe to expose in browser bundles
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Server-only — never commit, never expose in client code
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Direct Postgres connection — used by migration scripts only
SUPABASE_DB_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

> Supabase Dashboard → Settings → API for URL + keys.  
> Settings → Database → Connection string for `SUPABASE_DB_URL`.

---

## Initial database setup

### 1. Schema

```bash
npm run db:migrate        # runs supabase/migrations/001_initial_schema.sql
```

Or paste `supabase/migrations/001_initial_schema.sql` directly into the Supabase SQL editor.

### 2. Seed data (demo partners, concepts, users)

```bash
npm run db:seed           # runs supabase/seed.sql
```

Or paste `supabase/seed.sql` into the SQL editor.

### 3. Both in one command

```bash
npm run db:setup          # schema + seed
```

### 4. Realtime (required for live chat and task sync)

```bash
npm run db:realtime       # runs supabase/migrations/002_realtime.sql
```

This migration:
- Sets `REPLICA IDENTITY FULL` on `tasks` and `chat_messages`
- Adds both tables to the `supabase_realtime` publication

The migration is idempotent — safe to re-run.

---

## Auth setup

### Create demo users

Run `npm run setup:supabase` — it creates the demo users via the Supabase Admin Auth API:

| Email | Password | Role |
|---|---|---|
| huib@bitebrands.nl | demo123 | admin |
| kerem@bitebrands.nl | demo123 | manager |
| ana@bitebrands.nl | demo123 | manager |
| sem@bitebrands.nl | demo123 | viewer |
| tomasz@bitebrands.nl | demo123 | viewer |

> These are demo credentials only. Rotate before production (Phase C).

---

## Development

```bash
npm run dev               # http://localhost:3000
npm test                  # unit tests (vitest)
npm run lint              # eslint
npm run build             # production build check
```

---

## Realtime — how it works

`setupRealtimeChannels()` in `src/lib/crm-store.ts` subscribes to:

| Table | Events |
|---|---|
| `chat_messages` | INSERT → appended to store (dedup by id) |
| `tasks` | INSERT / UPDATE / DELETE → merged into store |

Called automatically after every successful login or session restore. No additional config needed beyond the `db:realtime` migration above.

**To verify realtime is active for a table:**

```sql
select tablename
from pg_publication_tables
where pubname = 'supabase_realtime' and schemaname = 'public'
order by tablename;
-- Expected: chat_messages, tasks (plus any others already added)
```

---

## QA data cleanup

After browser QA sessions, remove test rows:

```bash
npm run cleanup:qa
```

Removes all rows where `name` or `title` starts with `"QA "`, plus matching chat messages, events, and config entries.

---

## Seed / reset notes

- `supabase/seed.sql` is additive — running it twice creates duplicate seed rows. Either `TRUNCATE` the tables first or use the `ON CONFLICT DO NOTHING` clauses already present.
- `supabase/migrations/001_initial_schema.sql` uses `CREATE TABLE IF NOT EXISTS` — safe to re-run.
- `supabase/migrations/002_realtime.sql` is fully idempotent.

---

## Phase C — security items deferred

The following were explicitly deferred from Phase B and must be addressed before production:

| Item | Notes |
|---|---|
| **RLS policies** | Current policies allow authenticated reads/writes broadly. Tighten per-user-role (viewer read-only, manager write own team, admin full) |
| **Service role key** | Currently exposed to migration scripts only. Move any server-side usage to Next.js API routes or Edge Functions — never ship to the browser |
| **Platform passwords** | Stored in `partner_platforms.password` as plain text. Migrate to Supabase Vault or encrypt at the application layer |
| **Demo credential rotation** | Rotate all demo user passwords before first real-user login |
| **Portal URLs** | Configure real production portal domain URLs in Admin → Instellingen |
| **`.env.local` secrets** | Rotate `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_DB_URL` password before production |
| **Email confirmation** | Auth email confirmation is disabled for demo. Enable in Supabase Auth settings for production |
