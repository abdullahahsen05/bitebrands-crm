"use client";

import { Toggle } from "@/components/shared/Toggle";
import { requiredProgressOf } from "@/lib/calculations";
import { useCrmStore } from "@/lib/crm-store";
import type { Partner } from "@/lib/types";

export function PartnerOnboardingTab({ partner }: { partner: Partner }) {
  const config = useCrmStore((state) => state.data.config);
  const toggleGeneralStep = useCrmStore((state) => state.toggleGeneralStep);
  const toggleConceptStep = useCrmStore((state) => state.toggleConceptStep);
  const progress = requiredProgressOf(partner, config);
  const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="surface-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="grotesk text-lg font-semibold">Voortgang</h3>
            <p className="text-sm text-[var(--ink-soft)]">
              Verplichte stappen: {progress.done}/{progress.total}
            </p>
          </div>
          <span className="mono text-sm text-[var(--grey)]">{percent}%</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--line)]">
          <div
            className="h-2 rounded-full bg-[var(--green)] transition"
            style={{ width: `${percent}%` }}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--grey)]">
          Algemene stappen
        </h3>
        {config.steps
          .filter((step) => step.general)
          .map((step) => (
            <div key={step.id} className="surface-card flex items-center gap-4 p-4">
              <Toggle
                checked={Boolean(partner.general[step.id])}
                onClick={() => toggleGeneralStep(partner.id, step.id)}
              />
              <div>
                <div className="font-semibold">{step.name}</div>
                {step.sub ? <div className="text-sm text-[var(--ink-soft)]">{step.sub}</div> : null}
              </div>
            </div>
          ))}
      </section>

      {partner.concepts.map((conceptId) => {
        const concept = config.concepts.find((entry) => entry.id === conceptId);
        return (
          <section key={conceptId} className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--grey)]">
              {concept?.name}
            </h3>
            {config.steps
              .filter((step) => !step.general)
              .map((step) => (
                <div key={step.id} className="surface-card flex items-center gap-4 p-4">
                  <Toggle
                    checked={Boolean(partner.steps[conceptId]?.[step.id])}
                    onClick={() => toggleConceptStep(partner.id, conceptId, step.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-semibold">
                      <span>{step.name}</span>
                      {step.optional ? (
                        <span className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--grey)]">
                          optioneel
                        </span>
                      ) : null}
                    </div>
                    {step.sub ? <div className="text-sm text-[var(--ink-soft)]">{step.sub}</div> : null}
                  </div>
                </div>
              ))}
          </section>
        );
      })}
    </div>
  );
}
