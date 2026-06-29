"use client";

import { useCrmStore } from "@/lib/crm-store";

type PortalKey = "onboarding" | "facturatie" | "review";

const PORTAL_LABELS: Record<PortalKey, string> = {
  onboarding: "Onboardingsportaal",
  facturatie:  "Facturatieportaal",
  review:      "Reviewportaal",
};

export function AdminSettings() {
  const portals = useCrmStore((state) => state.data.config.portals);
  const updateConfig = useCrmStore((state) => state.updateConfig);

  return (
    <div className="surface-card p-5">
      <h3 className="grotesk text-lg font-semibold">Instellingen</h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        Portaal-URL&apos;s worden opgeslagen bij het verlaten van het veld.
      </p>
      <div className="mt-4 space-y-4">
        {(["onboarding", "facturatie", "review"] as PortalKey[]).map((key) => (
          <label key={key} className="space-y-1 text-sm">
            <span className="text-[var(--ink-soft)]">{PORTAL_LABELS[key]}</span>
            {/* Uncontrolled input — key forces remount when portals reload externally.
                onBlur fires syncConfigDiff once (not on every keystroke). */}
            <input
              key={portals[key]?.url ?? ""}
              className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
              defaultValue={portals[key]?.url ?? ""}
              onBlur={(event) =>
                updateConfig((config) => {
                  config.portals[key] = { url: event.target.value };
                })
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
}
