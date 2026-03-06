"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import type { Quest } from "@/lib/types";

const categoryConfig: Record<string, { bg: string; border: string; icon: string }> = {
  Health: { bg: "bg-red/10", border: "border-red/50", icon: "💪" },
  Knowledge: { bg: "bg-teal/10", border: "border-teal/50", icon: "📚" },
  Adventure: { bg: "bg-amber/10", border: "border-amber/50", icon: "🗺️" },
  Creativity: { bg: "bg-violet/10", border: "border-violet/50", icon: "🎨" },
  Social: { bg: "bg-mint/10", border: "border-mint/50", icon: "🤝" },
  Wealth: { bg: "bg-gold/10", border: "border-gold/50", icon: "💰" },
};

const difficultyColors: Record<string, string> = {
  Easy: "text-mint",
  Medium: "text-gold",
  Hard: "text-amber",
  Legendary: "text-red",
};

export function QuestCard({ quest, index = 0 }: { quest: Quest; index?: number }) {
  const config = categoryConfig[quest.category] || {
    bg: "bg-white/5",
    border: "border-white/10",
    icon: "⚔️",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/quests/${quest.id}`} className="block">
        <div
          className={`group relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} bg-card/80 p-5 transition-all duration-300 hover:border-gold/30 hover:shadow-gold card-lift`}
        >
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-current to-transparent opacity-50" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm text-muted">
                <span>{config.icon}</span>
                <span>{quest.category}</span>
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold text-offwhite group-hover:text-gold transition-colors">
                {quest.title}
              </h3>
              {quest.description ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted">{quest.description}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyColors[quest.difficulty] || "text-muted"}`}>
                {quest.difficulty}
              </span>
              <span className="rounded-full bg-gold/20 px-3 py-1 font-mono text-sm font-bold text-gold">
                +{quest.xp_reward} XP
              </span>
            </div>
          </div>
          {quest.quest_type === "progress" && quest.progress_target ? (
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-deep">
                <div
                  className="h-full rounded-full bg-gold transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (quest.progress_current / quest.progress_target) * 100)}%`,
                  }}
                />
              </div>
              <span className="font-mono text-xs text-muted">
                {quest.progress_current}/{quest.progress_target}
              </span>
            </div>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
}
