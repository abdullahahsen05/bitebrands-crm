-- One-to-many mapping: a CRM partner can have multiple invoice-portal concept IDs.
-- This table is the only integration surface with facturatie.bitebrands.nl.
-- Revenue data is fetched on-demand via the /api/facturatie/revenue server route.

create table if not exists partner_facturatie_links (
  id                    uuid primary key default uuid_generate_v4(),
  partner_id            uuid not null references partners(id) on delete cascade,
  facturatie_concept_id text not null,
  label                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (partner_id, facturatie_concept_id)
);

create index if not exists partner_facturatie_links_partner_id_idx
  on partner_facturatie_links (partner_id);

create index if not exists partner_facturatie_links_concept_id_idx
  on partner_facturatie_links (facturatie_concept_id);
