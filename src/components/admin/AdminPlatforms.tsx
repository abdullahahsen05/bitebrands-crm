"use client";

import { useState } from "react";

import { Button } from "@/components/shared/Button";
import { useCrmStore } from "@/lib/crm-store";

export function AdminPlatforms() {
  const platforms = useCrmStore((state) => state.data.config.platforms);
  const updateConfig = useCrmStore((state) => state.updateConfig);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"delivery" | "web">("delivery");

  return (
    <div className="surface-card p-5">
      <h3 className="grotesk text-lg font-semibold">Platforms</h3>
      <div className="mt-4 space-y-3">
        {platforms.map((platform) => (
          <div key={platform.id} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
            <div>
              <div className="font-semibold">{platform.name}</div>
              <div className="text-xs text-[var(--grey)]">{platform.kind}</div>
            </div>
            <Button size="sm" onClick={() => updateConfig((config) => { config.platforms = config.platforms.filter((entry) => entry.id !== platform.id); })}>
              Verwijder
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_auto]">
        <input className="h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Naam" />
        <select className="h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={kind} onChange={(e) => setKind(e.target.value as "delivery" | "web")}>
          <option value="delivery">delivery</option>
          <option value="web">web</option>
        </select>
        <Button
          variant="primary"
          onClick={() => {
            if (!name) return;
            updateConfig((config) => {
              config.platforms.push({ id: `p${Math.random().toString(36).slice(2, 7)}`, name, kind });
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
