import { Badge } from "./Badge";

export function KpiCards({
  items,
}: {
  items: { label: string; value: number; sub?: string; accent?: boolean }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="surface-card p-5">
          <div className={`grotesk text-3xl font-bold ${item.accent ? "text-[var(--accent)]" : ""}`}>
            {item.value}
          </div>
          <div className="mt-2 text-sm text-[var(--ink-soft)]">{item.label}</div>
          {item.sub ? (
            <div className="mt-3">
              <Badge>{item.sub}</Badge>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
