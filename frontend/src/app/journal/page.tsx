"use client";

import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { JournalCard } from "@/components/JournalCard";
import { RequireAuth } from "@/components/RequireAuth";
import { listLogs } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

export default function JournalFeedPage() {
  const token = useAuthStore((s) => s.token)!;
  const q = useQuery({ queryKey: ["logs"], queryFn: () => listLogs(token) });

  return (
    <RequireAuth>
      <AppShell title="Journal">
        <div className="text-sm text-muted">Every completion becomes a memory card. Click one to decorate the page.</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {q.isLoading ? (
            <div className="text-muted">Loading…</div>
          ) : q.isError ? (
            <div className="text-red">Failed to load journal</div>
          ) : q.data.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-card p-6 text-muted">
              No entries yet. Complete a quest to generate your first journal card.
            </div>
          ) : (
            q.data.map((log) => <JournalCard key={log.id} log={log} />)
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}

