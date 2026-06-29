import type { User } from "./types";

export function canSeeBillingAlerts(user: User | null | undefined) {
  if (!user) {
    return false;
  }

  return /(facturatie|beheer)/i.test(user.role);
}

export function canEditBilling(user: User | null | undefined) {
  if (!user) {
    return false;
  }

  return /(facturatie|beheer)/i.test(user.role);
}

export function canEditAdmin(user: User | null | undefined) {
  return user?.role === "Beheerder";
}
