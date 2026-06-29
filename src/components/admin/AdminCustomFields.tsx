"use client";

import { useState } from "react";

import { Button } from "@/components/shared/Button";
import { useCrmStore } from "@/lib/crm-store";

export function AdminCustomFields() {
  const fields = useCrmStore((state) => state.data.config.fields);
  const updateConfig = useCrmStore((state) => state.updateConfig);
  const [label, setLabel] = useState("");
  const [type, setType] = useState("text");

  return (
    <div className="surface-card p-5">
      <h3 className="grotesk text-lg font-semibold">Custom fields</h3>
      <div className="mt-4 space-y-3">
        {fields.map((field) => (
          <div key={field.id} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
            <div>
              <div className="font-semibold">{field.label}</div>
              <div className="text-xs text-[var(--grey)]">{field.type}</div>
            </div>
            <Button size="sm" onClick={() => updateConfig((config) => { config.fields = config.fields.filter((entry) => entry.id !== field.id); })}>
              Verwijder
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <input className="h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" />
        <select className="h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={type} onChange={(e) => setType(e.target.value)}>
          {["text", "number", "email", "url", "date"].map((entry) => (
            <option key={entry} value={entry}>{entry}</option>
          ))}
        </select>
        <Button
          variant="primary"
          onClick={() => {
            if (!label) return;
            updateConfig((config) => {
              config.fields.push({ id: `f${Math.random().toString(36).slice(2, 7)}`, label, type });
            });
            setLabel("");
          }}
        >
          Toevoegen
        </Button>
      </div>
    </div>
  );
}
