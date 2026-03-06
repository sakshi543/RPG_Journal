"use client";

import { motion } from "framer-motion";

import type { CharacterStat } from "@/lib/types";

type AvatarTraits = {
  athletic: number; // 0-1 from Health
  scholarly: number; // 0-1 from Knowledge
  adventurous: number; // 0-1 from Adventure
  creative: number; // 0-1 from Creativity
  social: number; // 0-1 from Social
  wealthy: number; // 0-1 from Wealth
};

function computeTraits(stats: CharacterStat[]): AvatarTraits {
  const total = stats.reduce((s, x) => s + x.total_xp, 0) || 1;
  const get = (cat: string) =>
    Math.min(1, (stats.find((s) => s.category === cat)?.total_xp ?? 0) / (total / 2));
  return {
    athletic: get("Health"),
    scholarly: get("Knowledge"),
    adventurous: get("Adventure"),
    creative: get("Creativity"),
    social: get("Social"),
    wealthy: get("Wealth"),
  };
}

export function CharacterAvatar({
  stats,
  level,
  size = "md",
}: {
  stats: CharacterStat[];
  level: number;
  size?: "sm" | "md" | "lg";
}) {
  const traits = computeTraits(stats);
  const s = size === "sm" ? 64 : size === "md" ? 96 : 128;

  // Body shape: more athletic = broader shoulders, visible abs
  const shoulderWidth = 0.5 + traits.athletic * 0.15;
  const absVisible = traits.athletic > 0.3;
  const hasGlasses = traits.scholarly > 0.4;
  const crownVisible = level >= 5;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative inline-flex items-center justify-center rounded-2xl border border-gold/20 bg-gradient-to-b from-card to-deep"
      style={{ width: s, height: s }}
    >
      <svg
        viewBox="0 0 100 100"
        className="overflow-visible"
        style={{ width: s - 8, height: s - 8 }}
      >
        {/* Head */}
        <ellipse
          cx="50"
          cy="38"
          rx="22"
          ry="24"
          fill="#e8c4a0"
          stroke="#c9a87a"
          strokeWidth="1"
        />
        {/* Eyes */}
        <ellipse cx="42" cy="36" rx="3" ry="4" fill="#1a1625" />
        <ellipse cx="58" cy="36" rx="3" ry="4" fill="#1a1625" />
        {hasGlasses && (
          <>
            <rect x="36" y="32" width="14" height="10" rx="2" fill="none" stroke="#4a4558" strokeWidth="1.5" />
            <rect x="50" y="32" width="14" height="10" rx="2" fill="none" stroke="#4a4558" strokeWidth="1.5" />
            <line x1="50" y1="37" x2="50" y2="37" stroke="#4a4558" strokeWidth="1" />
          </>
        )}
        {/* Body - torso shape */}
        <path
          d={`M ${50 - 20 * shoulderWidth} 62 Q 50 78 ${50 + 20 * shoulderWidth} 62 L 52 95 L 48 95 Z`}
          fill="#2d3a4a"
          stroke="#1a2530"
          strokeWidth="1"
        />
        {/* Abs (visible when athletic) */}
        {absVisible && (
          <g opacity={0.3 + traits.athletic * 0.5}>
            <line x1="45" y1="68" x2="55" y2="68" stroke="#c9a87a" strokeWidth="0.8" />
            <line x1="44" y1="74" x2="56" y2="74" stroke="#c9a87a" strokeWidth="0.8" />
            <line x1="45" y1="80" x2="55" y2="80" stroke="#c9a87a" strokeWidth="0.8" />
          </g>
        )}
        {/* Crown for high level */}
        {crownVisible && (
          <path
            d="M 35 28 L 50 18 L 65 28 L 60 28 L 60 32 L 40 32 L 40 28 Z"
            fill="#F5A623"
            stroke="#c4851c"
            strokeWidth="0.5"
          />
        )}
      </svg>
      <div className="absolute -bottom-1 -right-1 rounded-full bg-gold/90 px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink">
        {level}
      </div>
    </motion.div>
  );
}
