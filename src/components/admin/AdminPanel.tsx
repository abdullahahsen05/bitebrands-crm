"use client";

import { useEffect } from "react";

import { useCrmStore } from "@/lib/crm-store";
import { getAllowedAdminTabs } from "@/lib/permissions";

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
  const data = useCrmStore((state) => state.data);

  const currentUser = data.users.find((u) => u.id === data.currentUserId);
  const allowedTabs = getAllowedAdminTabs(currentUser?.role);

  // If current tab isn't allowed for this role, jump to the first allowed tab.
  useEffect(() => {
    if (allowedTabs.length > 0 && !allowedTabs.includes(adminTab as never)) {
      setAdminTab(allowedTabs[0]);
    }
  }, [adminTab, allowedTabs, setAdminTab]);

  return (
    <div>
      <AdminTabs value={adminTab} onChange={setAdminTab} allowedTabs={allowedTabs} />
      {adminTab === "landen"       ? <AdminCountries />          : null}
      {adminTab === "concepten"    ? <AdminConcepts />           : null}
      {adminTab === "stappen"      ? <AdminOnboardingSteps />    : null}
      {adminTab === "velden"       ? <AdminCustomFields />       : null}
      {adminTab === "platforms"    ? <AdminPlatforms />          : null}
      {adminTab === "templates"    ? <AdminTemplates />          : null}
      {adminTab === "relaties"     ? <AdminRelationCategories /> : null}
      {adminTab === "users"        ? <AdminUsers />              : null}
      {adminTab === "instellingen" ? <AdminSettings />           : null}
    </div>
  );
}
