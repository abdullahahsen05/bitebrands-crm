"use client";

import { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/shared/Button";
import { PALETTE } from "@/lib/constants";
import { useCrmStore } from "@/lib/crm-store";
import { initials } from "@/lib/formatters";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types";

// Demo user list shown before login.
// After login these come from the Supabase profiles table.
// Passwords are all "demo" — accounts are created by scripts/setup-supabase.ts.
const DEMO_USERS_PICKER = [
  { id: "u1", name: "Huib",  role: "Beheerder"         as UserRole, color: PALETTE[2] },
  { id: "u2", name: "Sanne", role: "Facturatie-manager" as UserRole, color: PALETTE[3] },
  { id: "u3", name: "Kerem", role: "Sales"              as UserRole, color: PALETTE[4] },
  { id: "u4", name: "Noor",  role: "Operations"         as UserRole, color: PALETTE[6] },
  { id: "u5", name: "Lotte", role: "Marketing"          as UserRole, color: PALETTE[8] },
] satisfies { id: string; name: string; role: UserRole; color: string }[];

const BG = "bg-[radial-gradient(circle_at_top,#3a322d,transparent_45%),linear-gradient(150deg,#2a2320,#1a1512)]";

export function DemoLogin() {
  const login = useCrmStore((state) => state.login);
  const loginError = useCrmStore((state) => state.loginError);
  const loading = useCrmStore((state) => state.loading);
  const [selectedUserId, setSelectedUserId] = useState<string>(DEMO_USERS_PICKER[0].id);
  const [password, setPassword] = useState("");
  const [logoFailed, setLogoFailed] = useState(false);

  async function handleLogin() {
    if (loading) return;
    await login(selectedUserId, password);
  }

  if (!isSupabaseConfigured) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${BG} px-4`}>
        <div className="w-full max-w-sm rounded-[24px] bg-[var(--surface)] p-6 shadow-2xl text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl font-bold text-white">
              B
            </div>
          </div>
          <h1 className="grotesk text-lg font-semibold">Configuratiefout</h1>
          <p className="text-sm text-[var(--red)]">
            Supabase environment variables are missing. Configure{" "}
            <code className="mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel and redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen items-center justify-center ${BG} px-4`}>
      <div className="w-full max-w-sm rounded-[24px] bg-[var(--surface)] p-6 shadow-2xl">

        {/* Branding */}
        <div className="mb-4 flex flex-col items-center gap-1 text-center">
          {logoFailed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)] text-xl font-bold text-white">
              B
            </div>
          ) : (
            <div className="relative h-[64px] w-[160px]">
              <Image
                src="/logos/bite-brands-logo.png"
                alt="Bite Brands"
                fill
                sizes="160px"
                className="object-contain"
                onError={() => setLogoFailed(true)}
                priority
              />
            </div>
          )}
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
            Partner CRM
          </p>
        </div>

        <h1 className="grotesk text-lg font-semibold">Inloggen</h1>
        <p className="mt-1 text-xs text-[var(--ink-soft)]">
          Kies je account en log in met wachtwoord{" "}
          <span className="mono font-medium">demo</span>.
        </p>

        <div className="mt-4 space-y-1.5">
          {DEMO_USERS_PICKER.map((user) => {
            const selected = selectedUserId === user.id;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedUserId(user.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--bg)]"
                }`}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {initials(user.name)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{user.name}</div>
                  <div className="text-xs text-[var(--grey)]">{user.role}</div>
                </div>
              </button>
            );
          })}
        </div>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void handleLogin();
          }}
          placeholder="Wachtwoord"
          className="mt-4 h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 text-sm"
          disabled={loading}
        />

        {loginError ? <p className="mt-2 text-xs text-[var(--red)]">{loginError}</p> : null}

        <Button
          variant="primary"
          className="mt-4 w-full"
          onClick={() => void handleLogin()}
          disabled={loading}
        >
          {loading ? "Inloggen…" : "Inloggen"}
        </Button>

        <p className="mt-4 text-center text-xs leading-5 text-[var(--grey)]">
          Demo-accounts via Supabase Auth. Wachtwoord: <span className="mono">demo</span>
        </p>
      </div>
    </div>
  );
}
