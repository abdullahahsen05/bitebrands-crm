"use client";

import { cn } from "@/lib/utils";

export function Toggle({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onClick}
      className={cn(
        "relative h-6 w-10 rounded-full transition",
        checked ? "bg-[var(--green)]" : "bg-[var(--line)]",
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition",
          checked ? "left-5" : "left-1",
        )}
      />
    </button>
  );
}
