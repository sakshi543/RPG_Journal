"use client";

import type { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={`w-full rounded-xl border border-white/10 bg-deep/40 px-3 py-2 text-offwhite outline-none placeholder:text-muted focus:border-gold ${className}`}
      {...rest}
    />
  );
}

