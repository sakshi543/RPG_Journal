"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { MoodPicker } from "@/components/MoodPicker";
import { RequireAuth } from "@/components/RequireAuth";
import { completeQuest, getQuest, me } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

export default function CompleteQuestPage() {
  const params = useParams<{ id: string }>();
  const questId = params.id;
  const router = useRouter();

  const token = useAuthStore((s) => s.token)!;
  const setUser = useAuthStore((s) => s.setUser);

  const questQ = useQuery({ queryKey: ["quest", questId], queryFn: () => getQuest(token, questId) });

  const [mood, setMood] = useState(4);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [levelUp, setLevelUp] = useState<{ show: boolean; level: number | null; logId: string | null }>({
    show: false,
    level: null,
    logId: null
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await completeQuest(token, questId, { mood, notes: notes || null, tags: tagList });
      const freshUser = await me(token);
      setUser(freshUser);

      if (res.leveled_up) {
        setLevelUp({ show: true, level: res.new_level, logId: res.quest_log.id });
      } else {
        router.push(`/journal/${res.quest_log.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete quest");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RequireAuth>
      <AppShell title="Complete Quest">
        <LevelUpOverlay
          show={levelUp.show}
          level={levelUp.level}
          onClose={() => {
            const id = levelUp.logId;
            setLevelUp({ show: false, level: null, logId: null });
            if (id) router.push(`/journal/${id}`);
          }}
        />

        {questQ.isLoading ? (
          <div className="text-muted">Loading…</div>
        ) : questQ.isError ? (
          <div className="text-red">Failed to load quest</div>
        ) : (
          <div className="mb-6 rounded-2xl border border-white/10 bg-card p-5">
            <div className="text-sm text-muted">{questQ.data.category}</div>
            <div className="font-serif text-2xl">{questQ.data.title}</div>
            <div className="mt-2 text-sm text-muted">
              Reward: <span className="font-mono">{questQ.data.xp_reward}</span> XP • {questQ.data.difficulty}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="max-w-2xl space-y-5 rounded-2xl border border-white/10 bg-card p-6">
          <div>
            <div className="mb-2 text-sm text-muted">How did it feel?</div>
            <MoodPicker value={mood} onChange={setMood} />
          </div>

          <div>
            <div className="mb-1 text-sm text-muted">Notes</div>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-deep/40 px-3 py-2 text-offwhite outline-none placeholder:text-muted focus:border-gold"
              rows={5}
              placeholder="What happened? Any small win you want to remember?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div>
            <div className="mb-1 text-sm text-muted">Tags (comma-separated)</div>
            <input
              className="w-full rounded-xl border border-white/10 bg-deep/40 px-3 py-2 text-offwhite outline-none placeholder:text-muted focus:border-gold"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="gym, friends, learning"
            />
          </div>

          {error ? <div className="rounded-xl border border-red/40 bg-red/10 p-3 text-sm">{error}</div> : null}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting…" : "Complete + Log memory"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </form>
      </AppShell>
    </RequireAuth>
  );
}

