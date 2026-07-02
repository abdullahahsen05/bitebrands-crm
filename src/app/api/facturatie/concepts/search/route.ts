import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "q is required" }, { status: 400 });
  }

  const apiUrl = process.env.FACTURATIE_API_URL;
  const apiToken = process.env.FACTURATIE_CRM_API_TOKEN;

  if (!apiUrl || !apiToken) {
    return NextResponse.json(
      { error: "Facturatie API is nog niet geconfigureerd." },
      { status: 503 },
    );
  }

  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), 8000);

  let upstream: Response;
  try {
    upstream = await fetch(
      `${apiUrl}/api/integrations/crm/concepts/search?q=${encodeURIComponent(q)}`,
      {
        headers: { Authorization: `Bearer ${apiToken}` },
        signal: controller.signal,
      },
    );
  } catch (fetchErr) {
    clearTimeout(abortTimer);
    const isTimeout = fetchErr instanceof Error && fetchErr.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout
          ? "Facturatie API reageert niet (timeout)"
          : "Kan facturatie portal niet bereiken",
      },
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

  const raw = (await upstream.json()) as unknown;
  let results: unknown[];
  if (Array.isArray(raw)) {
    results = raw;
  } else if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    results = Array.isArray(r.results)
      ? r.results
      : Array.isArray(r.data)
        ? r.data
        : Array.isArray(r.concepts)
          ? r.concepts
          : Array.isArray(r.items)
            ? r.items
            : [];
  } else {
    results = [];
  }

  // Strip to safe display fields — never forward IBAN, KVK, BTW, address, email, or payout fields
  const safeResults = results.map((r) => {
    const item = r as Record<string, unknown>;
    return {
      conceptId: item.conceptId ?? null,
      hostRestaurantName: item.hostRestaurantName ?? null,
      virtualConcept: item.virtualConcept ?? null,
      country: item.country ?? null,
      tbPartnerId: item.tbPartnerId ?? null,
    };
  });

  return NextResponse.json({ results: safeResults });
}
