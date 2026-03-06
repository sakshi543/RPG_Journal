"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { AppShell } from "@/components/AppShell";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { QuestCard } from "@/components/QuestCard";
import { RequireAuth } from "@/components/RequireAuth";
import { XPBar } from "@/components/XPBar";
import { getCharacterOverview, listQuests } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { xpToNextLevel } from "@/lib/xp";

export default function DashboardPage() {
  const token = useAuthStore((s) => s.token)!;
  const user = useAuthStore((s) => s.user);

  const characterQ = useQuery({
    queryKey: ["character"],
    queryFn: () => getCharacterOverview(token),
  });
  const questsQ = useQuery({
    queryKey: ["quests"],
    queryFn: () => listQuests(token),
  });

  const xp = user?.total_xp ?? 0;
  const { xpInLevel, xpNeeded } = xpToNextLevel(xp);
  const stats = characterQ.data?.stats ?? [];

  return (
    <RequireAuth>
      <AppShell title="Dashboard">
        <div className="grid gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-white/10 bg-card/60 p-6 lg:col-span-2 backdrop-blur"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <CharacterAvatar stats={stats} level={user?.level ?? 1} size="lg" />
                <div>
                  <div className="text-sm text-muted">Adventurer</div>
                  <div className="font-display text-2xl font-semibold text-offwhite">
                    {user?.username ?? "—"}
                  </div>
                  <div className="mt-1 font-mono text-sm text-gold">Level {user?.level ?? "—"}</div>
                </div>
              </div>
              <div className="rounded-xl border border-gold/20 bg-gold/5 px-6 py-3 text-center">
                <div className="font-mono text-3xl font-bold text-gold">{xp}</div>
                <div className="text-xs text-muted">Total XP</div>
              </div>
            </div>

            <div className="mt-6">
              <XPBar
                label="Progress to next level"
                current={xpInLevel}
                max={xpNeeded ?? Math.max(1, xpInLevel)}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur"
          >
            <div className="font-display text-lg font-semibold text-offwhite">Character Stats</div>
            <div className="mt-4 space-y-3">
              {characterQ.isLoading ? (
                <div className="text-muted">Loading...</div>
              ) : characterQ.data?.stats.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-muted">
                  Complete quests to build your stats.
                </div>
              ) : (
                characterQ.data.stats
                  .slice()
                  .sort((a, b) => b.total_xp - a.total_xp)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl bg-deep/60 px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {s.category === "Health" && "💪"}
                          {s.category === "Knowledge" && "📚"}
                          {s.category === "Adventure" && "🗺️"}
                          {s.category === "Creativity" && "🎨"}
                          {s.category === "Social" && "🤝"}
                          {s.category === "Wealth" && "💰"}
                        </span>
                        <span>{s.category}</span>
                      </div>
                      <div className="font-mono text-sm text-gold">
                        L{s.level} · {s.total_xp} XP
                      </div>
                    </div>
                  ))
              )}
            </div>
            <Link
              href="/character"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-gold/30 bg-gold/10 py-2.5 text-sm font-medium text-gold transition hover:bg-gold/20"
            >
              View Character Sheet →
            </Link>
          </motion.div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-offwhite">Active Quests</h2>
          <Link
            href="/quests/new"
            className="rounded-xl bg-gradient-to-r from-gold-dim to-gold px-5 py-2.5 font-semibold text-ink shadow-gold transition hover:shadow-gold-strong"
          >
            + New Quest
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {questsQ.isLoading ? (
            <div className="col-span-2 rounded-2xl border border-white/10 bg-card/40 p-12 text-center text-muted">
              Loading quests…
            </div>
          ) : questsQ.isError ? (
            <div className="col-span-2 text-red">Failed to load quests</div>
          ) : questsQ.data?.filter((q) => !q.is_completed).length === 0 ? (
            <div className="col-span-2 rounded-2xl border border-dashed border-white/10 bg-card/40 p-12 text-center">
              <div className="text-4xl mb-4">📜</div>
              <div className="font-display text-xl text-offwhite">No quests yet</div>
              <p className="mt-2 text-muted">Create your first side quest and start earning XP.</p>
              <Link
                href="/quests/new"
                className="mt-4 inline-block rounded-xl bg-gold/20 px-4 py-2 text-gold hover:bg-gold/30"
              >
                Create Quest
              </Link>
            </div>
          ) : (
            questsQ.data
              ?.filter((q) => !q.is_completed)
              .map((q, i) => <QuestCard key={q.id} quest={q} index={i} />)
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
