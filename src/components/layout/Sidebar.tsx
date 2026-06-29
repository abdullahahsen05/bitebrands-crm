"use client";

import {
  LayoutDashboard,
  PanelLeft,
  Settings,
  Users,
  Wallet,
  Handshake,
  MessageSquareText,
  ExternalLink,
} from "lucide-react";

import { VIEW_META } from "@/lib/constants";
import { useCrmStore } from "@/lib/crm-store";
import { openTasksForUser } from "@/lib/calculations";
import { getPortalAction } from "@/lib/portal-utils";
import { cn } from "@/lib/utils";

const nav = [
  { view: "list", label: "Partners", icon: Users },
  { view: "board", label: "Onboarding board", icon: LayoutDashboard },
  { view: "billing", label: "Facturatie", icon: Wallet },
  { view: "relations", label: "Relaties", icon: Handshake },
  { view: "team", label: "Team", icon: MessageSquareText },
  { view: "admin", label: "Admin", icon: Settings },
] as const;

export function Sidebar({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  const view = useCrmStore((state) => state.ui.view);
  const setView = useCrmStore((state) => state.setView);
  const filters = useCrmStore((state) => state.ui.filters);
  const setFilters = useCrmStore((state) => state.setFilters);
  const setAdminTab = useCrmStore((state) => state.setAdminTab);
  const showToast = useCrmStore((state) => state.showToast);
  const data = useCrmStore((state) => state.data);
  const closeMobileNav = useCrmStore((state) => state.closeMobileNav);

  const myTasks = openTasksForUser(data.tasks, data.currentUserId).length;

  return (
    <aside className="flex h-full flex-col bg-[var(--sidebar)] px-4 py-5 text-[var(--sidebar-ink)]">
      <div className="mb-6 rounded-2xl border border-white/10 px-4 py-4 text-center">
        <div className="grotesk text-lg font-semibold">Bite Brands</div>
        <div className="mt-1 text-xs uppercase tracking-[0.24em] text-[#9c8f85]">Partner CRM</div>
      </div>

      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#857a71]">
        Werkruimte
      </div>
      <div className="mt-3 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = view === item.view;

          return (
            <button
              key={item.view}
              type="button"
              onClick={() => {
                setView(item.view);
                closeMobileNav();
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition",
                active
                  ? "bg-[var(--accent)] text-white"
                  : "text-[#c9bfb6] hover:bg-[var(--sidebar-soft)] hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.view === "team" && myTasks > 0 ? (
                <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {myTasks}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#857a71]">
        Externe portalen
      </div>
      <div className="mt-3 space-y-1">
        {[
          ["onboarding", "Onboardingsportaal"],
          ["facturatie", "Facturatieportaal"],
          ["review", "Reviewportaal"],
        ].map(([key, label]) => {
          const action = getPortalAction(
            data.config.portals[key as keyof typeof data.config.portals]?.url,
          );

          return (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (action.type === "external") {
                window.open(action.url, "_blank", "noopener,noreferrer");
                return;
              }

              setView("admin");
              setAdminTab("instellingen");
              closeMobileNav();
              showToast(
                action.type === "placeholder"
                  ? "Demo-portaal link is een placeholder. Stel een echte URL in via Admin > Instellingen."
                  : "Nog geen portaal-URL ingesteld. Stel die in via Admin > Instellingen.",
              );
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[#c9bfb6] hover:bg-[var(--sidebar-soft)] hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            <span>{label}</span>
          </button>
        )})}
      </div>

      <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#857a71]">
        Filter op land
      </div>
      <div className="mt-3 space-y-1">
        <button
          type="button"
          onClick={() => setFilters({ country: "all" })}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
            filters.country === "all"
              ? "bg-[var(--accent)] text-white"
              : "text-[#c9bfb6] hover:bg-[var(--sidebar-soft)] hover:text-white",
          )}
        >
          <PanelLeft className="h-4 w-4" />
          Alle landen
        </button>
        {data.config.countries.map((country) => (
          <button
            key={country.code}
            type="button"
            onClick={() => setFilters({ country: country.code })}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
              filters.country === country.code
                ? "bg-[var(--accent)] text-white"
                : "text-[#c9bfb6] hover:bg-[var(--sidebar-soft)] hover:text-white",
            )}
          >
            <span>{country.flag}</span>
            <span>{country.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto border-t border-white/10 pt-4 text-xs text-[#857a71]">
        {mobile ? "Mobiele navigatie" : VIEW_META[view].subtitle}
      </div>
    </aside>
  );
}
