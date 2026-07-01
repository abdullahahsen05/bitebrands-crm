import { readFileSync } from "fs";
import { resolve } from "path";
import { Client } from "pg";

async function main() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  const sql = readFileSync(
    resolve("supabase/migrations/003_facturatie_links.sql"),
    "utf-8",
  );

  await client.connect();
  try {
    await client.query(sql);
    console.log("✓ Migration 003 (partner_facturatie_links) applied");
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (err.code === "42P07" || err.code === "42710") {
      console.log("⚠ Table/index already exists — skipped (idempotent)");
    } else {
      console.error("✗ Migration failed:", err.message);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

void main();
