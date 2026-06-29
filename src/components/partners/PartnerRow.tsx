"use client";

import { Badge } from "@/components/shared/Badge";
import { PHASE_META } from "@/lib/constants";
import { progressOf, phaseOf, verificationMissing } from "@/lib/calculations";
import { timeAgo } from "@/lib/formatters";
import type { CrmConfig, Partner } from "@/lib/types";

export function PartnerRow({
  partner,
  config,
  onOpen,
}: {
  partner: Partner;
  config: CrmConfig;
  onOpen: () => void;
}) {
  const phase = phaseOf(partner, config);
  const country = config.countries.find((entry) => entry.code === partner.country);
  const progress = progressOf(partner, config);
  const missing = verificationMissing(partner).length;
  const lastEvent = partner.events[0];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="surface-card grid w-full gap-4 px-5 py-4 text-left transition hover:border-[#d4cdc4] md:grid-cols-[1fr_auto_auto]"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-base font-semibold">{partner.name}</div>
          {missing ? <Badge tone="danger">verificatie {missing}x</Badge> : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--ink-soft)]">
          <span>{country?.flag}</span>
          <span>{partner.city}</span>
          <span>·</span>
          <span>{partner.contact}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {partner.concepts.map((conceptId) => {
            const concept = config.concepts.find((entry) => entry.id === conceptId);
            return (
              <span
                key={conceptId}
                className="rounded-md px-2 py-1 text-[11px] font-semibold text-white"
                style={{ backgroundColor: concept?.color ?? "#9A938C" }}
              >
                {concept?.name ?? conceptId}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {Array.from({ length: Math.max(progress, 1) }).slice(0, 8).map((_, index) => (
          <span
            key={index}
            className={`h-2 w-4 rounded-full ${index < progress ? "bg-[var(--green)]" : "bg-[var(--line)]"}`}
          />
        ))}
      </div>

      <div className="flex flex-col items-end gap-2">
        <Badge tone={phase === "live" ? "success" : phase === "prog" ? "warning" : "neutral"}>
          {PHASE_META[phase].label}
        </Badge>
        <span className="mono text-xs text-[var(--grey)]">
          {lastEvent ? timeAgo(lastEvent.at) : "nog geen contact"}
        </span>
      </div>
    </button>
  );
}
