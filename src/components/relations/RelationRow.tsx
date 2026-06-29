"use client";

import type { Relation } from "@/lib/types";

export function RelationRow({
  relation,
  onOpen,
}: {
  relation: Relation;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="surface-card flex w-full flex-col gap-2 px-5 py-4 text-left hover:border-[#d4cdc4]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold">{relation.name}</div>
        <span className="rounded-full bg-[var(--bg)] px-2 py-1 text-xs font-semibold text-[var(--ink-soft)]">
          {relation.category}
        </span>
      </div>
      <div className="text-sm text-[var(--ink-soft)]">
        {relation.contact || "Geen contactpersoon"} · {relation.email || "Geen e-mail"}
      </div>
    </button>
  );
}
