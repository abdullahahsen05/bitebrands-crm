// Loads the full CRM dataset from Supabase in parallel.
// Returns a CrmData object ready to drop into the Zustand store.

import type { CrmData } from "@/lib/types";

import { supabase } from "./client";
import {
  mapChatMessage,
  mapConfig,
  mapPartner,
  mapProfile,
  mapRelation,
  mapTask,
} from "./mappers";

export async function loadAllData(currentUserId: string): Promise<CrmData> {
  const [
    { data: countries },
    { data: concepts },
    { data: steps },
    { data: fields },
    { data: platforms },
    { data: templates },
    { data: categories },
    { data: settings },
    { data: profiles },
    { data: partners },
    { data: partnerConcepts },
    { data: partnerGeneralSteps },
    { data: partnerConceptSteps },
    { data: partnerCustom },
    { data: partnerPlatforms },
    { data: partnerBilling },
    { data: partnerEvents },
    { data: relations },
    { data: relationEvents },
    { data: chat },
    { data: tasks },
  ] = await Promise.all([
    supabase.from("countries").select("*").order("name"),
    supabase.from("concepts").select("*").order("sort_order"),
    supabase.from("onboarding_steps").select("*").order("sort_order"),
    supabase.from("custom_fields").select("*").order("sort_order"),
    supabase.from("platforms").select("*").order("sort_order"),
    supabase.from("message_templates").select("*"),
    supabase.from("relation_categories").select("*").order("sort_order"),
    supabase.from("settings").select("*"),
    supabase.from("profiles").select("*"),
    supabase.from("partners").select("*").order("created_at", { ascending: false }),
    supabase.from("partner_concepts").select("*"),
    supabase.from("partner_general_steps").select("*"),
    supabase.from("partner_concept_steps").select("*"),
    supabase.from("partner_custom").select("*"),
    supabase.from("partner_platforms").select("*"),
    supabase.from("partner_billing").select("*"),
    supabase.from("events").select("*").not("partner_id", "is", null),
    supabase.from("relations").select("*").order("created_at", { ascending: false }),
    supabase.from("events").select("*").not("relation_id", "is", null),
    supabase.from("chat_messages").select("*").order("created_at"),
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
  ]);

  const config = mapConfig(
    countries ?? [],
    concepts ?? [],
    steps ?? [],
    fields ?? [],
    platforms ?? [],
    templates ?? [],
    categories ?? [],
    settings ?? [],
  );

  const mappedPartners = (partners ?? []).map((p) =>
    mapPartner(
      p,
      (partnerConcepts ?? []).filter((c) => c.partner_id === p.id),
      (partnerGeneralSteps ?? []).filter((s) => s.partner_id === p.id),
      (partnerConceptSteps ?? []).filter((s) => s.partner_id === p.id),
      (partnerCustom ?? []).filter((f) => f.partner_id === p.id),
      (partnerPlatforms ?? []).filter((pl) => pl.partner_id === p.id),
      (partnerBilling ?? []).filter((b) => b.partner_id === p.id),
      (partnerEvents ?? []).filter((e) => e.partner_id === p.id),
    ),
  );

  const mappedRelations = (relations ?? []).map((r) =>
    mapRelation(
      r,
      (relationEvents ?? []).filter((e) => e.relation_id === r.id),
    ),
  );

  return {
    config,
    users: (profiles ?? []).map(mapProfile),
    currentUserId,
    loggedIn: true,
    partners: mappedPartners,
    relations: mappedRelations,
    chat: (chat ?? []).map(mapChatMessage),
    tasks: (tasks ?? []).map(mapTask),
    savedAt: new Date().toISOString(),
  };
}
