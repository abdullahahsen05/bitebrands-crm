"use client";

import { useState } from "react";

import { Button } from "@/components/shared/Button";
import { PALETTE, ROLE_OPTIONS } from "@/lib/constants";
import { useCrmStore } from "@/lib/crm-store";

export function AdminUsers() {
  const users = useCrmStore((state) => state.data.users);
  const updateUsers = useCrmStore((state) => state.updateUsers);
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);

  return (
    <div className="surface-card p-5">
      <h3 className="grotesk text-lg font-semibold">Gebruikers</h3>
      <div className="mt-4 space-y-3">
        {users.map((user) => (
          <div key={user.id} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: user.color }} />
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-xs text-[var(--grey)]">{user.role}</div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  updateUsers((draft) => {
                    if (draft.length <= 1) return;
                    const index = draft.findIndex((entry) => entry.id === user.id);
                    draft.splice(index, 1);
                  })
                }
              >
                Verwijder
              </Button>
            </div>
            <select
              className="mt-3 h-10 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-sm"
              value={user.role}
              onChange={(event) =>
                updateUsers((draft) => {
                  const current = draft.find((entry) => entry.id === user.id);
                  if (current) {
                    current.role = event.target.value as typeof current.role;
                  }
                })
              }
            >
              {ROLE_OPTIONS.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <input className="h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nieuwe gebruiker" />
        <select className="h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
          {ROLE_OPTIONS.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
        <Button
          variant="primary"
          onClick={() => {
            if (!name) return;
            updateUsers((draft) => {
              draft.push({
                id: `u${Math.random().toString(36).slice(2, 7)}`,
                name,
                role,
                color: PALETTE[draft.length % PALETTE.length],
                pw: "demo",
              });
            });
            setName("");
          }}
        >
          Toevoegen
        </Button>
      </div>
    </div>
  );
}
