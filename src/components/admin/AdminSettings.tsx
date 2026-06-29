"use client";

import { Button } from "@/components/shared/Button";
import { useCrmStore } from "@/lib/crm-store";

export function AdminSettings() {
  const portals = useCrmStore((state) => state.data.config.portals);
  const updateConfig = useCrmStore((state) => state.updateConfig);

  return (
    <div className="surface-card p-5">
      <h3 className="grotesk text-lg font-semibold">Instellingen</h3>
      <div className="mt-4 space-y-4">
        {[
          ["onboarding", "Onboardingsportaal"],
          ["facturatie", "Facturatieportaal"],
          ["review", "Reviewportaal"],
        ].map(([key, label]) => (
          <label key={key} className="space-y-1 text-sm">
            <span className="text-[var(--ink-soft)]">{label}</span>
            <input
              className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
              value={portals[key as keyof typeof portals]?.url ?? ""}
              onChange={(event) =>
                updateConfig((config) => {
                  config.portals[key as keyof typeof config.portals] = { url: event.target.value };
                })
              }
            />
          </label>
        ))}
      </div>
      <div className="mt-5">
        <Button variant="primary">Lokaal opgeslagen</Button>
      </div>
    </div>
  );
}
