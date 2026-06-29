"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (value: string) => void;
  items: { id: string; label: string }[];
}) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-[var(--line)]">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            "border-b-2 px-1 py-3 text-sm font-semibold whitespace-nowrap transition",
            value === item.id
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
