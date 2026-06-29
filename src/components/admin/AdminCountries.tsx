"use client";

import { useState } from "react";

import { Button } from "@/components/shared/Button";
import { useCrmStore } from "@/lib/crm-store";

export function AdminCountries() {
  const countries = useCrmStore((state) => state.data.config.countries);
  const partners = useCrmStore((state) => state.data.partners);
  const updateConfig = useCrmStore((state) => state.updateConfig);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [flag, setFlag] = useState("🏳️");

  return (
    <div className="surface-card p-5">
      <h3 className="grotesk text-lg font-semibold">Landen</h3>
      <div className="mt-4 space-y-3">
        {countries.map((country) => (
          <div key={country.code} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
            <div>
              <div className="font-semibold">
                {country.flag} {country.name}
              </div>
              <div className="text-xs text-[var(--grey)]">{country.code}</div>
            </div>
            <Button
              size="sm"
              onClick={() =>
                updateConfig((config) => {
                  if (partners.some((partner) => partner.country === country.code)) return;
                  config.countries = config.countries.filter((entry) => entry.code !== country.code);
                  delete config.templates[country.code];
                })
              }
            >
              Verwijder
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-[90px_1fr_120px_auto]">
        <input className="h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={flag} onChange={(e) => setFlag(e.target.value)} placeholder="🇳🇱" />
        <input className="h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Naam" />
        <input className="h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 uppercase" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Code" />
        <Button
          variant="primary"
          onClick={() => {
            if (!name || !code) return;
            updateConfig((config) => {
              config.countries.push({ code, name, flag });
              config.templates[code] = config.templates[code] ?? [];
            });
            setName("");
            setCode("");
            setFlag("🏳️");
          }}
        >
          Toevoegen
        </Button>
      </div>
    </div>
  );
}
