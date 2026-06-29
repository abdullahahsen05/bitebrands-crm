"use client";

import type { CrmConfig, Partner, PartnerPhase } from "@/lib/types";

import { OnboardingCard } from "./OnboardingCard";

export function OnboardingColumn({
  title,
  phase,
  config,
  partners,
  onOpen,
}: {
  title: string;
  phase: PartnerPhase;
  config: CrmConfig;
  partners: Partner[];
  onOpen: (partnerId: string) => void;
}) {
  return (
    <div className="surface-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="grotesk text-lg font-semibold">{title}</h3>
        <span className="mono text-xs text-[var(--grey)]">{partners.length}</span>
      </div>
      <div className="space-y-3">
        {partners.length ? (
          partners.map((partner) => (
            <OnboardingCard
              key={partner.id}
              partner={partner}
              config={config}
              onOpen={() => onOpen(partner.id)}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-8 text-center text-sm text-[var(--grey)]">
            Niemand in fase {phase}.
          </div>
        )}
      </div>
    </div>
  );
}
