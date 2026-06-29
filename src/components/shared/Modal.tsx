"use client";

import { X } from "lucide-react";

export function Modal({
  open,
  title,
  hint,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  hint?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="surface-card max-h-[92vh] w-full max-w-xl overflow-y-auto">
        <div className="flex items-start justify-between border-b border-[var(--line)] px-6 py-5">
          <div>
            <h2 className="grotesk text-xl font-semibold">{title}</h2>
            {hint ? <p className="mt-1 text-sm text-[var(--ink-soft)]">{hint}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--ink-soft)] hover:bg-[var(--bg)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">{children}</div>
        {footer ? <div className="border-t border-[var(--line)] px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
