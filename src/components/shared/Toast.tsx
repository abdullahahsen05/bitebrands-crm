"use client";

import { useEffect } from "react";

export function Toast({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(onClose, 2200);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-medium text-white transition ${
        message ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {message}
    </div>
  );
}
