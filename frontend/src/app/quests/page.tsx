"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { QuestCard } from "@/components/QuestCard";
import { RequireAuth } from "@/components/RequireAuth";
import { listQuests } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

export default function QuestsPage() {
  const token = useAuthStore((s) => s.token)!;
  const q = useQuery({ queryKey: ["quests"], queryFn: () => listQuests(token) });

  return (
    <RequireAuth>
      <AppShell title="Quest Board">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted">Side quests you’re tackling outside your 9–5.</div>
          <Link className="rounded-xl bg-gold px-4 py-2 font-semibold text-night" href="/quests/new">
            New quest
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {q.isLoading ? (
            <div className="text-muted">Loading…</div>
          ) : q.isError ? (
            <div className="text-red">Failed to load quests</div>
          ) : q.data.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-card p-6 text-muted">
              Create a quest and give yourself XP for doing the things you actually care about.
            </div>
          ) : (
            q.data.map((quest) => <QuestCard key={quest.id} quest={quest} />)
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}

