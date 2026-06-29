import type { CrmView, PartnerPhase, UserRole } from "./types";

export const STORAGE_KEY = "bitebrands_crm_rebuild_v1";

export const ROLE_OPTIONS: UserRole[] = [
  "Beheerder",
  "Sales",
  "Operations",
  "Facturatie-manager",
  "Marketing",
];

export const PALETTE = [
  "#E0962B",
  "#D63E3E",
  "#F0531C",
  "#2F6FB0",
  "#2E9E5B",
  "#7A4FC0",
  "#0E8C8C",
  "#B0481E",
  "#C2185B",
  "#5A6B2F",
];

export const VIEW_META: Record<
  CrmView,
  { title: string; subtitle: string; addLabel?: string }
> = {
  list: {
    title: "Partners",
    subtitle: "Beheer je franchisepartners",
    addLabel: "Partner",
  },
  board: {
    title: "Onboarding board",
    subtitle: "Per fase - klik voor details",
  },
  billing: {
    title: "Facturatie",
    subtitle: "Per vestiging en concept",
  },
  relations: {
    title: "Relaties",
    subtitle: "Samenwerkingspartners en leveranciers",
    addLabel: "Relatie",
  },
  team: {
    title: "Team",
    subtitle: "Chat, taken en opdrachten",
    addLabel: "Taak",
  },
  admin: {
    title: "Admin",
    subtitle: "Configureer je CRM",
  },
};

export const PHASE_META: Record<
  PartnerPhase,
  { label: string; tone: "neutral" | "warning" | "success" }
> = {
  new: { label: "Nieuw", tone: "neutral" },
  prog: { label: "In onboarding", tone: "warning" },
  live: { label: "Live", tone: "success" },
};
