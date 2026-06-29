/**
 * Bite Brands CRM — Apply Realtime Migration
 *
 * Runs supabase/migrations/002_realtime.sql against the Supabase Postgres DB.
 * Requires SUPABASE_DB_URL in .env.local.
 *
 * Run: npx tsx scripts/apply-realtime-migration.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import { Client } from "pg";

const DB_URL = process.env.SUPABASE_DB_URL;

if (!DB_URL) {
  console.error("Missing SUPABASE_DB_URL in .env.local");
  process.exit(1);
}

const sql = readFileSync(join(process.cwd(), "supabase/migrations/002_realtime.sql"), "utf8");

async function main() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Connected to Supabase Postgres.");

  try {
    await client.query(sql);
    console.log("✅ 002_realtime.sql applied successfully.");

    // Verify
    const { rows } = await client.query(`
      select tablename from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public'
      order by tablename;
    `);
    console.log("Tables in supabase_realtime publication:", rows.map((r) => r.tablename).join(", "));
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
