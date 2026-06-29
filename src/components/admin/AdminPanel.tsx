"use client";

import { useCrmStore } from "@/lib/crm-store";

import { AdminConcepts } from "./AdminConcepts";
import { AdminCountries } from "./AdminCountries";
import { AdminCustomFields } from "./AdminCustomFields";
import { AdminOnboardingSteps } from "./AdminOnboardingSteps";
import { AdminPlatforms } from "./AdminPlatforms";
import { AdminRelationCategories } from "./AdminRelationCategories";
import { AdminSettings } from "./AdminSettings";
import { AdminTabs } from "./AdminTabs";
import { AdminTemplates } from "./AdminTemplates";
import { AdminUsers } from "./AdminUsers";

export function AdminPanel() {
  const adminTab = useCrmStore((state) => state.ui.adminTab);
  const setAdminTab = useCrmStore((state) => state.setAdminTab);

  return (
    <div>
      <AdminTabs value={adminTab} onChange={setAdminTab} />
      {adminTab === "landen" ? <AdminCountries /> : null}
      {adminTab === "concepten" ? <AdminConcepts /> : null}
      {adminTab === "stappen" ? <AdminOnboardingSteps /> : null}
      {adminTab === "velden" ? <AdminCustomFields /> : null}
      {adminTab === "platforms" ? <AdminPlatforms /> : null}
      {adminTab === "templates" ? <AdminTemplates /> : null}
      {adminTab === "relaties" ? <AdminRelationCategories /> : null}
      {adminTab === "users" ? <AdminUsers /> : null}
      {adminTab === "instellingen" ? <AdminSettings /> : null}
    </div>
  );
}
