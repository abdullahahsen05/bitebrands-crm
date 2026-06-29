"use client";

import { useState } from "react";

import { Button } from "@/components/shared/Button";
import { PALETTE } from "@/lib/constants";
import { useCrmStore } from "@/lib/crm-store";

export function AdminConcepts() {
  const concepts = useCrmStore((state) => state.data.config.concepts);
  const partners = useCrmStore((state) => state.data.partners);
  const updateConfig = useCrmStore((state) => state.updateConfig);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);

  return (
    <div className="surface-card p-5">
      <h3 className="grotesk text-lg font-semibold">Concepten</h3>
      <div className="mt-4 space-y-3">
        {concepts.map((concept) => (
          <div key={concept.id} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: concept.color }} />
              <div className="font-semibold">{concept.name}</div>
            </div>
            <Button
              size="sm"
              onClick={() =>
                updateConfig((config) => {
                  if (partners.some((partner) => partner.concepts.includes(concept.id))) return;
                  config.concepts = config.concepts.filter((entry) => entry.id !== concept.id);
                })
              }
            >
              Verwijder
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <input className="h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nieuw concept" />
        <Button
          variant="primary"
          onClick={() => {
            if (!name) return;
            updateConfig((config) => {
              config.concepts.push({ id: `c${Math.random().toString(36).slice(2, 7)}`, name, color });
            });
            setName("");
          }}
        >
          Toevoegen
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {PALETTE.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setColor(entry)}
            className={`h-8 w-8 rounded-lg border-2 ${color === entry ? "border-[var(--ink)]" : "border-transparent"}`}
            style={{ backgroundColor: entry }}
          />
        ))}
      </div>
    </div>
  );
}
