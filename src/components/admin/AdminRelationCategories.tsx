"use client";

import { useState } from "react";

import { Button } from "@/components/shared/Button";
import { useCrmStore } from "@/lib/crm-store";

export function AdminRelationCategories() {
  const relationCategories = useCrmStore((state) => state.data.config.relationCategories);
  const relations = useCrmStore((state) => state.data.relations);
  const updateConfig = useCrmStore((state) => state.updateConfig);
  const [name, setName] = useState("");

  return (
    <div className="surface-card p-5">
      <h3 className="grotesk text-lg font-semibold">Relatiecategorieën</h3>
      <div className="mt-4 space-y-3">
        {relationCategories.map((category) => (
          <div key={category} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
            <div className="font-semibold">{category}</div>
            <Button
              size="sm"
              onClick={() =>
                updateConfig((config) => {
                  if (relations.some((relation) => relation.category === category)) return;
                  config.relationCategories = config.relationCategories.filter((entry) => entry !== category);
                })
              }
            >
              Verwijder
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-5 flex gap-3">
        <input className="h-10 flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nieuwe categorie" />
        <Button
          variant="primary"
          onClick={() => {
            if (!name) return;
            updateConfig((config) => {
              if (!config.relationCategories.includes(name)) {
                config.relationCategories.push(name);
              }
            });
            setName("");
          }}
        >
          Toevoegen
        </Button>
      </div>
    </div>
  );
}
