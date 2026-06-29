"use client";

import { billingRows, filteredPartners } from "@/lib/calculations";
import { useCrmStore } from "@/lib/crm-store";

import { BillingTable } from "./BillingTable";

export function BillingOverview() {
  const data = useCrmStore((state) => state.data);
  const filters = useCrmStore((state) => state.ui.filters);
  const rows = billingRows(filteredPartners(data, filters), data.config);

  return <BillingTable rows={rows} />;
}
