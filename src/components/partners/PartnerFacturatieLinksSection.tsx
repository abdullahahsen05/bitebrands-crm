"use client";

import { useEffect, useRef, useState } from "react";

import { useCrmStore } from "@/lib/crm-store";
import {
  canManageFacturatieLinks,
  canViewFacturatieLinks,
} from "@/lib/permissions";
import {
  addPartnerFacturatieLink,
  getPartnerFacturatieLinks,
  removePartnerFacturatieLink,
} from "@/lib/supabase/facturatie-service";
import type {
  FacturatieConceptRevenue,
  FacturatieConceptSearchResult,
  FacturatieLink,
  FacturatieRevenueSummary,
  Partner,
} from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function eur(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-[var(--ink-soft)]">{label}</span>
      <span
        className={`tabular-nums ${bold ? "font-semibold" : ""} ${accent ? "text-[var(--accent)]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function TotalsCard({ items }: { items: FacturatieConceptRevenue[] }) {
  const totals = items.reduce(
    (acc, item) => {
      const s = item.summary;
      return {
        gross: acc.gross + (s?.grossRevenue ?? 0),
        commission: acc.commission + (s?.commissionAmount ?? 0),
        vat: acc.vat + (s?.commissionVat ?? 0),
        net: acc.net + (s?.netPayout ?? 0),
        invoices: acc.invoices + (s?.invoiceCount ?? 0),
      };
    },
    { gross: 0, commission: 0, vat: 0, net: 0, invoices: 0 },
  );

  // Latest period and last invoice across all concepts
  const latestPeriod = items
    .map((i) => i.latestPeriod?.weekKey)
    .filter(Boolean)
    .sort()
    .at(-1);
  const lastInvoice = items
    .filter((i) => i.latestPeriod?.weekKey === latestPeriod)
    .map((i) => i.summary?.lastInvoiceNumber)
    .filter(Boolean)
    .at(-1);

  return (
    <div className="rounded-xl border border-[var(--accent)] bg-[var(--surface)] p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--grey)]">
            Totaal omzet
          </span>
          {latestPeriod && (
            <div className="text-xs text-[var(--ink-soft)] mt-0.5">
              Periode: {latestPeriod}
            </div>
          )}
        </div>
        <span className="text-xl font-bold tabular-nums">{eur(totals.gross)}</span>
      </div>
      <div className="border-t border-[var(--line)] pt-3 space-y-1.5">
        <Row label="Commissie" value={eur(totals.commission)} />
        <Row label="BTW commissie" value={eur(totals.vat)} />
        <Row label="Netto uitbetaling" value={eur(totals.net)} bold accent />
        <Row label="Facturen" value={String(totals.invoices)} />
        {lastInvoice && <Row label="Laatste factuur" value={lastInvoice} />}
      </div>
    </div>
  );
}

function ConceptRevenueCard({ item }: { item: FacturatieConceptRevenue }) {
  const s = item.summary;
  const name =
    [item.hostRestaurantName, item.virtualConcept].filter(Boolean).join(" / ") ||
    item.conceptId ||
    "—";
  const period = item.latestPeriod?.weekKey;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium text-sm">{name}</div>
          {period && (
            <div className="text-xs text-[var(--ink-soft)] mt-0.5">
              Periode: {period}
            </div>
          )}
        </div>
        {s?.grossRevenue !== undefined && (
          <div className="text-base font-semibold shrink-0 tabular-nums">
            {eur(s.grossRevenue)}
          </div>
        )}
      </div>
      {s && (
        <div className="border-t border-[var(--line)] pt-3 space-y-1.5">
          {s.commissionAmount !== undefined && (
            <Row
              label={`Commissie${s.commissionPct ? ` (${s.commissionPct}%)` : ""}`}
              value={eur(s.commissionAmount)}
            />
          )}
          {s.commissionVat !== undefined && (
            <Row label="BTW commissie" value={eur(s.commissionVat)} />
          )}
          {s.netPayout !== undefined && (
            <Row label="Netto uitbetaling" value={eur(s.netPayout)} bold />
          )}
          {s.invoiceCount !== undefined && (
            <Row label="Facturen" value={String(s.invoiceCount)} />
          )}
          {s.lastInvoiceNumber && (
            <Row label="Laatste factuur" value={s.lastInvoiceNumber} />
          )}
        </div>
      )}
    </div>
  );
}

function LinkedConceptCard({
  link,
  canManage,
  onRemove,
}: {
  link: FacturatieLink;
  canManage: boolean;
  onRemove: (id: string) => void;
}) {
  const [showId, setShowId] = useState(false);
  const name =
    [link.hostRestaurantName, link.virtualConcept].filter(Boolean).join(" / ") ||
    link.label ||
    link.conceptId;

  return (
    <li className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {link.country && (
            <span className="text-xs text-[var(--ink-soft)]">{link.country}</span>
          )}
          {link.tbPartnerId && (
            <span className="text-xs text-[var(--ink-soft)]">
              TB: {link.tbPartnerId}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowId((v) => !v)}
            className="text-xs text-[var(--grey)] hover:text-[var(--ink-soft)] transition-colors"
          >
            {showId ? "Verberg ID" : "Toon concept-ID"}
          </button>
        </div>
        {showId && (
          <div className="mono text-xs text-[var(--grey)] break-all pt-0.5">
            {link.conceptId}
          </div>
        )}
      </div>
      {canManage && (
        <button
          type="button"
          onClick={() => onRemove(link.id)}
          className="text-xs text-[var(--red)] hover:underline shrink-0 mt-0.5"
        >
          Verwijder
        </button>
      )}
    </li>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function PartnerFacturatieLinksSection({
  partner,
}: {
  partner: Partner;
}) {
  const storeData = useCrmStore((state) => state.data);
  const currentUser = storeData.users.find(
    (u) => u.id === storeData.currentUserId,
  );

  const canManage = canManageFacturatieLinks(currentUser);
  const canView = canViewFacturatieLinks(currentUser);

  // ── Linked concepts ──────────────────────────────────────────────────────
  const [links, setLinks] = useState<FacturatieLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLinksLoading(true);
      setLinksError(null);
      try {
        const l = await getPartnerFacturatieLinks(partner.id);
        if (active) {
          setLinks(l);
          setLinksLoading(false);
        }
      } catch (e) {
        if (active) {
          setLinksError((e as Error).message);
          setLinksLoading(false);
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [partner.id]);

  // ── Search ───────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FacturatieConceptSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = searchQuery.trim();
    searchTimer.current = setTimeout(() => {
      if (q.length < 2) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }
      setSearching(true);
      setSearchError(null);
      fetch(`/api/facturatie/concepts/search?q=${encodeURIComponent(q)}`)
        .then(async (res) => {
          const json = (await res.json()) as {
            results?: FacturatieConceptSearchResult[];
            error?: string;
          };
          if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
          setSearchResults(json.results ?? []);
        })
        .catch((e: Error) => setSearchError(e.message))
        .finally(() => setSearching(false));
    }, 300);
  }, [searchQuery]);

  // ── Link / unlink ────────────────────────────────────────────────────────
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleLink(result: FacturatieConceptSearchResult) {
    if (adding) return;
    if (links.some((l) => l.conceptId === result.conceptId)) return;
    setAdding(true);
    setAddError(null);
    try {
      const label =
        [result.hostRestaurantName, result.virtualConcept]
          .filter(Boolean)
          .join(" / ") || result.conceptId;
      const link = await addPartnerFacturatieLink(partner.id, result.conceptId, {
        label,
        country: result.country,
        tbPartnerId: result.tbPartnerId,
        virtualConcept: result.virtualConcept,
        hostRestaurantName: result.hostRestaurantName,
      });
      setLinks((prev) => [...prev, link]);
      setSearchQuery("");
      setSearchResults([]);
      setRevenue(null);
    } catch (e: unknown) {
      setAddError((e as Error).message);
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      await removePartnerFacturatieLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      setRevenue(null);
    } catch (e: unknown) {
      setLinksError((e as Error).message);
    }
  }

  // ── Manual fallback ──────────────────────────────────────────────────────
  const [showManual, setShowManual] = useState(false);
  const [manualId, setManualId] = useState("");
  const [manualLabel, setManualLabel] = useState("");

  async function handleManualAdd() {
    const conceptId = manualId.trim();
    if (!conceptId || adding) return;
    setAdding(true);
    setAddError(null);
    try {
      const link = await addPartnerFacturatieLink(partner.id, conceptId, {
        label: manualLabel.trim() || undefined,
      });
      setLinks((prev) => [...prev, link]);
      setManualId("");
      setManualLabel("");
      setRevenue(null);
    } catch (e: unknown) {
      setAddError((e as Error).message);
    } finally {
      setAdding(false);
    }
  }

  // ── Revenue ──────────────────────────────────────────────────────────────
  const [revenue, setRevenue] = useState<FacturatieRevenueSummary | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  async function handleFetchRevenue() {
    if (links.length === 0 || revenueLoading) return;
    setRevenueLoading(true);
    setRevenueError(null);
    try {
      const res = await fetch("/api/facturatie/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptIds: links.map((l) => l.conceptId) }),
      });
      const json = (await res.json()) as FacturatieRevenueSummary & {
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setRevenue(json);
    } catch (e: unknown) {
      setRevenueError((e as Error).message);
    } finally {
      setRevenueLoading(false);
    }
  }

  if (!canView) return null;

  const fieldCls =
    "h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-[var(--accent)] transition-colors";

  return (
    <div className="mt-6 space-y-5">
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--grey)]">
          Facturatie koppeling
        </h3>
        <p className="text-xs text-[var(--ink-soft)]">
          Koppel één of meerdere facturatieconcepten om omzetgegevens uit het facturatieportaal te tonen.
        </p>
      </div>

      {linksLoading ? (
        <p className="text-sm text-[var(--ink-soft)]">Laden…</p>
      ) : linksError ? (
        <p className="text-sm text-[var(--red)]">{linksError}</p>
      ) : (
        <div className="space-y-4">
          {/* Linked concepts */}
          {links.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">
              Nog geen facturatie concepten gekoppeld.
            </p>
          ) : (
            <ul className="space-y-2">
              {links.map((link) => (
                <LinkedConceptCard
                  key={link.id}
                  link={link}
                  canManage={canManage}
                  onRemove={(id) => void handleRemove(id)}
                />
              ))}
            </ul>
          )}

          {/* Search & link */}
          {canManage && (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Zoek facturatie concept op naam, concept, land of TB Partner ID…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${fieldCls} w-full pr-8`}
                  disabled={adding}
                />
                {searching && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--ink-soft)] pointer-events-none">
                    …
                  </span>
                )}
              </div>

              {searchError && (
                <p className="text-xs text-[var(--red)]">{searchError}</p>
              )}

              {searchResults.length > 0 && (
                <ul className="rounded-xl border border-[var(--line)] divide-y divide-[var(--line)] overflow-hidden">
                  {searchResults.map((result) => {
                    const alreadyLinked = links.some(
                      (l) => l.conceptId === result.conceptId,
                    );
                    const name =
                      [result.hostRestaurantName, result.virtualConcept]
                        .filter(Boolean)
                        .join(" / ") || result.conceptId;
                    return (
                      <li
                        key={result.conceptId}
                        className="flex items-center gap-3 px-4 py-3 bg-[var(--surface)]"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{name}</div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                            {result.country && (
                              <span className="text-xs text-[var(--ink-soft)]">
                                {result.country}
                              </span>
                            )}
                            {result.tbPartnerId && (
                              <span className="text-xs text-[var(--ink-soft)]">
                                TB: {result.tbPartnerId}
                              </span>
                            )}
                          </div>
                        </div>
                        {alreadyLinked ? (
                          <span className="text-xs text-[var(--ink-soft)] shrink-0">
                            Gekoppeld
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleLink(result)}
                            disabled={adding}
                            className="shrink-0 h-8 rounded-lg bg-[var(--accent)] px-3 text-xs font-medium text-white disabled:opacity-50"
                          >
                            {adding ? "…" : "Koppel"}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {searchQuery.trim().length >= 2 &&
                !searching &&
                searchResults.length === 0 &&
                !searchError && (
                  <p className="text-xs text-[var(--ink-soft)]">
                    Geen concepten gevonden voor &ldquo;{searchQuery.trim()}&rdquo;.
                  </p>
                )}

              {addError && (
                <p className="text-xs text-[var(--red)]">{addError}</p>
              )}

              {/* Manual fallback */}
              <details
                open={showManual}
                onToggle={(e) =>
                  setShowManual((e.currentTarget as HTMLDetailsElement).open)
                }
                className="group"
              >
                <summary className="cursor-pointer text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] select-none list-none flex items-center gap-1.5 w-fit pt-1">
                  <span className="group-open:hidden">▸</span>
                  <span className="hidden group-open:inline">▾</span>
                  Handmatig concept-ID toevoegen
                </summary>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <input
                    type="text"
                    placeholder="Concept-ID (UUID)"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleManualAdd();
                    }}
                    className={`${fieldCls} flex-1 min-w-0 mono`}
                    disabled={adding}
                  />
                  <input
                    type="text"
                    placeholder="Label (optioneel)"
                    value={manualLabel}
                    onChange={(e) => setManualLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleManualAdd();
                    }}
                    className={`${fieldCls} w-36`}
                    disabled={adding}
                  />
                  <button
                    type="button"
                    onClick={() => void handleManualAdd()}
                    disabled={adding || !manualId.trim()}
                    className="h-10 rounded-xl bg-[var(--accent)] px-4 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {adding ? "…" : "Toevoegen"}
                  </button>
                </div>
              </details>
            </div>
          )}

          {/* Revenue */}
          {links.length > 0 && (
            <div className="space-y-3 pt-1 border-t border-[var(--line)]">
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => void handleFetchRevenue()}
                  disabled={revenueLoading}
                  className="h-9 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-medium hover:bg-[var(--bg)] disabled:opacity-50 transition"
                >
                  {revenueLoading ? "Gegevens ophalen…" : "Omzetgegevens ophalen"}
                </button>
                {revenue && !revenueLoading && (
                  <button
                    type="button"
                    onClick={() => setRevenue(null)}
                    className="text-xs text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  >
                    Verberg resultaten
                  </button>
                )}
              </div>

              {revenueError && (
                <p className="text-sm text-[var(--red)]">{revenueError}</p>
              )}

              {revenue && revenue.items.length === 0 && (
                <p className="text-sm text-[var(--ink-soft)]">
                  Nog geen omzetgegevens gevonden voor de gekoppelde concepten.
                </p>
              )}

              {revenue && revenue.items.length > 0 && (
                <div className="space-y-3">
                  {revenue.items.length > 1 && (
                    <TotalsCard items={revenue.items} />
                  )}
                  {revenue.items.map((item, i) => (
                    <ConceptRevenueCard key={item.conceptId ?? i} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
