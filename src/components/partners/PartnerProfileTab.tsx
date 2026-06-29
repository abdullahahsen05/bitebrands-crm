"use client";

import { useCrmStore } from "@/lib/crm-store";
import type { Partner } from "@/lib/types";

export function PartnerProfileTab({ partner }: { partner: Partner }) {
  const config = useCrmStore((state) => state.data.config);
  const updatePartner = useCrmStore((state) => state.updatePartner);
  const togglePartnerConcept = useCrmStore((state) => state.togglePartnerConcept);

  const fieldClass =
    "h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 text-sm";

  function blurField(field: keyof Partner, value: string | number) {
    updatePartner(partner.id, (draft) => {
      (draft as Record<string, unknown>)[field] = value;
    });
  }

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
              key={partner.name}
              className={fieldClass}
              defaultValue={partner.name}
              onBlur={(e) => blurField("name", e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-soft)]">Contactpersoon</span>
            <input
              key={partner.contact}
              className={fieldClass}
              defaultValue={partner.contact}
              onBlur={(e) => blurField("contact", e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-soft)]">Stad</span>
            <input
              key={partner.city}
              className={fieldClass}
              defaultValue={partner.city}
              onBlur={(e) => blurField("city", e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-soft)]">Land</span>
            <select
              className={fieldClass}
              value={partner.country}
              onChange={(e) => blurField("country", e.target.value)}
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
              key={partner.phone ?? ""}
              className={fieldClass}
              defaultValue={partner.phone ?? ""}
              onBlur={(e) => blurField("phone", e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-soft)]">E-mail</span>
            <input
              key={partner.email ?? ""}
              className={fieldClass}
              defaultValue={partner.email ?? ""}
              onBlur={(e) => blurField("email", e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-soft)]">Fee %</span>
            <input
              key={partner.fee}
              type="number"
              className={fieldClass}
              defaultValue={partner.fee}
              onBlur={(e) => blurField("fee", Number(e.target.value || 0))}
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
                key={partner.custom[field.id] ?? ""}
                className={fieldClass}
                defaultValue={partner.custom[field.id] ?? ""}
                onBlur={(e) =>
                  updatePartner(partner.id, (draft) => {
                    draft.custom[field.id] = e.target.value;
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
