"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({
  className,
  variant = "ghost",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border px-4 font-medium transition",
        size === "md" ? "h-10 text-sm" : "h-8 px-3 text-xs",
        variant === "primary" &&
          "border-[var(--accent)] bg-[var(--accent)] text-white hover:brightness-110",
        variant === "ghost" &&
          "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--bg)]",
        variant === "danger" &&
          "border-[var(--red)] bg-[var(--red)] text-white hover:brightness-110",
        className,
      )}
      {...props}
    />
  );
}
