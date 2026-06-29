"use client";

import { billingRows } from "@/lib/calculations";
import { useCrmStore } from "@/lib/crm-store";

import { BillingTable } from "./BillingTable";

export function BillingOverview() {
  const data = useCrmStore((state) => state.data);
  const rows = billingRows(data.partners, data.config);

  return <BillingTable rows={rows} />;
}
