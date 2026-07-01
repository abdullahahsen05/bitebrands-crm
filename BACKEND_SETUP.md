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

| Email | Password | Name | Role |
|---|---|---|---|
| huib@bitebrands.demo | demo | Huib | Beheerder |
| sanne@bitebrands.demo | demo | Sanne | Facturatie-manager |
| kerem@bitebrands.demo | demo | Kerem | Sales |
| noor@bitebrands.demo | demo | Noor | Operations |
| lotte@bitebrands.demo | demo | Lotte | Marketing |

The script is idempotent — safe to re-run. Existing users are skipped; profiles are upserted.

> These are demo credentials only. Rotate before production (Phase C).

---

## Vercel deployment

The frontend is a fully static Next.js app — no server-side functions. Only two environment variables are needed in Vercel:

| Variable | Where to find it | Required on Vercel |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | **Yes** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon/public key | **Yes** |
| `SUPABASE_SERVICE_ROLE_KEY` | Scripts only — **never add to Vercel** | No |
| `SUPABASE_DB_URL` | Scripts only — **never add to Vercel** | No |

### Adding env vars via Vercel CLI (use `printf`, not `echo`)

`echo` appends a trailing newline that gets embedded in the stored value and breaks Supabase requests at runtime:

```bash
# Correct — no trailing newline
printf '%s' "https://<project-ref>.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
printf '%s' "<anon-key>" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

After adding env vars, **redeploy** so the build picks them up:

```bash
npx vercel --prod
```

### Supabase Auth settings

In the Supabase Dashboard → Authentication → URL Configuration, add your Vercel domain to **Redirect URLs**:

```
https://<your-project>.vercel.app/**
https://<your-project>.vercel.app
```

Password-based sign-in works without this, but email confirmation links and OAuth flows require it.

### Run setup against the same Supabase project

`npm run setup:supabase` must target the same Supabase project that Vercel uses. Confirm your `.env.local` `NEXT_PUBLIC_SUPABASE_URL` matches the project shown in the Vercel env vars, then run:

```bash
npm run setup:supabase
```

This creates the five demo auth users that the login page shows.

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

## External portal URLs

The three sidebar portal links point to the real client domains:

| Portal | URL |
|---|---|
| Onboarding / Partner portal | https://aanmelden.bitebrands.nl |
| Facturatie portal | https://facturatie.bitebrands.nl |
| Review portal | https://reviews.bitebrands.nl |

These URLs are stored in the `settings` table under keys `portal_onboarding`, `portal_facturatie`, `portal_review`. They can be overridden per-deployment in Admin → Instellingen without code changes.

To update a live Supabase project after changing the domains:

```bash
npm run update:portals
```

> **Invoice / revenue portal linking deferred.** The Facturatie portal is external-only for now. CRM ↔ invoice revenue sync (facturatie_partner_id, revenue tables, sync API) is intentionally not implemented in this phase.

---

## Role-based access

| Role | Allowed views | Admin tabs |
|---|---|---|
| **Beheerder** | Partners, Onboarding, Facturatie, Relaties, Team, Admin | All tabs |
| **Facturatie-manager** | Facturatie | None |
| **Sales** | Partners, Onboarding | None |
| **Marketing** | Relaties, Admin (Templates only) | Templates |
| **Operations** | Onboarding, Team | None |

Restrictions are enforced in the UI layer (`src/lib/permissions.ts`):
- Sidebar only shows allowed nav items for the current role.
- `setView()` redirects to the default view for the role if the target is forbidden, with a toast.
- After login / session restore the user lands on their default view.
- Switching demo users (user menu) also re-routes to the new user's default view.
- Admin tabs are filtered per role; forbidden tabs redirect to the first allowed tab.

> This is UI-layer enforcement only. Supabase RLS hardening is deferred to Phase C.

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
