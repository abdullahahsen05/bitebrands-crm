/**
 * Bite Brands CRM — Database Migration Runner
 *
 * Runs the schema migration and seed SQL directly against Supabase Postgres.
 *
 * Usage:
 *   npm run db:migrate          — runs schema only
 *   npm run db:seed             — runs seed only
 *   npm run db:migrate db:seed  — runs both
 *
 * Or call this script directly:
 *   npx tsx scripts/run-migration.ts [schema|seed|all]
 *
 * Requires SUPABASE_DB_URL in .env.local:
 *   SUPABASE_DB_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { Client } from "pg";

const DB_URL = process.env.SUPABASE_DB_URL;

if (!DB_URL) {
  console.error("Missing SUPABASE_DB_URL in environment.");
  console.error(
    "Add to .env.local:\n  SUPABASE_DB_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres",
  );
  process.exit(1);
}

async function runFile(client: Client, filePath: string, label: string) {
  console.log(`\n▶ Running ${label}...`);
  const sql = readFileSync(filePath, "utf-8");

  try {
    await client.query(sql);
    console.log(`  ✓ ${label} complete`);
  } catch (err) {
    const pg = err as { code?: string; message?: string };
    // Ignore "already exists" errors so the script is re-runnable.
    if (pg.code === "42P07" || pg.code === "42710") {
      console.log(`  ⚠ ${label}: some objects already exist — skipped those`);
    } else {
      console.error(`  ✗ ${label} failed:`, pg.message);
      throw err;
    }
  }
}

async function main() {
  const target = process.argv[2] ?? "all";
  const schemaFile = resolve(process.cwd(), "supabase/migrations/001_initial_schema.sql");
  const seedFile = resolve(process.cwd(), "supabase/seed.sql");

  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  console.log("\n🔗 Connecting to Supabase Postgres...");
  await client.connect();
  console.log("   Connected.");

  try {
    if (target === "schema" || target === "all") {
      await runFile(client, schemaFile, "001_initial_schema.sql");
    }

    if (target === "seed" || target === "all") {
      await runFile(client, seedFile, "seed.sql");
    }

    console.log("\n✅ Migration done.\n");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
