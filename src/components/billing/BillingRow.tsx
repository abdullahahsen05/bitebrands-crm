"use client";

import { Toggle } from "@/components/shared/Toggle";
import { useCrmStore } from "@/lib/crm-store";
import type { BillingRow as BillingRowType } from "@/lib/types";

export function BillingRow({ row }: { row: BillingRowType }) {
  const togglePartnerBillingFlag = useCrmStore((state) => state.togglePartnerBillingFlag);
  const setPartnerVerificationCode = useCrmStore((state) => state.setPartnerVerificationCode);

  return (
    <tr className="border-b border-[var(--line)] text-sm last:border-b-0 hover:bg-[#faf9f7]">
      <td className="px-4 py-3 font-semibold">{row.partnerName}</td>
      <td className="px-4 py-3">
        <span
          className="rounded-md px-2 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: row.conceptColor }}
        >
          {row.conceptName}
        </span>
      </td>
      <td className="px-4 py-3">
        {row.countryFlag} {row.city}
      </td>
      <td className="px-4 py-3">
        <Toggle
          checked={row.live}
          onClick={() => togglePartnerBillingFlag(row.partnerId, row.conceptId, "live")}
        />
      </td>
      <td className="px-4 py-3">
        <Toggle
          checked={row.invoiced}
          onClick={() => togglePartnerBillingFlag(row.partnerId, row.conceptId, "invoiced")}
        />
      </td>
      <td className="px-4 py-3">
        <Toggle
          checked={row.verifDone}
          onClick={() => togglePartnerBillingFlag(row.partnerId, row.conceptId, "verifDone")}
        />
      </td>
      <td className="px-4 py-3">
        <input
          value={row.verif}
          onChange={(event) =>
            setPartnerVerificationCode(row.partnerId, row.conceptId, event.target.value)
          }
          className="h-9 w-28 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2 mono text-xs"
        />
      </td>
    </tr>
  );
}
