// Raw database row types — one per Supabase table.
// Kept flat; mappers.ts converts these to the frontend CrmData shape.

export type DbProfile = {
  id: string; // uuid — Supabase auth user ID
  name: string;
  role: string;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export type DbCountry = {
  code: string;
  name: string;
  flag: string | null;
};

export type DbConcept = {
  id: string;
  name: string;
  color: string | null;
  logo_url: string | null;
  sort_order: number;
};

export type DbOnboardingStep = {
  id: string;
  name: string;
  sub: string | null;
  optional: boolean;
  general: boolean;
  sort_order: number;
};

export type DbCustomField = {
  id: string;
  label: string;
  type: string;
  sort_order: number;
};

export type DbPlatform = {
  id: string;
  name: string;
  kind: string;
  sort_order: number;
};

export type DbMessageTemplate = {
  id: string;
  country_code: string;
  channel: string;
  title: string;
  subject: string | null;
  body: string;
};

export type DbRelationCategory = {
  id: string;
  name: string;
  sort_order: number;
};

export type DbSetting = {
  key: string;
  value: unknown;
  updated_at: string;
};

export type DbPartner = {
  id: string;
  name: string;
  contact: string | null;
  city: string | null;
  country_code: string | null;
  phone: string | null;
  email: string | null;
  fee: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type DbPartnerConcept = {
  partner_id: string;
  concept_id: string;
};

export type DbPartnerGeneralStep = {
  partner_id: string;
  step_id: string;
  done: boolean;
  updated_at: string;
};

export type DbPartnerConceptStep = {
  partner_id: string;
  concept_id: string;
  step_id: string;
  done: boolean;
  updated_at: string;
};

export type DbPartnerCustom = {
  partner_id: string;
  field_id: string;
  value: string | null;
};

export type DbPartnerPlatform = {
  partner_id: string;
  platform_id: string;
  active: boolean;
  login: string | null;
  pass: string | null; // TODO (security hardening): replace with vault reference
  partner_external_id: string | null;
  url: string | null;
  updated_at: string;
};

export type DbPartnerBilling = {
  partner_id: string;
  concept_id: string;
  invoiced: boolean;
  live: boolean;
  verif_done: boolean;
  verif_code: string | null;
  updated_at: string;
};

export type DbRelation = {
  id: string;
  name: string;
  category_name: string | null;
  contact: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
};

export type DbEvent = {
  id: string;
  partner_id: string | null;
  relation_id: string | null;
  kind: string;
  type: string;
  text: string;
  by_name: string | null;
  created_at: string;
};

export type DbChatMessage = {
  id: string;
  by_user_id: string | null;
  by_user_name: string | null;
  text: string;
  created_at: string;
};

export type DbTask = {
  id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  created_by_id: string | null;
  partner_id: string | null;
  status: string;
  created_at: string;
  done_at: string | null;
};

export type DbPartnerFacturatieLink = {
  id: string; // uuid
  partner_id: string; // text — matches partners.id
  facturatie_concept_id: string;
  label: string | null;
  created_at: string;
  updated_at: string;
};
