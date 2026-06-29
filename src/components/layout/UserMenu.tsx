"use client";

import { LogOut } from "lucide-react";

import { useCrmStore } from "@/lib/crm-store";
import { initials } from "@/lib/formatters";

export function UserMenu() {
  const users = useCrmStore((state) => state.data.users);
  const currentUserId = useCrmStore((state) => state.data.currentUserId);
  const logout = useCrmStore((state) => state.logout);
  const switchUser = useCrmStore((state) => state.switchUser);
  const closeUserMenu = useCrmStore((state) => state.closeUserMenu);

  return (
    <div className="absolute right-0 top-14 z-30 min-w-64 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-xl">
      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--grey)]">
        Snel wisselen
      </div>
      {users.map((user) => (
        <button
          key={user.id}
          type="button"
          onClick={() => switchUser(user.id)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-[var(--bg)]"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: user.color }}
          >
            {initials(user.name)}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{user.name}</div>
            <div className="text-xs text-[var(--grey)]">{user.role}</div>
          </div>
          {currentUserId === user.id ? <span className="text-[var(--accent)]">✓</span> : null}
        </button>
      ))}
      <button
        type="button"
        onClick={() => {
          closeUserMenu();
          logout();
        }}
        className="mt-2 flex w-full items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-left text-sm font-semibold text-[var(--red)] hover:bg-[var(--red-soft)]"
      >
        <LogOut className="h-4 w-4" />
        Uitloggen
      </button>
    </div>
  );
}
