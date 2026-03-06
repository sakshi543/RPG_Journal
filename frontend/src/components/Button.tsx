"use client";

import type { ButtonHTMLAttributes } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const { variant = "primary", className = "", ...rest } = props;
  const base = "rounded-xl px-4 py-2 font-semibold transition disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-gold text-night hover:bg-amber"
      : "border border-white/10 hover:bg-white/5";
  return <button className={`${base} ${styles} ${className}`} {...rest} />;
}

