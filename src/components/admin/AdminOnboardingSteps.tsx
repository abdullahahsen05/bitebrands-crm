"use client";

import { useState } from "react";

import { Button } from "@/components/shared/Button";
import { useCrmStore } from "@/lib/crm-store";

export function AdminOnboardingSteps() {
  const steps = useCrmStore((state) => state.data.config.steps);
  const updateConfig = useCrmStore((state) => state.updateConfig);
  const [name, setName] = useState("");
  const [sub, setSub] = useState("");
  const [optional, setOptional] = useState(false);
  const [general, setGeneral] = useState(false);

  return (
    <div className="surface-card p-5">
      <h3 className="grotesk text-lg font-semibold">Onboardingstappen</h3>
      <div className="mt-4 space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
            <div>
              <div className="font-semibold">{step.name}</div>
              <div className="text-xs text-[var(--grey)]">
                {step.sub || "Geen subtekst"} · {step.general ? "algemeen" : "concept"} · {step.optional ? "optioneel" : "verplicht"}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() =>
                updateConfig((config) => {
                  config.steps = config.steps.filter((entry) => entry.id !== step.id);
                })
              }
            >
              Verwijder
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <input className="h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Naam" />
        <input className="h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={sub} onChange={(e) => setSub(e.target.value)} placeholder="Subtekst" />
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={optional} onChange={(e) => setOptional(e.target.checked)} />
          Optioneel
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={general} onChange={(e) => setGeneral(e.target.checked)} />
          Algemeen
        </label>
      </div>
      <div className="mt-4">
        <Button
          variant="primary"
          onClick={() => {
            if (!name) return;
            updateConfig((config) => {
              config.steps.push({
                id: `s${Math.random().toString(36).slice(2, 7)}`,
                name,
                sub,
                optional,
                general,
              });
            });
            setName("");
            setSub("");
            setOptional(false);
            setGeneral(false);
          }}
        >
          Stap toevoegen
        </Button>
      </div>
    </div>
  );
}
