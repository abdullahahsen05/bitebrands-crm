"use client";

import { Toggle } from "@/components/shared/Toggle";
import { useCrmStore } from "@/lib/crm-store";
import type { Partner } from "@/lib/types";

import { PartnerFacturatieLinksSection } from "./PartnerFacturatieLinksSection";

export function PartnerBillingTab({ partner }: { partner: Partner }) {
  const config = useCrmStore((state) => state.data.config);
  const togglePartnerBillingFlag = useCrmStore((state) => state.togglePartnerBillingFlag);
  const setPartnerVerificationCode = useCrmStore((state) => state.setPartnerVerificationCode);

  return (
    <div className="space-y-4">
      {partner.concepts.map((conceptId) => {
        const concept = config.concepts.find((entry) => entry.id === conceptId);
        const billing = partner.billing[conceptId];

        return (
          <div key={conceptId} className="surface-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <div
                className="rounded-md px-2 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: concept?.color ?? "#999" }}
              >
                {concept?.name}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["invoiced", "In facturatie"],
                ["live", "Live"],
                ["verifDone", "Verificatie rond"],
              ].map(([field, label]) => (
                <div key={field} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
                  <div className="mb-3 text-sm font-semibold">{label}</div>
                  <Toggle
                    checked={Boolean(billing?.[field as "invoiced" | "live" | "verifDone"])}
                    onClick={() =>
                      togglePartnerBillingFlag(
                        partner.id,
                        conceptId,
                        field as "invoiced" | "live" | "verifDone",
                      )
                    }
                  />
                </div>
              ))}
            </div>

            <label className="mt-4 block space-y-1 text-sm">
              <span className="text-[var(--ink-soft)]">Verificatiecode</span>
              <input
                key={billing?.verif ?? ""}
                className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 mono md:max-w-xs"
                defaultValue={billing?.verif ?? ""}
                onBlur={(e) => setPartnerVerificationCode(partner.id, conceptId, e.target.value)}
              />
            </label>
          </div>
        );
      })}

      <PartnerFacturatieLinksSection partner={partner} />
    </div>
  );
}
