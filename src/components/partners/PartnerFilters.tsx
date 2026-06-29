"use client";

import { useCrmStore } from "@/lib/crm-store";
import { PHASE_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PartnerFilters() {
  const config = useCrmStore((state) => state.data.config);
  const filters = useCrmStore((state) => state.ui.filters);
  const setFilters = useCrmStore((state) => state.setFilters);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilters({ concept: "all" })}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm",
            filters.concept === "all"
              ? "border-[var(--ink)] bg-[var(--ink)] text-white"
              : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]",
          )}
        >
          Alle concepten
        </button>
        {config.concepts.map((concept) => (
          <button
            key={concept.id}
            type="button"
            onClick={() => setFilters({ concept: concept.id })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              filters.concept === concept.id
                ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]",
            )}
          >
            {concept.name}
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-[var(--line)]" />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilters({ phase: "all" })}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm",
            filters.phase === "all"
              ? "border-[var(--ink)] bg-[var(--ink)] text-white"
              : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]",
          )}
        >
          Alle fases
        </button>
        {Object.entries(PHASE_META).map(([phase, meta]) => (
          <button
            key={phase}
            type="button"
            onClick={() => setFilters({ phase: phase as "new" | "prog" | "live" })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              filters.phase === phase
                ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]",
            )}
          >
            {meta.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setFilters({ query: "", country: "all", concept: "all", phase: "all" })}
        className="ml-auto text-sm font-semibold text-[var(--accent)]"
      >
        Filters wissen
      </button>
    </div>
  );
}
