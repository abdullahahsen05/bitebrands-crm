"use client";

import { useEffect } from "react";
import { Download, RotateCcw } from "lucide-react";

import { AdminPanel } from "@/components/admin/AdminPanel";
import { DemoLogin } from "@/components/auth/DemoLogin";
import { BillingOverview } from "@/components/billing/BillingOverview";
import { OnboardingBoard } from "@/components/onboarding/OnboardingBoard";
import { AddPartnerModal } from "@/components/partners/AddPartnerModal";
import { PartnerDetailDrawer } from "@/components/partners/PartnerDetailDrawer";
import { PartnerList } from "@/components/partners/PartnerList";
import { AddRelationModal } from "@/components/relations/AddRelationModal";
import { RelationDetailDrawer } from "@/components/relations/RelationDetailDrawer";
import { RelationsList } from "@/components/relations/RelationsList";
import { Button } from "@/components/shared/Button";
import { Toast } from "@/components/shared/Toast";
import { AddTaskModal } from "@/components/team/AddTaskModal";
import { TeamWorkspace } from "@/components/team/TeamWorkspace";
import { useCrmStore } from "@/lib/crm-store";
import { downloadData } from "@/lib/storage";

import { MobileSidebar } from "./MobileSidebar";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

function ActiveView() {
  const view = useCrmStore((state) => state.ui.view);

  if (view === "list") return <PartnerList />;
  if (view === "board") return <OnboardingBoard />;
  if (view === "billing") return <BillingOverview />;
  if (view === "relations") return <RelationsList />;
  if (view === "team") return <TeamWorkspace />;
  return <AdminPanel />;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl font-bold text-white">
          B
        </div>
        <p className="text-sm text-[var(--ink-soft)]">CRM laden…</p>
      </div>
    </div>
  );
}

export function AppShell() {
  const loggedIn = useCrmStore((state) => state.data.loggedIn);
  const initialized = useCrmStore((state) => state.initialized);
  const loading = useCrmStore((state) => state.loading);
  const data = useCrmStore((state) => state.data);
  const toast = useCrmStore((state) => state.ui.toast);
  const mobileNavOpen = useCrmStore((state) => state.ui.mobileNavOpen);
  const clearToast = useCrmStore((state) => state.clearToast);
  const closeMobileNav = useCrmStore((state) => state.closeMobileNav);
  const showToast = useCrmStore((state) => state.showToast);
  const initAuth = useCrmStore((state) => state.initAuth);
  const loadData = useCrmStore((state) => state.loadData);

  // Initialize Supabase auth + session check on first render.
  useEffect(() => {
    void initAuth();
    // initAuth sets up a persistent auth listener; no cleanup needed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading screen while checking session or loading data.
  if (!initialized || loading) {
    return <LoadingScreen />;
  }

  if (!loggedIn) {
    return <DemoLogin />;
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[272px_1fr]">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <MobileSidebar open={mobileNavOpen} onClose={closeMobileNav} />

      <main className="flex min-h-screen flex-col">
        <Topbar />
        <div className="app-scroll flex-1 overflow-y-auto px-4 py-5 md:px-7 md:py-6">
          <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
            <Button
              onClick={() => {
                downloadData(data);
                showToast("Data geëxporteerd");
              }}
            >
              <Download className="h-4 w-4" />
              Exporteer JSON
            </Button>
            <Button
              onClick={() => {
                void (async () => {
                  const { data: { session } } = await import("@/lib/supabase/client").then(m => m.supabase.auth.getSession());
                  if (session?.user) {
                    await loadData(session.user.id);
                    showToast("Data herladen");
                  } else {
                    showToast("Geen sessie gevonden");
                  }
                })();
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Herladen
            </Button>
          </div>

          <ActiveView />
        </div>
      </main>

      <PartnerDetailDrawer />
      <RelationDetailDrawer />
      <AddPartnerModal />
      <AddRelationModal />
      <AddTaskModal />
      <Toast message={toast?.message ?? null} onClose={clearToast} />
    </div>
  );
}
