"use client";

import { filteredPartners, phaseOf } from "@/lib/calculations";
import { useCrmStore } from "@/lib/crm-store";

import { OnboardingColumn } from "./OnboardingColumn";

export function OnboardingBoard() {
  const data = useCrmStore((state) => state.data);
  const filters = useCrmStore((state) => state.ui.filters);
  const openPartner = useCrmStore((state) => state.openPartner);

  const visible = filteredPartners(data, filters);
  const groups = {
    new: visible.filter((partner) => phaseOf(partner, data.config) === "new"),
    prog: visible.filter((partner) => phaseOf(partner, data.config) === "prog"),
    live: visible.filter((partner) => phaseOf(partner, data.config) === "live"),
  };

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <OnboardingColumn
        title="Nieuw"
        phase="new"
        config={data.config}
        partners={groups.new}
        onOpen={openPartner}
      />
      <OnboardingColumn
        title="In onboarding"
        phase="prog"
        config={data.config}
        partners={groups.prog}
        onOpen={openPartner}
      />
      <OnboardingColumn
        title="Live"
        phase="live"
        config={data.config}
        partners={groups.live}
        onOpen={openPartner}
      />
    </div>
  );
}
