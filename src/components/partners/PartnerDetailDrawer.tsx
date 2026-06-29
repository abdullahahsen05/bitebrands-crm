"use client";

import { useState } from "react";

import { Drawer } from "@/components/shared/Drawer";
import { Tabs } from "@/components/shared/Tabs";
import { phaseOf } from "@/lib/calculations";
import { useCrmStore } from "@/lib/crm-store";

import { PartnerBillingTab } from "./PartnerBillingTab";
import { PartnerContactTab } from "./PartnerContactTab";
import { PartnerOnboardingTab } from "./PartnerOnboardingTab";
import { PartnerProfileTab } from "./PartnerProfileTab";
import { PartnerRegistrationTab } from "./PartnerRegistrationTab";

const tabItems = [
  { id: "profiel", label: "Profiel" },
  { id: "onboarding", label: "Onboarding" },
  { id: "aanmelding", label: "Aanmelding" },
  { id: "facturatie", label: "Facturatie" },
  { id: "contact", label: "Contact" },
];

export function PartnerDetailDrawer() {
  const [tab, setTab] = useState("profiel");
  const selectedPartnerId = useCrmStore((state) => state.ui.selectedPartnerId);
  const partner = useCrmStore((state) =>
    state.data.partners.find((entry) => entry.id === selectedPartnerId),
  );
  const config = useCrmStore((state) => state.data.config);
  const closePartner = useCrmStore((state) => state.closePartner);

  if (!partner) {
    return <Drawer open={false} title="" onClose={closePartner} />;
  }

  const country = config.countries.find((entry) => entry.code === partner.country);
  const phase = phaseOf(partner, config);

  return (
    <Drawer
      open={Boolean(partner)}
      title={partner.name}
      subtitle={
        <div className="flex flex-wrap items-center gap-2">
          <span>{country?.flag}</span>
          <span>{partner.city}</span>
          <span>·</span>
          <span>{partner.contact}</span>
          <span>·</span>
          <span className="font-semibold text-[var(--accent)]">
            {phase === "live" ? "Live" : phase === "prog" ? "In onboarding" : "Nieuw"}
          </span>
        </div>
      }
      onClose={closePartner}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {partner.concepts.map((conceptId) => {
            const concept = config.concepts.find((entry) => entry.id === conceptId);
            return (
              <span
                key={conceptId}
                className="rounded-md px-2 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: concept?.color ?? "#999" }}
              >
                {concept?.name}
              </span>
            );
          })}
        </div>

        <Tabs value={tab} onChange={setTab} items={tabItems} />

        {tab === "profiel" ? <PartnerProfileTab partner={partner} /> : null}
        {tab === "onboarding" ? <PartnerOnboardingTab partner={partner} /> : null}
        {tab === "aanmelding" ? <PartnerRegistrationTab partner={partner} /> : null}
        {tab === "facturatie" ? <PartnerBillingTab partner={partner} /> : null}
        {tab === "contact" ? <PartnerContactTab partner={partner} /> : null}
      </div>
    </Drawer>
  );
}
