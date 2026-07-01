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

              {revenue && (
                <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 space-y-3">
                  {revenue.totalRevenue !== undefined && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold">
                        {formatEur(revenue.totalRevenue)}
                      </span>
                      {revenue.period && (
                        <span className="text-xs text-[var(--ink-soft)]">
                          {revenue.period}
                        </span>
                      )}
                    </div>
                  )}

                  {revenue.concepts && revenue.concepts.length > 0 && (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-[var(--grey)] text-left">
                          <th className="pb-1 font-medium">Concept</th>
                          <th className="pb-1 font-medium text-right">Omzet</th>
                          <th className="pb-1 font-medium text-right">
                            Facturen
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)]">
                        {revenue.concepts.map((row) => (
                          <tr key={row.conceptId}>
                            <td className="py-1.5">
                              <div className="mono text-xs text-[var(--ink-soft)]">
                                {row.label ?? row.conceptId}
                              </div>
                            </td>
                            <td className="py-1.5 text-right font-medium">
                              {formatEur(row.revenue)}
                            </td>
                            <td className="py-1.5 text-right text-[var(--ink-soft)]">
                              {row.invoiceCount ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
