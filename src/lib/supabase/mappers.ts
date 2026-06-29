// Mappers from DB row types → frontend CrmData types.

import type {
  ChatMessage,
  Concept,
  Country,
  CrmConfig,
  CustomField,
  MessageTemplate,
  OnboardingStep,
  Partner,
  PartnerBillingState,
  PartnerEvent,
  PartnerPlatformState,
  Platform,
  Relation,
  Task,
  User,
} from "@/lib/types";

import type {
  DbChatMessage,
  DbConcept,
  DbCountry,
  DbCustomField,
  DbEvent,
  DbMessageTemplate,
  DbOnboardingStep,
  DbPartner,
  DbPartnerBilling,
  DbPartnerConcept,
  DbPartnerConceptStep,
  DbPartnerCustom,
  DbPartnerGeneralStep,
  DbPartnerPlatform,
  DbPlatform,
  DbProfile,
  DbRelation,
  DbRelationCategory,
  DbSetting,
  DbTask,
} from "./db-types";

export function mapProfile(row: DbProfile): User {
  return {
    id: row.id,
    name: row.name,
    role: row.role as User["role"],
    color: row.color ?? "#9A938C",
  };
}

export function mapCountry(row: DbCountry): Country {
  return { code: row.code, name: row.name, flag: row.flag ?? "" };
}

export function mapConcept(row: DbConcept): Concept {
  return {
    id: row.id,
    name: row.name,
    color: row.color ?? "#9A938C",
    logoUrl: row.logo_url ?? undefined,
  };
}

export function mapStep(row: DbOnboardingStep): OnboardingStep {
  return {
    id: row.id,
    name: row.name,
    sub: row.sub ?? undefined,
    optional: row.optional,
    general: row.general,
    sortOrder: row.sort_order,
  };
}

export function mapField(row: DbCustomField): CustomField {
  return { id: row.id, label: row.label, type: row.type };
}

export function mapPlatform(row: DbPlatform): Platform {
  return { id: row.id, name: row.name, kind: row.kind as Platform["kind"] };
}

export function mapTemplate(row: DbMessageTemplate): MessageTemplate {
  return {
    id: row.id,
    channel: row.channel as MessageTemplate["channel"],
    title: row.title,
    subject: row.subject ?? undefined,
    body: row.body,
  };
}

export function mapConfig(
  countries: DbCountry[],
  concepts: DbConcept[],
  steps: DbOnboardingStep[],
  fields: DbCustomField[],
  platforms: DbPlatform[],
  templates: DbMessageTemplate[],
  categories: DbRelationCategory[],
  settings: DbSetting[],
): CrmConfig {
  const templatesMap: Record<string, MessageTemplate[]> = {};
  for (const t of templates) {
    templatesMap[t.country_code] = templatesMap[t.country_code] ?? [];
    templatesMap[t.country_code].push(mapTemplate(t));
  }

  const portals: CrmConfig["portals"] = {};
  for (const s of settings) {
    const val = s.value as Record<string, string>;
    if (s.key === "portal_onboarding") portals.onboarding = { url: val.url ?? "" };
    if (s.key === "portal_facturatie") portals.facturatie = { url: val.url ?? "" };
    if (s.key === "portal_review") portals.review = { url: val.url ?? "" };
  }

  return {
    countries: countries.map(mapCountry),
    concepts: concepts.map(mapConcept),
    steps: steps.map(mapStep),
    fields: fields.map(mapField),
    platforms: platforms.map(mapPlatform),
    templates: templatesMap,
    relationCategories: categories.map((c) => c.name),
    portals,
  };
}

export function mapEvent(row: DbEvent): PartnerEvent {
  return {
    id: row.id,
    kind: row.kind as PartnerEvent["kind"],
    type: row.type,
    text: row.text,
    by: row.by_name ?? "",
    at: row.created_at,
  };
}

export function mapPartner(
  row: DbPartner,
  concepts: DbPartnerConcept[],
  generalSteps: DbPartnerGeneralStep[],
  conceptSteps: DbPartnerConceptStep[],
  custom: DbPartnerCustom[],
  platforms: DbPartnerPlatform[],
  billing: DbPartnerBilling[],
  events: DbEvent[],
): Partner {
  const conceptIds = concepts.map((c) => c.concept_id);

  const general: Record<string, boolean> = {};
  for (const s of generalSteps) {
    general[s.step_id] = s.done;
  }

  const steps: Record<string, Record<string, boolean>> = {};
  for (const s of conceptSteps) {
    steps[s.concept_id] = steps[s.concept_id] ?? {};
    steps[s.concept_id][s.step_id] = s.done;
  }

  const customMap: Record<string, string> = {};
  for (const f of custom) {
    customMap[f.field_id] = f.value ?? "";
  }

  const platformsMap: Record<string, PartnerPlatformState> = {};
  for (const p of platforms) {
    platformsMap[p.platform_id] = {
      active: p.active,
      login: p.login ?? "",
      pass: p.pass ?? "demo123", // TODO (security hardening): replace with vault
      partnerId: p.partner_external_id ?? "",
      url: p.url ?? "",
    };
  }

  const billingMap: Record<string, PartnerBillingState> = {};
  for (const b of billing) {
    billingMap[b.concept_id] = {
      invoiced: b.invoiced,
      live: b.live,
      verifDone: b.verif_done,
      verif: b.verif_code ?? "",
    };
  }

  const partnerEvents: PartnerEvent[] = events
    .map(mapEvent)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return {
    id: row.id,
    name: row.name,
    contact: row.contact ?? "—",
    city: row.city ?? "—",
    country: row.country_code ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    concepts: conceptIds,
    general,
    steps,
    custom: customMap,
    fee: Number(row.fee ?? 0),
    platforms: platformsMap,
    billing: billingMap,
    events: partnerEvents,
    createdAt: row.created_at,
  };
}

export function mapRelation(row: DbRelation, events: DbEvent[]): Relation {
  const relationEvents: PartnerEvent[] = events
    .map(mapEvent)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return {
    id: row.id,
    name: row.name,
    category: row.category_name ?? "",
    contact: row.contact ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    website: row.website ?? undefined,
    notes: row.notes ?? undefined,
    events: relationEvents,
  };
}

export function mapChatMessage(row: DbChatMessage): ChatMessage {
  return {
    id: row.id,
    byId: row.by_user_id ?? "",
    text: row.text,
    at: row.created_at,
  };
}

export function mapTask(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    desc: row.description ?? undefined,
    assigneeId: row.assignee_id ?? "",
    byId: row.created_by_id ?? "",
    partnerId: row.partner_id ?? null,
    status: row.status as Task["status"],
    at: row.created_at,
    doneAt: row.done_at ?? undefined,
  };
}
