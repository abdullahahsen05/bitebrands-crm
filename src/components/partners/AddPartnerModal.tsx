"use client";

import { useState } from "react";

import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { useCrmStore } from "@/lib/crm-store";

export function AddPartnerModal() {
  const modal = useCrmStore((state) => state.ui.modal);
  const config = useCrmStore((state) => state.data.config);
  const createPartner = useCrmStore((state) => state.createPartner);
  const closeModal = useCrmStore((state) => state.closeModal);

  const [form, setForm] = useState({
    name: "",
    contact: "",
    city: "",
    country: config.countries[0]?.code ?? "NL",
    phone: "",
    email: "",
    concepts: [] as string[],
  });

  return (
    <Modal
      open={modal.type === "partner"}
      title="Nieuwe partner"
      hint="Voeg een nieuwe franchise- of restaurantpartner toe."
      onClose={closeModal}
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={closeModal}>Annuleren</Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!form.name || !form.concepts.length) {
                return;
              }
              createPartner(form);
              setForm({
                name: "",
                contact: "",
                city: "",
                country: config.countries[0]?.code ?? "NL",
                phone: "",
                email: "",
                concepts: [],
              });
            }}
          >
            Opslaan
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-[var(--ink-soft)]">Partnernaam</span>
          <input
            className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-[var(--ink-soft)]">Contactpersoon</span>
          <input
            className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
            value={form.contact}
            onChange={(event) => setForm((current) => ({ ...current, contact: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-[var(--ink-soft)]">Stad</span>
          <input
            className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
            value={form.city}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-[var(--ink-soft)]">Land</span>
          <select
            className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
            value={form.country}
            onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
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
            className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-[var(--ink-soft)]">E-mail</span>
          <input
            className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-[var(--ink-soft)]">Concepten</div>
        <div className="flex flex-wrap gap-2">
          {config.concepts.map((concept) => {
            const active = form.concepts.includes(concept.id);
            return (
              <button
                key={concept.id}
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    concepts: active
                      ? current.concepts.filter((entry) => entry !== concept.id)
                      : [...current.concepts, concept.id],
                  }))
                }
                className={`rounded-xl border px-3 py-2 text-sm ${
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
      </div>
    </Modal>
  );
}
