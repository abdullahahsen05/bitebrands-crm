import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warning" | "success" | "danger" | "accent";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        tone === "neutral" && "bg-[var(--bg)] text-[var(--ink-soft)]",
        tone === "warning" && "bg-[var(--amber-soft)] text-[var(--amber)]",
        tone === "success" && "bg-[var(--green-soft)] text-[var(--green)]",
        tone === "danger" && "bg-[var(--red-soft)] text-[var(--red)]",
        tone === "accent" && "bg-[var(--accent-soft)] text-[var(--accent)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
