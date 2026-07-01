import type { CrmView, UserRole } from "./types";
import type { User } from "./types";

// ─── Billing / Admin helpers (existing) ──────────────────────────────────────

export function canSeeBillingAlerts(user: User | null | undefined) {
  if (!user) return false;
  return /(facturatie|beheer)/i.test(user.role);
}

export function canEditBilling(user: User | null | undefined) {
  if (!user) return false;
  return /(facturatie|beheer)/i.test(user.role);
}

export function canEditAdmin(user: User | null | undefined) {
  return user?.role === "Beheerder";
}

// ─── View access ─────────────────────────────────────────────────────────────

const ROLE_ALLOWED_VIEWS: Record<UserRole, CrmView[]> = {
  "Beheerder":          ["list", "board", "billing", "relations", "team", "admin"],
  "Facturatie-manager": ["billing", "team"],
  "Sales":              ["list", "board", "team"],
  "Marketing":          ["relations", "admin", "team"],
  "Operations":         ["board", "team"],
};

export function canAccessView(role: UserRole | undefined, view: CrmView): boolean {
  if (!role) return false;
  return ROLE_ALLOWED_VIEWS[role]?.includes(view) ?? false;
}

export function getDefaultViewForRole(role: UserRole | undefined): CrmView {
  switch (role) {
    case "Facturatie-manager": return "billing";
    case "Marketing":          return "relations";
    case "Operations":         return "board";
    default:                   return "list";
  }
}

export function getAllowedNavViews(role: UserRole | undefined): CrmView[] {
  if (!role) return [];
  return ROLE_ALLOWED_VIEWS[role] ?? [];
}

// ─── Admin tab access ────────────────────────────────────────────────────────

const ALL_ADMIN_TABS = [
  "landen", "concepten", "stappen", "velden", "platforms",
  "templates", "relaties", "users", "instellingen",
] as const;

export type AdminTab = (typeof ALL_ADMIN_TABS)[number];

export function getAllowedAdminTabs(role: UserRole | undefined): AdminTab[] {
  if (role === "Beheerder") return [...ALL_ADMIN_TABS];
  if (role === "Marketing") return ["templates"];
  return [];
}

// ─── Facturatie links access ──────────────────────────────────────────────────

export function canManageFacturatieLinks(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === "Beheerder" || user.role === "Facturatie-manager";
}

export function canViewFacturatieLinks(user: User | null | undefined): boolean {
  if (!user) return false;
  return (
    user.role === "Beheerder" ||
    user.role === "Facturatie-manager" ||
    user.role === "Sales"
  );
}
