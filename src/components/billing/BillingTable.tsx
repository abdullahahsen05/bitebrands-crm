import type { BillingRow as BillingRowType } from "@/lib/types";

import { BillingRow } from "./BillingRow";

export function BillingTable({ rows }: { rows: BillingRowType[] }) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[var(--bg)] text-left text-xs uppercase tracking-[0.12em] text-[var(--ink-soft)]">
            <tr>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Concept</th>
              <th className="px-4 py-3">Locatie</th>
              <th className="px-4 py-3">Live</th>
              <th className="px-4 py-3">Facturatie</th>
              <th className="px-4 py-3">Verificatie</th>
              <th className="px-4 py-3">Code</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <BillingRow key={`${row.partnerId}-${row.conceptId}`} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
