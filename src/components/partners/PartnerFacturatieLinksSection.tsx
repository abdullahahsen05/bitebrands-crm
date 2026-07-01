"use client";

import { useEffect, useState } from "react";

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
  FacturatieLink,
  FacturatieRevenueSummary,
  Partner,
} from "@/lib/types";

function formatEur(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-[var(--ink-soft)]">{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}

function ConceptRevenueCard({ item }: { item: FacturatieConceptRevenue }) {
  const s = item.summary;
  const name = [item.hostRestaurantName, item.virtualConcept].filter(Boolean).join(" / ") || item.conceptId || "—";
  const period = item.latestPeriod?.weekKey;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-sm">{name}</div>
          {period && (
            <div className="text-xs text-[var(--ink-soft)] mt-0.5">{period}</div>
          )}
        </div>
        {s?.grossRevenue !== undefined && (
          <div className="text-lg font-semibold shrink-0">{formatEur(s.grossRevenue)}</div>
        )}
      </div>

      {s && (
        <div className="border-t border-[var(--line)] pt-3 space-y-1.5">
          {s.commissionAmount !== undefined && (
            <Row label={`Commissie${s.commissionPct ? ` (${s.commissionPct}%)` : ""}`} value={formatEur(s.commissionAmount)} />
          )}
          {s.commissionVat !== undefined && (
            <Row label="BTW commissie" value={formatEur(s.commissionVat)} />
          )}
          {s.netPayout !== undefined && (
            <Row label="Netto uitbetaling" value={formatEur(s.netPayout)} bold />
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

  const [links, setLinks] = useState<FacturatieLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState<string | null>(null);

  const [newConceptId, setNewConceptId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [revenue, setRevenue] = useState<FacturatieRevenueSummary | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLinksLoading(true);
    setLinksError(null);
    getPartnerFacturatieLinks(partner.id)
      .then((l) => {
        if (active) {
          setLinks(l);
          setLinksLoading(false);
        }
      })
      .catch((e: Error) => {
        if (active) {
          setLinksError(e.message);
          setLinksLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [partner.id]);

  async function handleAdd() {
    const conceptId = newConceptId.trim();
    if (!conceptId || adding) return;
    setAdding(true);
    setAddError(null);
    try {
      const link = await addPartnerFacturatieLink(
        partner.id,
        conceptId,
        newLabel.trim() || undefined,
      );
      setLinks((prev) => [...prev, link]);
      setNewConceptId("");
      setNewLabel("");
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
      if (!res.ok) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      setRevenue(json);
    } catch (e: unknown) {
      setRevenueError((e as Error).message);
    } finally {
      setRevenueLoading(false);
    }
  }

  if (!canView) return null;

  const fieldClass =
    "h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 text-sm";

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--grey)]">
        Facturatie koppeling
      </h3>

      {linksLoading ? (
        <p className="text-sm text-[var(--ink-soft)]">Laden…</p>
      ) : linksError ? (
        <p className="text-sm text-[var(--red)]">{linksError}</p>
      ) : (
        <>
          {links.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">
              Geen facturatie-concepten gekoppeld.
            </p>
          ) : (
            <ul className="space-y-2">
              {links.map((link) => (
                <li
                  key={link.id}
                  className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="mono text-sm font-medium truncate">
                      {link.conceptId}
                    </div>
                    {link.label && (
                      <div className="text-xs text-[var(--ink-soft)] truncate">
                        {link.label}
                      </div>
                    )}
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => void handleRemove(link.id)}
                      className="text-xs text-[var(--red)] hover:underline shrink-0"
                    >
                      Verwijder
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {canManage && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Concept-ID (facturatie portal)"
                  value={newConceptId}
                  onChange={(e) => setNewConceptId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleAdd();
                  }}
                  className={`${fieldClass} flex-1 mono`}
                  disabled={adding}
                />
                <input
                  type="text"
                  placeholder="Label (optioneel)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleAdd();
                  }}
                  className={`${fieldClass} w-40`}
                  disabled={adding}
                />
                <button
                  type="button"
                  onClick={() => void handleAdd()}
                  disabled={adding || !newConceptId.trim()}
                  className="h-10 rounded-xl bg-[var(--accent)] px-4 text-sm font-medium text-white disabled:opacity-50"
                >
                  {adding ? "…" : "Toevoegen"}
                </button>
              </div>
              {addError && (
                <p className="text-xs text-[var(--red)]">{addError}</p>
              )}
            </div>
          )}

          {links.length > 0 && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => void handleFetchRevenue()}
                disabled={revenueLoading}
                className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-medium hover:bg-[var(--bg)] disabled:opacity-50 transition"
              >
                {revenueLoading ? "Omzet ophalen…" : "Haal omzet op"}
              </button>

              {revenueError && (
                <p className="text-sm text-[var(--red)]">{revenueError}</p>
              )}

              {revenue && revenue.items.length > 0 && (
                <div className="space-y-3">
                  {revenue.items.map((item, i) => (
                    <ConceptRevenueCard key={item.conceptId ?? i} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
