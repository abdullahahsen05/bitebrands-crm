"use client";

import { Menu, Plus } from "lucide-react";

import { Button } from "@/components/shared/Button";
import { SearchInput } from "@/components/shared/SearchInput";
import { VIEW_META } from "@/lib/constants";
import { useCrmStore } from "@/lib/crm-store";
import { initials } from "@/lib/formatters";

import { UserMenu } from "./UserMenu";

export function Topbar() {
  const view = useCrmStore((state) => state.ui.view);
  const filters = useCrmStore((state) => state.ui.filters);
  const setFilters = useCrmStore((state) => state.setFilters);
  const openModal = useCrmStore((state) => state.openModal);
  const toggleUserMenu = useCrmStore((state) => state.toggleUserMenu);
  const toggleMobileNav = useCrmStore((state) => state.toggleMobileNav);
  const userMenuOpen = useCrmStore((state) => state.ui.userMenuOpen);
  const currentUser = useCrmStore((state) =>
    state.data.users.find((user) => user.id === state.data.currentUserId) ?? state.data.users[0],
  );

  const meta = VIEW_META[view];
  const canAdd = view === "list" || view === "relations" || view === "team";

  return (
    <div className="relative border-b border-[var(--line)] bg-[var(--surface)] px-4 py-3 md:px-7">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileNav}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="grotesk truncate text-xl font-semibold">{meta.title}</h1>
          <p className="hidden text-sm text-[var(--ink-soft)] md:block">{meta.subtitle}</p>
        </div>

        <div className="order-3 basis-full md:order-none md:basis-auto">
          <SearchInput value={filters.query} onChange={(query) => setFilters({ query })} />
        </div>

        {canAdd ? (
          <Button
            variant="primary"
            onClick={() =>
              openModal({
                type: view === "list" ? "partner" : view === "relations" ? "relation" : "task",
              })
            }
          >
            <Plus className="h-4 w-4" />
            {meta.addLabel}
          </Button>
        ) : null}

        <button
          type="button"
          onClick={toggleUserMenu}
          className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--bg)] px-2 py-1.5"
        >
          <div className="hidden text-right md:block">
            <div className="text-sm font-semibold">{currentUser.name}</div>
            <div className="text-[11px] text-[var(--grey)]">{currentUser.role}</div>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: currentUser.color }}
          >
            {initials(currentUser.name)}
          </div>
        </button>
      </div>

      {userMenuOpen ? <UserMenu /> : null}
    </div>
  );
}
