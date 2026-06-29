/**
 * Bite Brands CRM — QA Data Cleanup
 *
 * Removes test data created during browser QA:
 *   - Partners whose names start with "QA "
 *   - Relations whose names start with "QA "
 *   - Config entries added during QA (QA Test Concept, QA Teststap)
 *   - Chat messages and events containing "QA" marker text
 *   - Duplicate tasks (title matches QA pattern)
 *
 * Run: npm run cleanup:qa
 * Safe to re-run (idempotent).
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function cleanup() {
  console.log("\n🧹 QA Data Cleanup\n");
  let total = 0;

  async function del(label: string, table: string, column: string, pattern: string) {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .ilike(column, pattern)
      .select("id");
    if (error) {
      console.error(`  ✗ ${label}:`, error.message);
    } else {
      const count = data?.length ?? 0;
      total += count;
      console.log(`  ${count > 0 ? "✓" : "–"} ${label}: removed ${count}`);
    }
  }

  // Partners (cascades to partner_concepts, partner_billing, etc. via FK)
  const { data: qaPartners } = await supabase
    .from("partners")
    .select("id")
    .ilike("name", "QA %");
  if (qaPartners && qaPartners.length > 0) {
    const ids = qaPartners.map((p) => p.id);
    // Clean dependent tables first (no cascade on all)
    for (const tbl of ["partner_concepts", "partner_general_steps", "partner_concept_steps",
                        "partner_custom", "partner_platforms", "partner_billing"]) {
      await supabase.from(tbl).delete().in("partner_id", ids);
    }
    await supabase.from("events").delete().in("partner_id", ids);
    const { data: deleted } = await supabase.from("partners").delete().in("id", ids).select("id");
    const count = deleted?.length ?? 0;
    total += count;
    console.log(`  ${count > 0 ? "✓" : "–"} QA partners: removed ${count} (ids: ${ids.join(", ")})`);
  } else {
    console.log("  – QA partners: none found");
  }

  // Relations
  await del("QA relations", "relations", "name", "QA %");
  // Note: relation events cascade automatically if FK set, else:
  const { data: qaRelations } = await supabase.from("relations").select("id").ilike("name", "QA %");
  if (qaRelations && qaRelations.length > 0) {
    await supabase.from("events").delete().in("relation_id", qaRelations.map((r) => r.id));
  }

  // Config: QA concept
  await del("QA concepts", "concepts", "name", "QA %");

  // Config: QA onboarding steps
  await del("QA steps", "onboarding_steps", "name", "QA %");

  // Tasks with QA or REALTIME_ prefix
  await del("QA tasks", "tasks", "title", "QA %");
  await del("Realtime test tasks", "tasks", "title", "REALTIME_%");

  // Chat messages with QA or REALTIME_ text
  await del("QA chat messages", "chat_messages", "text", "QA%");
  await del("Realtime test chat messages", "chat_messages", "text", "REALTIME_%");

  // Partner events with QA text
  const { data: qaEvents, error: evErr } = await supabase
    .from("events")
    .delete()
    .ilike("text", "QA%")
    .select("id");
  if (evErr) console.error("  ✗ QA events:", evErr.message);
  else {
    const count = qaEvents?.length ?? 0;
    total += count;
    console.log(`  ${count > 0 ? "✓" : "–"} QA events: removed ${count}`);
  }

  console.log(`\n✅ Cleanup complete. Total rows removed: ${total}\n`);
}

cleanup().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
