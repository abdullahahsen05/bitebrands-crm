"use client";

import { Toggle } from "@/components/shared/Toggle";
import { useCrmStore } from "@/lib/crm-store";
import type { Partner } from "@/lib/types";

export function PartnerRegistrationTab({ partner }: { partner: Partner }) {
  const config = useCrmStore((state) => state.data.config);
  const updatePartnerPlatform = useCrmStore((state) => state.updatePartnerPlatform);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[var(--amber-soft)] px-4 py-3 text-sm text-[var(--amber)]">
        Demo-credentials alleen voor frontend. TODO: vervang later door veilige opslag in de backend/securityfase.
      </div>

      {config.platforms.map((platform) => {
        const values = partner.platforms[platform.id];
        return (
          <div key={platform.id} className="surface-card p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="font-semibold">{platform.name}</div>
              <div className="ml-auto">
                <Toggle
                  checked={Boolean(values?.active)}
                  onClick={() =>
                    updatePartnerPlatform(partner.id, platform.id, (draft) => {
                      draft.active = !draft.active;
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {platform.kind === "delivery" ? (
                <>
                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--ink-soft)]">Login</span>
                    <input
                      key={values?.login ?? ""}
                      className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
                      defaultValue={values?.login ?? ""}
                      onBlur={(e) =>
                        updatePartnerPlatform(partner.id, platform.id, (draft) => {
                          draft.login = e.target.value;
                        })
                      }
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--ink-soft)]">Partner-ID</span>
                    <input
                      key={values?.partnerId ?? ""}
                      className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
                      defaultValue={values?.partnerId ?? ""}
                      onBlur={(e) =>
                        updatePartnerPlatform(partner.id, platform.id, (draft) => {
                          draft.partnerId = e.target.value;
                        })
                      }
                    />
                  </label>
                  <label className="space-y-1 text-sm md:col-span-2">
                    <span className="text-[var(--ink-soft)]">Wachtwoord</span>
                    <input
                      key={values?.pass ?? ""}
                      className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 mono"
                      defaultValue={values?.pass ?? ""}
                      onBlur={(e) =>
                        updatePartnerPlatform(partner.id, platform.id, (draft) => {
                          draft.pass = e.target.value;
                        })
                      }
                    />
                  </label>
                </>
              ) : (
                <label className="space-y-1 text-sm md:col-span-2">
                  <span className="text-[var(--ink-soft)]">URL</span>
                  <input
                    key={values?.url ?? ""}
                    className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
                    defaultValue={values?.url ?? ""}
                    onBlur={(e) =>
                      updatePartnerPlatform(partner.id, platform.id, (draft) => {
                        draft.url = e.target.value;
                      })
                    }
                  />
                </label>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
