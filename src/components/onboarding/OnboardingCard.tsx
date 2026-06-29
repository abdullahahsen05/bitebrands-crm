"use client";

import { requiredProgressOf } from "@/lib/calculations";
import type { CrmConfig, Partner } from "@/lib/types";

export function OnboardingCard({
  partner,
  config,
  onOpen,
}: {
  partner: Partner;
  config: CrmConfig;
  onOpen: () => void;
}) {
  const progress = requiredProgressOf(partner, config);
  const country = config.countries.find((entry) => entry.code === partner.country);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 text-left transition hover:bg-white"
    >
      <div className="font-semibold">{partner.name}</div>
      <div className="mt-2 text-sm text-[var(--ink-soft)]">
        {country?.flag} {partner.city} · {progress.done}/{progress.total}
      </div>
      <div className="mt-3 h-2 rounded-full bg-[var(--line)]">
        <div
          className="h-2 rounded-full bg-[var(--green)]"
          style={{
            width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
          }}
        />
      </div>
    </button>
  );
}
