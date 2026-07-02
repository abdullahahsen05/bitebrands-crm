import { readFileSync } from "fs";
import { resolve } from "path";
import { Client } from "pg";

async function main() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  const sql = readFileSync(
    resolve("supabase/migrations/004_facturatie_links_metadata.sql"),
    "utf-8",
  );

  await client.connect();
  try {
    await client.query(sql);
    console.log("✓ Migration 004 (facturatie_links metadata columns) applied");
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (err.code === "42701") {
      console.log("⚠ Columns already exist — skipped (idempotent)");
    } else {
      console.error("✗ Migration failed:", err.message);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

void main();
