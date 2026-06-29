"use client";

import { X } from "lucide-react";

export function Drawer({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: React.ReactNode;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-[var(--surface)] shadow-2xl transition md:max-w-[760px] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-[var(--line)] px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="grotesk text-2xl font-semibold">{title}</h2>
                {subtitle ? <div className="mt-2 text-sm text-[var(--ink-soft)]">{subtitle}</div> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-[var(--ink-soft)] hover:bg-[var(--bg)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="app-scroll flex-1 overflow-y-auto px-6 py-5">{children}</div>
        </div>
      </aside>
    </>
  );
}
