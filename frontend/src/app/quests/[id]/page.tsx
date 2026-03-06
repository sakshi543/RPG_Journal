"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { getQuest, listLogsForQuest } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

export default function QuestDetailPage() {
  const params = useParams<{ id: string }>();
  const questId = params.id;
  const token = useAuthStore((s) => s.token)!;

  const questQ = useQuery({ queryKey: ["quest", questId], queryFn: () => getQuest(token, questId) });
  const logsQ = useQuery({ queryKey: ["logs", questId], queryFn: () => listLogsForQuest(token, questId) });

  return (
    <RequireAuth>
      <AppShell title="Quest Detail">
        {questQ.isLoading ? (
          <div className="text-muted">Loading…</div>
        ) : questQ.isError ? (
          <div className="text-red">Failed to load quest</div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm text-muted">{questQ.data.category}</div>
                <div className="font-serif text-3xl">{questQ.data.title}</div>
                {questQ.data.description ? <p className="mt-2 text-muted">{questQ.data.description}</p> : null}
              </div>
              <div className="rounded-2xl bg-deep/60 px-4 py-3 text-right">
                <div className="text-xs text-muted">Reward</div>
                <div className="font-mono text-2xl">{questQ.data.xp_reward} XP</div>
                <div className="mt-1 text-xs text-muted">
                  {questQ.data.difficulty} • {questQ.data.quest_type}
                </div>
              </div>
            </div>

            {questQ.data.is_completed ? (
              <div className="mt-5 rounded-xl border border-mint/40 bg-mint/10 p-3 text-sm">
                Completed. You can still journal it, and repeatable/progress quests can keep generating memories.
              </div>
            ) : (
              <div className="mt-5">
                <Link className="rounded-xl bg-gold px-4 py-2 font-semibold text-night" href={`/complete/${questId}`}>
                  Complete quest →
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <h2 className="font-serif text-2xl">History</h2>
          <div className="mt-4 space-y-3">
            {logsQ.isLoading ? (
              <div className="text-muted">Loading logs…</div>
            ) : logsQ.isError ? (
              <div className="text-red">Failed to load logs</div>
            ) : logsQ.data.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-card p-6 text-muted">
                No completions yet. When you complete the quest, it becomes a journal entry.
              </div>
            ) : (
              logsQ.data.map((l) => (
                <Link
                  key={l.id}
                  href={`/journal/${l.id}`}
                  className="block rounded-2xl border border-white/10 bg-card p-4 transition hover:bg-white/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">{l.date}</div>
                    <div className="font-mono text-xs text-muted">{l.xp_earned} XP</div>
                  </div>
                  <div className="mt-1 text-sm">{l.notes ? l.notes.slice(0, 140) : <span className="text-muted">No notes</span>}</div>
                </Link>
              ))
            )}
          </div>
        </div>
      </AppShell>
    </RequireAuth>
  );
}

