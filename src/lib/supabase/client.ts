"use client";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Flag for the login page to detect missing configuration without crashing.
export const isSupabaseConfigured = Boolean(url && key);

// Singleton browser client — used throughout the CRM frontend.
// Falls back to placeholder strings so the module loads safely even when env vars
// are not set (the login page will show a config-error message in that case).
// TODO (security hardening): review key exposure and RLS before production.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
