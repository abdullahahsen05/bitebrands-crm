"use client";

import { useCrmStore } from "@/lib/crm-store";
import type { Partner } from "@/lib/types";

export function PartnerProfileTab({ partner }: { partner: Partner }) {
  const config = useCrmStore((state) => state.data.config);
  const updatePartner = useCrmStore((state) => state.updatePartner);
  const togglePartnerConcept = useCrmStore((state) => state.togglePartnerConcept);

  const fieldClass =
    "h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 text-sm";

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--grey)]">
          Profiel
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-soft)]">Partnernaam</span>
            <input
              className={fieldClass}
              value={partner.name}
              onChange={(event) =>
                updatePartner(partner.id, (draft) => {
                  draft.name = event.target.value;
                })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-soft)]">Contactpersoon</span>
            <input
              className={fieldClass}
              value={partner.contact}
              onChange={(event) =>
                updatePartner(partner.id, (draft) => {
                  draft.contact = event.target.value;
                })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-soft)]">Stad</span>
            <input
              className={fieldClass}
              value={partner.city}
              onChange={(event) =>
                updatePartner(partner.id, (draft) => {
                  draft.city = event.target.value;
                })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-soft)]">Land</span>
            <select
              className={fieldClass}
              value={partner.country}
              onChange={(event) =>
                updatePartner(partner.id, (draft) => {
                  draft.country = event.target.value;
                })
              }
            >
              {config.countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-soft)]">Telefoon</span>
            <input
              className={fieldClass}
              value={partner.phone ?? ""}
              onChange={(event) =>
                updatePartner(partner.id, (draft) => {
                  draft.phone = event.target.value;
                })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-soft)]">E-mail</span>
            <input
              className={fieldClass}
              value={partner.email ?? ""}
              onChange={(event) =>
                updatePartner(partner.id, (draft) => {
                  draft.email = event.target.value;
                })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-soft)]">Fee %</span>
            <input
              type="number"
              className={fieldClass}
              value={partner.fee}
              onChange={(event) =>
                updatePartner(partner.id, (draft) => {
                  draft.fee = Number(event.target.value || 0);
                })
              }
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--grey)]">
          Concepten
        </h3>
        <div className="flex flex-wrap gap-2">
          {config.concepts.map((concept) => {
            const active = partner.concepts.includes(concept.id);
            return (
              <button
                key={concept.id}
                type="button"
                onClick={() => togglePartnerConcept(partner.id, concept.id)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "border-transparent text-white"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]"
                }`}
                style={active ? { backgroundColor: concept.color } : undefined}
              >
                {concept.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--grey)]">
          Extra velden
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {config.fields.map((field) => (
            <label key={field.id} className="space-y-1 text-sm">
              <span className="text-[var(--ink-soft)]">{field.label}</span>
              <input
                className={fieldClass}
                value={partner.custom[field.id] ?? ""}
                onChange={(event) =>
                  updatePartner(partner.id, (draft) => {
                    draft.custom[field.id] = event.target.value;
                  })
                }
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
