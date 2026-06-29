"use client";

import { useState } from "react";

import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { useCrmStore } from "@/lib/crm-store";

export function AddRelationModal() {
  const modal = useCrmStore((state) => state.ui.modal);
  const config = useCrmStore((state) => state.data.config);
  const createRelation = useCrmStore((state) => state.createRelation);
  const closeModal = useCrmStore((state) => state.closeModal);

  const [form, setForm] = useState({
    name: "",
    category: config.relationCategories[0] ?? "Overig",
    contact: "",
    phone: "",
    email: "",
    website: "",
    notes: "",
  });

  return (
    <Modal
      open={modal.type === "relation"}
      title="Nieuwe relatie"
      hint="Bijvoorbeeld een kassaleverancier, groothandel of bureau."
      onClose={closeModal}
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={closeModal}>Annuleren</Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!form.name) return;
              createRelation(form);
              setForm({
                name: "",
                category: config.relationCategories[0] ?? "Overig",
                contact: "",
                phone: "",
                email: "",
                website: "",
                notes: "",
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
          <span className="text-[var(--ink-soft)]">Naam</span>
          <input
            className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-[var(--ink-soft)]">Categorie</span>
          <select
            className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
          >
            {config.relationCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
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
        <label className="space-y-1 text-sm">
          <span className="text-[var(--ink-soft)]">Website</span>
          <input
            className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
            value={form.website}
            onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
          />
        </label>
      </div>
      <label className="space-y-1 text-sm">
        <span className="text-[var(--ink-soft)]">Notities</span>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-3"
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
        />
      </label>
    </Modal>
  );
}
