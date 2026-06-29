"use client";

import { useState } from "react";

import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { useCrmStore } from "@/lib/crm-store";

export function AddTaskModal() {
  const modal = useCrmStore((state) => state.ui.modal);
  const data = useCrmStore((state) => state.data);
  const createTask = useCrmStore((state) => state.createTask);
  const closeModal = useCrmStore((state) => state.closeModal);

  const [form, setForm] = useState({
    title: "",
    desc: "",
    assigneeId: data.users[0]?.id ?? "",
    partnerId: "",
  });

  return (
    <Modal
      open={modal.type === "task"}
      title="Nieuwe taak"
      hint="Wijs een taak toe aan een collega."
      onClose={closeModal}
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={closeModal}>Annuleren</Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!form.title.trim()) return;
              createTask({
                title: form.title,
                desc: form.desc,
                assigneeId: form.assigneeId,
                partnerId: form.partnerId || null,
              });
              setForm({
                title: "",
                desc: "",
                assigneeId: data.users[0]?.id ?? "",
                partnerId: "",
              });
            }}
          >
            Opslaan
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <label className="space-y-1 text-sm">
          <span className="text-[var(--ink-soft)]">Titel</span>
          <input
            className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-[var(--ink-soft)]">Omschrijving</span>
          <textarea
            rows={4}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-3"
            value={form.desc}
            onChange={(event) => setForm((current) => ({ ...current, desc: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-[var(--ink-soft)]">Toewijzen aan</span>
          <select
            className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
            value={form.assigneeId}
            onChange={(event) => setForm((current) => ({ ...current, assigneeId: event.target.value }))}
          >
            {data.users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-[var(--ink-soft)]">Koppel aan partner</span>
          <select
            className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
            value={form.partnerId}
            onChange={(event) => setForm((current) => ({ ...current, partnerId: event.target.value }))}
          >
            <option value="">Geen</option>
            {data.partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Modal>
  );
}
