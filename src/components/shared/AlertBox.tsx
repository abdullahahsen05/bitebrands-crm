import { AlertTriangle } from "lucide-react";

import { Badge } from "./Badge";

export function AlertBox({
  title,
  tone = "warning",
  count,
  children,
}: {
  title: string;
  tone?: "warning" | "critical";
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`surface-card border-l-4 p-4 ${
        tone === "critical" ? "border-l-[var(--red)]" : "border-l-[var(--amber)]"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <h3 className="grotesk text-sm font-semibold">{title}</h3>
        {typeof count === "number" ? (
          <Badge tone={tone === "critical" ? "danger" : "warning"}>{count}</Badge>
        ) : null}
      </div>
      <div className="text-sm text-[var(--ink-soft)]">{children}</div>
    </div>
  );
}
