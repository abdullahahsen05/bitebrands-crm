export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="surface-card px-6 py-14 text-center">
      <h3 className="grotesk text-lg font-semibold text-[var(--ink)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">{body}</p>
    </div>
  );
}
