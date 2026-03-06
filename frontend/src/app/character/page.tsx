"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { AppShell } from "@/components/AppShell";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { RequireAuth } from "@/components/RequireAuth";
import { XPBar } from "@/components/XPBar";
import { getCharacterOverview } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { xpToNextLevel } from "@/lib/xp";

const categoryIcons: Record<string, string> = {
  Health: "💪",
  Knowledge: "📚",
  Adventure: "🗺️",
  Creativity: "🎨",
  Social: "🤝",
  Wealth: "💰",
};

export default function CharacterPage() {
  const token = useAuthStore((s) => s.token)!;
  const user = useAuthStore((s) => s.user);

  const q = useQuery({
    queryKey: ["character"],
    queryFn: () => getCharacterOverview(token),
  });

  const xp = user?.total_xp ?? 0;
  const { xpInLevel, xpNeeded } = xpToNextLevel(xp);

  return (
    <RequireAuth>
      <AppShell title="Character Sheet">
        <div className="grid gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-card/60 p-8 backdrop-blur"
          >
            <div className="flex flex-col items-center gap-6">
              <CharacterAvatar
                stats={q.data?.stats ?? []}
                level={user?.level ?? 1}
                size="lg"
              />
              <div className="text-center">
                <div className="font-display text-2xl font-semibold text-offwhite">
                  {user?.username ?? "Adventurer"}
                </div>
                <div className="mt-1 font-mono text-gold">Level {user?.level ?? "1"}</div>
                <div className="mt-4">
                  <XPBar
                    label="Global progress"
                    current={xpInLevel}
                    max={xpNeeded ?? Math.max(1, xpInLevel)}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-card/60 p-6 lg:col-span-2 backdrop-blur"
          >
            <div className="font-display text-lg font-semibold text-offwhite">
              Category Stats
            </div>
            <p className="mt-1 text-sm text-muted">
              Your character evolves as you complete quests. Excel in Health for an athletic look, Knowledge for a scholarly vibe, and more.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {q.isLoading ? (
                <div className="col-span-2 text-muted">Loading…</div>
              ) : q.data?.stats.length === 0 ? (
                <div className="col-span-2 rounded-xl border border-dashed border-white/10 p-8 text-center text-muted">
                  Complete quests to build your stats. Each category shapes your character.
                </div>
              ) : (
                q.data?.stats
                  .slice()
                  .sort((a, b) => b.total_xp - a.total_xp)
                  .map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-deep/60 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{categoryIcons[s.category] ?? "⚔️"}</span>
                        <div>
                          <div className="font-medium">{s.category}</div>
                          <div className="text-xs text-muted">
                            Streak: {s.streak_count} · Best: {s.longest_streak}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-gold">L{s.level}</div>
                        <div className="text-xs text-muted">{s.total_xp} XP</div>
                      </div>
                    </motion.div>
                  ))
              )}
            </div>
          </motion.div>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
