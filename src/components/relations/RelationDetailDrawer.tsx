"use client";

import { useState } from "react";

import { Button } from "@/components/shared/Button";
import { Drawer } from "@/components/shared/Drawer";
import { useCrmStore } from "@/lib/crm-store";
import { timeAgo } from "@/lib/formatters";

export function RelationDetailDrawer() {
  const [text, setText] = useState("");
  const [type, setType] = useState("note");
  const selectedRelationId = useCrmStore((state) => state.ui.selectedRelationId);
  const relation = useCrmStore((state) =>
    state.data.relations.find((entry) => entry.id === selectedRelationId),
  );
  const updateRelation = useCrmStore((state) => state.updateRelation);
  const addRelationEvent = useCrmStore((state) => state.addRelationEvent);
  const closeRelation = useCrmStore((state) => state.closeRelation);

  if (!relation) {
    return <Drawer open={false} title="" onClose={closeRelation} />;
  }

  return (
    <Drawer open={Boolean(relation)} title={relation.name} subtitle={relation.category} onClose={closeRelation}>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["contact", "Contactpersoon", relation.contact ?? ""],
            ["phone", "Telefoon", relation.phone ?? ""],
            ["email", "E-mail", relation.email ?? ""],
            ["website", "Website", relation.website ?? ""],
          ].map(([field, label, value]) => (
            <label key={field} className="space-y-1 text-sm">
              <span className="text-[var(--ink-soft)]">{label}</span>
              <input
                className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
                value={value}
                onChange={(event) =>
                  updateRelation(relation.id, (draft) => {
                    draft[field as "contact" | "phone" | "email" | "website"] = event.target.value;
                  })
                }
              />
            </label>
          ))}
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="text-[var(--ink-soft)]">Notities</span>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-3"
              value={relation.notes ?? ""}
              onChange={(event) =>
                updateRelation(relation.id, (draft) => {
                  draft.notes = event.target.value;
                })
              }
            />
          </label>
        </div>

        <div className="surface-card space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            {[
              ["note", "Notitie"],
              ["call", "Call"],
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
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-3"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Log een contactmoment"
          />
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => {
                if (!text.trim()) return;
                addRelationEvent(relation.id, type, text.trim());
                setText("");
              }}
            >
              Vastleggen
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {relation.events.map((event) => (
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
    </Drawer>
  );
}
