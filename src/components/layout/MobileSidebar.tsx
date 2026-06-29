"use client";

import { Sidebar } from "./Sidebar";

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/30 transition md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 transition md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar mobile />
      </div>
    </>
  );
}
