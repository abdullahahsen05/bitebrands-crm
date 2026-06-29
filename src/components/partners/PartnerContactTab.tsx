"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/shared/Button";
import { fillTemplate } from "@/lib/template-utils";
import { useCrmStore } from "@/lib/crm-store";
import { timeAgo } from "@/lib/formatters";
import type { Partner } from "@/lib/types";

export function PartnerContactTab({ partner }: { partner: Partner }) {
  const data = useCrmStore((state) => state.data);
  const addPartnerEvent = useCrmStore((state) => state.addPartnerEvent);
  const showToast = useCrmStore((state) => state.showToast);
  const [type, setType] = useState("note");
  const [text, setText] = useState("");

  const templates = useMemo(
    () => data.config.templates[partner.country] ?? [],
    [data.config.templates, partner.country],
  );

  return (
    <div className="space-y-5">
      <div className="surface-card space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            ["note", "Notitie"],
            ["call", "Telefoontje"],
            ["mail", "Mail"],
            ["wa", "WhatsApp"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                type === value
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--ink-soft)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <textarea
          rows={4}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Wat is er besproken?"
          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-3 text-sm"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--grey)]">Acties worden gelogd op naam van de huidige gebruiker.</span>
          <Button
            variant="primary"
            onClick={() => {
              if (!text.trim()) return;
              addPartnerEvent(partner.id, type, text.trim());
              setText("");
            }}
          >
            Vastleggen
          </Button>
        </div>
      </div>

      <div className="surface-card space-y-3 p-4">
        <h3 className="grotesk text-lg font-semibold">Berichtsjablonen</h3>
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                const conceptNames = partner.concepts.map(
                  (conceptId) =>
                    data.config.concepts.find((concept) => concept.id === conceptId)?.name ?? conceptId,
                );
                const countryName =
                  data.config.countries.find((country) => country.code === partner.country)?.name ?? partner.country;
                const message = fillTemplate(template.body, partner, { conceptNames, countryName });
                addPartnerEvent(partner.id, template.channel, `Sjabloon geopend: ${template.title}`);
                navigator.clipboard.writeText(message).catch(() => undefined);
                showToast(`Sjabloon gekopieerd: ${template.title}`);
              }}
              className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm font-medium"
            >
              {template.title}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {partner.events.map((event) => (
          <div key={event.id} className="surface-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{event.type}</div>
                <div className="mt-2 text-sm text-[var(--ink-soft)]">{event.text}</div>
              </div>
              <div className="text-right text-xs text-[var(--grey)]">
                <div>{event.by}</div>
                <div>{timeAgo(event.at)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
