import type { FacturatieLink } from "@/lib/types";
import type { DbPartnerFacturatieLink } from "./db-types";
import { supabase } from "./client";

function mapLink(row: DbPartnerFacturatieLink): FacturatieLink {
  return {
    id: row.id,
    partnerId: row.partner_id,
    conceptId: row.facturatie_concept_id,
    label: row.label ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getPartnerFacturatieLinks(
  partnerId: string,
): Promise<FacturatieLink[]> {
  const { data, error } = await supabase
    .from("partner_facturatie_links")
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapLink(row as DbPartnerFacturatieLink));
}

export async function addPartnerFacturatieLink(
  partnerId: string,
  facturatieConceptId: string,
  label?: string,
): Promise<FacturatieLink> {
  const { data, error } = await supabase
    .from("partner_facturatie_links")
    .insert({
      partner_id: partnerId,
      facturatie_concept_id: facturatieConceptId,
      label: label ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapLink(data as DbPartnerFacturatieLink);
}

export async function removePartnerFacturatieLink(id: string): Promise<void> {
  const { error } = await supabase
    .from("partner_facturatie_links")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function updatePartnerFacturatieLink(
  id: string,
  label: string,
): Promise<void> {
  const { error } = await supabase
    .from("partner_facturatie_links")
    .update({ label, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
