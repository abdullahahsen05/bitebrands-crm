"use client";

import type { AdminTab } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const ALL_ITEMS: [AdminTab, string][] = [
  ["landen",       "Landen"],
  ["concepten",    "Concepten"],
  ["stappen",      "Stappen"],
  ["velden",       "Velden"],
  ["platforms",    "Platforms"],
  ["templates",    "Templates"],
  ["relaties",     "Relatiecategorieën"],
  ["users",        "Gebruikers"],
  ["instellingen", "Instellingen"],
];

export function AdminTabs({
  value,
  onChange,
  allowedTabs,
}: {
  value: string;
  onChange: (value: string) => void;
  allowedTabs: AdminTab[];
}) {
  const items = ALL_ITEMS.filter(([id]) => allowedTabs.includes(id));

  return (
    <div className="mb-5 flex gap-2 overflow-x-auto border-b border-[var(--line)]">
      {items.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "border-b-2 px-1 py-3 text-sm font-semibold whitespace-nowrap",
            value === id
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--ink-soft)]",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
