"use client";

import { filteredPartners, kpiSummary } from "@/lib/calculations";
import { useCrmStore } from "@/lib/crm-store";
import { canSeeBillingAlerts } from "@/lib/permissions";
import { AlertBox } from "@/components/shared/AlertBox";
import { EmptyState } from "@/components/shared/EmptyState";
import { KpiCards } from "@/components/shared/KpiCards";

import { PartnerFilters } from "./PartnerFilters";
import { PartnerRow } from "./PartnerRow";

export function PartnerList() {
  const data = useCrmStore((state) => state.data);
  const filters = useCrmStore((state) => state.ui.filters);
  const openPartner = useCrmStore((state) => state.openPartner);
  const currentUser =
    data.users.find((user) => user.id === data.currentUserId) ?? data.users[0];

  const partners = filteredPartners(data, filters).sort((a, b) => a.name.localeCompare(b.name));
  const kpis = kpiSummary(data, filters);

  const missingVerification = partners.flatMap((partner) =>
    partner.concepts
      .filter((conceptId) => partner.billing[conceptId]?.live && !partner.billing[conceptId]?.verifDone)
      .map((conceptId) => ({
        partnerId: partner.id,
        partnerName: partner.name,
        conceptName:
          data.config.concepts.find((concept) => concept.id === conceptId)?.name ?? conceptId,
      })),
  );

  const missingBilling = partners.flatMap((partner) =>
    partner.concepts
      .filter((conceptId) => partner.billing[conceptId]?.live && !partner.billing[conceptId]?.invoiced)
      .map((conceptId) => ({
        partnerId: partner.id,
        partnerName: partner.name,
        conceptName:
          data.config.concepts.find((concept) => concept.id === conceptId)?.name ?? conceptId,
      })),
  );

  return (
    <div className="space-y-4">
      {canSeeBillingAlerts(currentUser) && missingVerification.length > 0 ? (
        <AlertBox title="Live maar verificatie ontbreekt" tone="critical" count={missingVerification.length}>
          <ul className="space-y-1">
            {missingVerification.map((item) => (
              <li key={`${item.partnerId}-${item.conceptName}`}>
                {item.partnerName} - {item.conceptName}
              </li>
            ))}
          </ul>
        </AlertBox>
      ) : null}

      {canSeeBillingAlerts(currentUser) && missingBilling.length > 0 ? (
        <AlertBox title="Live maar nog niet in facturatie" count={missingBilling.length}>
          <ul className="space-y-1">
            {missingBilling.map((item) => (
              <li key={`${item.partnerId}-${item.conceptName}`}>
                {item.partnerName} - {item.conceptName}
              </li>
            ))}
          </ul>
        </AlertBox>
      ) : null}

      <KpiCards
        items={[
          { label: "Partners zichtbaar", value: kpis.totalPartners, accent: true },
          { label: "Live", value: kpis.livePartners },
          { label: "In onboarding", value: kpis.onboardingPartners },
          { label: "Verificatie mist", value: kpis.missingVerification },
        ]}
      />

      <div className="surface-card space-y-4 p-5">
        <PartnerFilters />
        <div className="space-y-3">
          {partners.length ? (
            partners.map((partner) => (
              <PartnerRow
                key={partner.id}
                partner={partner}
                config={data.config}
                onOpen={() => openPartner(partner.id)}
              />
            ))
          ) : (
            <EmptyState
              title="Geen partners gevonden"
              body="Pas je filters aan of voeg een partner toe."
            />
          )}
        </div>
      </div>
    </div>
  );
}
