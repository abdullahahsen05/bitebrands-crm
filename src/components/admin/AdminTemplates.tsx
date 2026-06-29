"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/shared/Button";
import { useCrmStore } from "@/lib/crm-store";

export function AdminTemplates() {
  const countries = useCrmStore((state) => state.data.config.countries);
  const templates = useCrmStore((state) => state.data.config.templates);
  const updateConfig = useCrmStore((state) => state.updateConfig);
  const [countryCode, setCountryCode] = useState(countries[0]?.code ?? "NL");
  const [channel, setChannel] = useState("wa");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const currentTemplates = useMemo(() => templates[countryCode] ?? [], [templates, countryCode]);

  return (
    <div className="surface-card p-5">
      <h3 className="grotesk text-lg font-semibold">Templates</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {countries.map((country) => (
          <button
            key={country.code}
            type="button"
            onClick={() => setCountryCode(country.code)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              countryCode === country.code
                ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]"
            }`}
          >
            {country.flag} {country.code}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {currentTemplates.map((template) => (
          <div key={template.id} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{template.title}</div>
                <div className="text-xs text-[var(--grey)]">{template.channel}</div>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  updateConfig((config) => {
                    config.templates[countryCode] = (config.templates[countryCode] ?? []).filter(
                      (entry) => entry.id !== template.id,
                    );
                  })
                }
              >
                Verwijder
              </Button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-[var(--line)] bg-white p-3 text-xs text-[var(--ink-soft)]">
              {template.body}
            </pre>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <select className="h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="wa">WhatsApp</option>
            <option value="mail">E-mail</option>
          </select>
          <input className="h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titel" />
        </div>
        {channel === "mail" ? (
          <input className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Onderwerp" />
        ) : null}
        <textarea className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-3" rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" />
        <Button
          variant="primary"
          onClick={() => {
            if (!title || !body) return;
            updateConfig((config) => {
              config.templates[countryCode] = config.templates[countryCode] ?? [];
              config.templates[countryCode].push({
                id: `t${Math.random().toString(36).slice(2, 7)}`,
                channel,
                title,
                subject,
                body,
              });
            });
            setTitle("");
            setSubject("");
            setBody("");
          }}
        >
          Template toevoegen
        </Button>
      </div>
    </div>
  );
}
