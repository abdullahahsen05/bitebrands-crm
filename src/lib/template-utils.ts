import type { Partner } from "./types";

type TemplateContext = {
  countryName?: string;
  conceptNames?: string[];
};

export function fillTemplate(template: string, partner: Partner, context: TemplateContext = {}) {
  const replacements: Record<string, string> = {
    naam: partner.name,
    contactpersoon: partner.contact,
    stad: partner.city,
    partnerid: partner.id,
    concepten: context.conceptNames?.join(", ") ?? partner.concepts.join(", "),
    land: context.countryName ?? partner.country,
    email: partner.email ?? "",
    telefoon: partner.phone ?? "",
    fee: partner.fee ? `${partner.fee}%` : "",
  };

  return template.replace(/\{(\w+)\}/g, (_match, key: string) => replacements[key] ?? `{${key}}`);
}
