import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { FacturatieConceptRevenue } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { conceptIds?: unknown };
    const { conceptIds } = body;

    if (!Array.isArray(conceptIds) || conceptIds.length === 0) {
      return NextResponse.json(
        { error: "conceptIds must be a non-empty array" },
        { status: 400 },
      );
    }

    const apiUrl = process.env.FACTURATIE_API_URL;
    const apiToken = process.env.FACTURATIE_CRM_API_TOKEN;

    if (!apiUrl || !apiToken) {
      return NextResponse.json(
        { error: "Facturatie API niet geconfigureerd op de server." },
        { status: 503 },
      );
    }

    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 8000);

    let upstream: Response;
    try {
      upstream = await fetch(
        `${apiUrl}/api/integrations/crm/revenue-summary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify({ conceptIds, periodMode: "latest" }),
          signal: controller.signal,
        },
      );
    } catch (fetchErr) {
      clearTimeout(abortTimer);
      const isTimeout = fetchErr instanceof Error && fetchErr.name === "AbortError";
      return NextResponse.json(
        { error: isTimeout ? "Facturatie API reageert niet (timeout)" : "Kan facturatie portal niet bereiken" },
        { status: 502 },
      );
    }
    clearTimeout(abortTimer);

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: `Facturatie API fout: ${upstream.status}`, detail: text },
        { status: upstream.status >= 500 ? 502 : upstream.status },
      );
    }

    // Normalize to { items: FacturatieConceptRevenue[] } regardless of upstream shape
    const raw = (await upstream.json()) as unknown;
    let items: FacturatieConceptRevenue[];
    if (Array.isArray(raw)) {
      items = raw as FacturatieConceptRevenue[];
    } else if (raw && typeof raw === "object") {
      const r = raw as Record<string, unknown>;
      if (Array.isArray(r.data)) {
        items = r.data as FacturatieConceptRevenue[];
      } else if (Array.isArray(r.concepts)) {
        items = r.concepts as FacturatieConceptRevenue[];
      } else if (Array.isArray(r.items)) {
        items = r.items as FacturatieConceptRevenue[];
      } else {
        items = [raw as FacturatieConceptRevenue];
      }
    } else {
      items = [];
    }

    // Strip to safe summary fields — never forward IBAN, KVK, BTW, address, email, or payout-control fields
    const safeItems = items.map((item) => ({
      conceptId: item.conceptId,
      hostRestaurantName: item.hostRestaurantName,
      virtualConcept: item.virtualConcept,
      country: item.country,
      latestPeriod: item.latestPeriod
        ? { weekKey: item.latestPeriod.weekKey, status: item.latestPeriod.status }
        : undefined,
      summary: item.summary
        ? {
            currency: item.summary.currency,
            grossRevenue: item.summary.grossRevenue,
            commissionPct: item.summary.commissionPct,
            commissionAmount: item.summary.commissionAmount,
            commissionVat: item.summary.commissionVat,
            netPayout: item.summary.netPayout,
            invoiceCount: item.summary.invoiceCount,
            lastInvoiceNumber: item.summary.lastInvoiceNumber,
          }
        : undefined,
    }));

    return NextResponse.json({ items: safeItems });
  } catch (err) {
    console.error("[api/facturatie/revenue]", err);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 },
    );
  }
}
