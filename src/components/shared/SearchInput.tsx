"use client";

import { Search } from "lucide-react";

export function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--grey)]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Zoeken..."
        className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] pl-10 pr-4 text-sm"
      />
    </label>
  );
}
