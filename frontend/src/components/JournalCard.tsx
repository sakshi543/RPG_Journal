"use client";

import Link from "next/link";

import type { QuestLog } from "@/lib/types";

const moodEmoji: Record<number, string> = { 1: "😔", 2: "😐", 3: "🙂", 4: "😄", 5: "🤩" };

export function JournalCard({ log }: { log: QuestLog }) {
  return (
    <Link href={`/journal/${log.id}`} className="block rounded-2xl border border-white/10 bg-card p-4 hover:bg-white/5">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted">{log.date}</div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="text-xl">{moodEmoji[log.mood] ?? "🙂"}</span>
          <span className="font-mono">{log.xp_earned} XP</span>
        </div>
      </div>
      <div className="mt-2 text-sm">{log.notes ? log.notes.slice(0, 180) : <span className="text-muted">No notes</span>}</div>
      {log.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {log.tags.slice(0, 6).map((t) => (
            <span key={t} className="rounded-full bg-deep/60 px-2 py-1 text-xs text-muted">
              #{t}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}

