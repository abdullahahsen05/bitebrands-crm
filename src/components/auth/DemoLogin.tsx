"use client";

import { useState } from "react";

import { Button } from "@/components/shared/Button";
import { useCrmStore } from "@/lib/crm-store";
import { initials } from "@/lib/formatters";

export function DemoLogin() {
  const users = useCrmStore((state) => state.data.users);
  const login = useCrmStore((state) => state.login);
  const loginError = useCrmStore((state) => state.loginError);
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id ?? "");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#3a322d,transparent_45%),linear-gradient(150deg,#2a2320,#1a1512)] px-4">
      <div className="w-full max-w-md rounded-[28px] bg-[var(--surface)] p-8 shadow-2xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl font-bold text-white">
          B
        </div>
        <h1 className="grotesk text-2xl font-semibold">Bite Brands Partner CRM</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Kies je demo-account en log in met <span className="mono font-medium">demo</span>.
        </p>

        <div className="mt-6 space-y-2">
          {users.map((user) => {
            const selected = selectedUserId === user.id;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedUserId(user.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--bg)]"
                }`}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {initials(user.name)}
                </div>
                <div>
                  <div className="font-semibold">{user.name}</div>
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
            if (event.key === "Enter") {
              login(selectedUserId, password);
            }
          }}
          placeholder="Wachtwoord"
          className="mt-5 h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4"
        />

        {loginError ? <p className="mt-3 text-sm text-[var(--red)]">{loginError}</p> : null}

        <Button
          variant="primary"
          className="mt-5 w-full"
          onClick={() => login(selectedUserId, password)}
        >
          Inloggen
        </Button>

        <p className="mt-5 text-center text-xs leading-6 text-[var(--grey)]">
          Prototype-login. Dit is alleen demo-auth voor de frontendfase.
        </p>
      </div>
    </div>
  );
}
