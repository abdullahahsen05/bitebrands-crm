"use client";

import { cn } from "@/lib/utils";

export function AdminTabs({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const items = [
    ["landen", "Landen"],
    ["concepten", "Concepten"],
    ["stappen", "Stappen"],
    ["velden", "Velden"],
    ["platforms", "Platforms"],
    ["templates", "Templates"],
    ["relaties", "Relatiecategorieën"],
    ["users", "Gebruikers"],
    ["instellingen", "Instellingen"],
  ];

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
