/**
 * Update portal URLs in a live Supabase project.
 *
 * Run once against the production/staging project after changing portal domains:
 *   npm run update:portals
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PORTALS = [
  { key: "portal_onboarding", url: "https://aanmelden.bitebrands.nl" },
  { key: "portal_facturatie",  url: "https://facturatie.bitebrands.nl" },
  { key: "portal_review",      url: "https://reviews.bitebrands.nl" },
];

async function main() {
  console.log("\n🔗 Updating portal URLs in Supabase settings...\n");

  for (const { key, url } of PORTALS) {
    const { error } = await supabase
      .from("settings")
      .upsert({ key, value: { url } }, { onConflict: "key" });

    if (error) {
      console.error(`  ✗ ${key}:`, error.message);
    } else {
      console.log(`  ✓ ${key} → ${url}`);
    }
  }

  // Verify
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", PORTALS.map((p) => p.key));

  console.log("\nVerification:");
  for (const row of data ?? []) {
    console.log(`  ${row.key}: ${JSON.stringify(row.value)}`);
  }

  console.log("\n✅ Done.\n");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
