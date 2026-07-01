import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { FacturatieRevenueSummary } from "@/lib/types";

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

    const upstream = await fetch(
      `${apiUrl}/api/integrations/crm/revenue-summary`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ conceptIds }),
      },
    );

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: `Facturatie API fout: ${upstream.status}`, detail: text },
        { status: upstream.status >= 500 ? 502 : upstream.status },
      );
    }

    const data = (await upstream.json()) as FacturatieRevenueSummary;
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/facturatie/revenue]", err);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 },
    );
  }
}
