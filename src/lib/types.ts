export type Country = {
  code: string;
  name: string;
  flag: string;
};

export type Concept = {
  id: string;
  name: string;
  color: string;
  logoUrl?: string;
};

export type OnboardingStep = {
  id: string;
  name: string;
  sub?: string;
  optional?: boolean;
  general?: boolean;
  sortOrder?: number;
};

export type CustomField = {
  id: string;
  label: string;
  type: "text" | "number" | "email" | "url" | "date" | "select" | string;
};

export type Platform = {
  id: string;
  name: string;
  kind: "delivery" | "web";
};

export type UserRole =
  | "Beheerder"
  | "Sales"
  | "Operations"
  | "Facturatie-manager"
  | "Marketing";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  color: string;
  pw?: string;
};

export type PartnerPlatformState = {
  active: boolean;
  login?: string;
  pass?: string;
  partnerId?: string;
  url?: string;
};

export type PartnerBillingState = {
  invoiced: boolean;
  live: boolean;
  verifDone: boolean;
  verif?: string;
};

export type PartnerEvent = {
  id: string;
  kind: "contact" | "system";
  type: string;
  text: string;
  at: string;
  by: string;
};

export type Partner = {
  id: string;
  name: string;
  contact: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  concepts: string[];
  general: Record<string, boolean>;
  steps: Record<string, Record<string, boolean>>;
  custom: Record<string, string>;
  fee: number;
  platforms: Record<string, PartnerPlatformState>;
  billing: Record<string, PartnerBillingState>;
  events: PartnerEvent[];
  createdAt: string;
};

export type Relation = {
  id: string;
  name: string;
  category: string;
  contact?: string;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
  events: PartnerEvent[];
};

export type ChatMessage = {
  id: string;
  byId: string;
  text: string;
  at: string;
};

export type Task = {
  id: string;
  title: string;
  desc?: string;
  assigneeId: string;
  byId: string;
  partnerId?: string | null;
  status: "open" | "done";
  at: string;
  doneAt?: string;
};

export type MessageTemplate = {
  id: string;
  channel: "wa" | "mail" | "whatsapp" | "email" | string;
  title: string;
  subject?: string;
  body: string;
};

export type CrmConfig = {
  countries: Country[];
  concepts: Concept[];
  steps: OnboardingStep[];
  fields: CustomField[];
  platforms: Platform[];
  templates: Record<string, MessageTemplate[]>;
  relationCategories: string[];
  portals: {
    onboarding?: { url: string };
    facturatie?: { url: string };
    review?: { url: string };
  };
};

export type CrmData = {
  config: CrmConfig;
  users: User[];
  currentUserId: string | null;
  loggedIn: boolean;
  partners: Partner[];
  relations: Relation[];
  chat: ChatMessage[];
  tasks: Task[];
  savedAt?: string;
};

export type CrmView = "list" | "board" | "billing" | "relations" | "team" | "admin";
export type PartnerPhase = "new" | "prog" | "live";
export type AlertTone = "warning" | "critical" | "info";

export type FacturatieLink = {
  id: string;
  partnerId: string;
  conceptId: string;
  label?: string;
  createdAt: string;
};

export type FacturatieRevenueBreakdown = {
  conceptId: string;
  label?: string;
  revenue: number;
  invoiceCount?: number;
};

export type FacturatieRevenueSummary = {
  totalRevenue?: number;
  currency?: string;
  period?: string;
  concepts?: FacturatieRevenueBreakdown[];
};

export type BillingRow = {
  partnerId: string;
  partnerName: string;
  conceptId: string;
  conceptName: string;
  conceptColor: string;
  city: string;
  countryCode: string;
  countryFlag: string;
  phase: PartnerPhase;
  invoiced: boolean;
  live: boolean;
  verifDone: boolean;
  verif: string;
};

export type PartnerFilters = {
  query: string;
  country: string;
  concept: string;
  phase: "all" | PartnerPhase;
};

export type AppModal =
  | { type: null }
  | { type: "partner"; partnerId?: string }
  | { type: "relation"; relationId?: string }
  | { type: "task" };

export type ToastState = {
  id: string;
  message: string;
};

export type UiState = {
  view: CrmView;
  filters: PartnerFilters;
  selectedPartnerId: string | null;
  selectedRelationId: string | null;
  adminTab: string;
  modal: AppModal;
  toast: ToastState | null;
  userMenuOpen: boolean;
  mobileNavOpen: boolean;
};

export type PartnerInput = {
  name: string;
  contact: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  concepts: string[];
};

export type RelationInput = {
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  website: string;
  notes: string;
};

export type TaskInput = {
  title: string;
  desc?: string;
  assigneeId: string;
  partnerId?: string | null;
};
