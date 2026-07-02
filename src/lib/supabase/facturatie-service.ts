import type { FacturatieLink } from "@/lib/types";
import type { DbPartnerFacturatieLink } from "./db-types";
import { supabase } from "./client";

function mapLink(row: DbPartnerFacturatieLink): FacturatieLink {
  return {
    id: row.id,
    partnerId: row.partner_id,
    conceptId: row.facturatie_concept_id,
    label: row.label ?? undefined,
    country: row.country ?? undefined,
    tbPartnerId: row.tb_partner_id ?? undefined,
    virtualConcept: row.virtual_concept ?? undefined,
    hostRestaurantName: row.host_restaurant_name ?? undefined,
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

type LinkMetadata = {
  label?: string;
  country?: string;
  tbPartnerId?: string;
  virtualConcept?: string;
  hostRestaurantName?: string;
};

export async function addPartnerFacturatieLink(
  partnerId: string,
  facturatieConceptId: string,
  meta?: LinkMetadata,
): Promise<FacturatieLink> {
  const { data, error } = await supabase
    .from("partner_facturatie_links")
    .insert({
      partner_id: partnerId,
      facturatie_concept_id: facturatieConceptId,
      label: meta?.label ?? null,
      country: meta?.country ?? null,
      tb_partner_id: meta?.tbPartnerId ?? null,
      virtual_concept: meta?.virtualConcept ?? null,
      host_restaurant_name: meta?.hostRestaurantName ?? null,
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
