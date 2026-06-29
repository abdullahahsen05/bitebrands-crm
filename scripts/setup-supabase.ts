/**
 * Bite Brands CRM — Supabase Setup Script
 *
 * Creates demo auth users and inserts seed data that requires auth UUIDs.
 *
 * Requirements:
 *   - Run 001_initial_schema.sql + seed.sql in Supabase SQL editor first.
 *   - Set SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *   - Run: npx tsx scripts/setup-supabase.ts
 *
 * This script is idempotent — safe to re-run (skips existing users).
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  console.error("Add SUPABASE_SERVICE_ROLE_KEY= to .env.local (never commit this).");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_USERS = [
  { id: "u1", name: "Huib",  role: "Beheerder",         color: "#C4703E", email: "huib@bitebrands.demo",  password: "demo" },
  { id: "u2", name: "Sanne", role: "Facturatie-manager", color: "#6B7E3E", email: "sanne@bitebrands.demo", password: "demo" },
  { id: "u3", name: "Kerem", role: "Sales",              color: "#3E6B7E", email: "kerem@bitebrands.demo", password: "demo" },
  { id: "u4", name: "Noor",  role: "Operations",         color: "#7E3E6B", email: "noor@bitebrands.demo",  password: "demo" },
  { id: "u5", name: "Lotte", role: "Marketing",          color: "#3E7E6B", email: "lotte@bitebrands.demo", password: "demo" },
] as const;

type UserRecord = { legacyId: string; uuid: string; name: string };

async function createAuthUsers(): Promise<UserRecord[]> {
  const records: UserRecord[] = [];

  for (const user of DEMO_USERS) {
    // Check if user already exists
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users.find((u) => u.email === user.email);

    let uuid: string;

    if (found) {
      console.log(`  ✓ Auth user already exists: ${user.email} (${found.id})`);
      uuid = found.id;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { name: user.name, role: user.role },
      });

      if (error) {
        console.error(`  ✗ Failed to create auth user ${user.email}:`, error.message);
        process.exit(1);
      }

      uuid = data.user!.id;
      console.log(`  + Created auth user: ${user.email} (${uuid})`);
    }

    // Upsert profile
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: uuid,
      name: user.name,
      role: user.role,
      color: user.color,
    });

    if (profileError) {
      console.error(`  ✗ Failed to upsert profile for ${user.name}:`, profileError.message);
      process.exit(1);
    }

    records.push({ legacyId: user.id, uuid, name: user.name });
  }

  return records;
}

async function seedTaskAssignees(users: UserRecord[]) {
  const byName = (name: string) => users.find((u) => u.name === name)?.uuid ?? null;

  const taskUpdates: { id: string; assignee_id: string | null; created_by_id: string | null; done_at?: string }[] = [
    { id: "t1", assignee_id: byName("Sanne"), created_by_id: byName("Huib") },
    { id: "t2", assignee_id: byName("Kerem"), created_by_id: byName("Huib") },
    { id: "t3", assignee_id: byName("Noor"),  created_by_id: byName("Noor"), done_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString() },
  ];

  for (const t of taskUpdates) {
    const { error } = await supabase
      .from("tasks")
      .update({ assignee_id: t.assignee_id, created_by_id: t.created_by_id })
      .eq("id", t.id);

    if (error) console.error(`  ✗ Failed to update task ${t.id}:`, error.message);
    else console.log(`  ✓ Task ${t.id} assignee wired`);
  }
}

async function seedChatMessages(users: UserRecord[]) {
  const byName = (name: string) => users.find((u) => u.name === name)?.uuid ?? null;

  const now = Date.now();
  const hour = 3600000;

  const messages = [
    { id: "c1", by_user_id: byName("Kerem"), by_user_name: "Kerem", text: "Heb net 3 nieuwe leads in Antwerpen toegevoegd.",          created_at: new Date(now - 7 * hour).toISOString() },
    { id: "c2", by_user_id: byName("Huib"),  by_user_name: "Huib",  text: "Top! Sanne, kun jij de facturatie voor Tilburg checken?", created_at: new Date(now - 6 * hour).toISOString() },
    { id: "c3", by_user_id: byName("Sanne"), by_user_name: "Sanne", text: "Ja, ik pak het vanmiddag op.",                           created_at: new Date(now - 5 * hour).toISOString() },
  ];

  const { error } = await supabase.from("chat_messages").upsert(messages, { onConflict: "id" });

  if (error) console.error("  ✗ Failed to seed chat messages:", error.message);
  else console.log(`  ✓ Seeded ${messages.length} chat messages`);
}

async function main() {
  console.log("\n🚀 Bite Brands CRM — Supabase Setup\n");

  console.log("1. Creating auth users and profiles...");
  const users = await createAuthUsers();

  console.log("\n2. Wiring task assignees...");
  await seedTaskAssignees(users);

  console.log("\n3. Seeding chat messages...");
  await seedChatMessages(users);

  console.log("\n✅ Setup complete!\n");
  console.log("User UUID mapping:");
  for (const u of users) {
    console.log(`  ${u.name.padEnd(8)} → ${u.uuid}`);
  }
  console.log();
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
