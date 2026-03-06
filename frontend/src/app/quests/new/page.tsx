"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { RequireAuth } from "@/components/RequireAuth";
import { createQuest } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import type { Category, Difficulty, QuestType } from "@/lib/types";

const categories: Category[] = ["Health", "Knowledge", "Social", "Adventure", "Creativity", "Wealth"];
const difficulties: Difficulty[] = ["Easy", "Medium", "Hard", "Legendary"];
const questTypes: QuestType[] = ["one_time", "repeatable", "progress"];

export default function NewQuestPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token)!;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Adventure");
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [questType, setQuestType] = useState<QuestType>("one_time");
  const [progressTarget, setProgressTarget] = useState<number>(10);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const quest = await createQuest(token, {
        title,
        description: description || null,
        category,
        difficulty,
        quest_type: questType,
        progress_target: questType === "progress" ? progressTarget : null
      });
      router.push(`/quests/${quest.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quest");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RequireAuth>
      <AppShell title="Create Quest">
        <form onSubmit={onSubmit} className="max-w-2xl space-y-4 rounded-2xl border border-white/10 bg-card p-6">
          <div>
            <div className="mb-1 text-sm text-muted">Title</div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <div className="mb-1 text-sm text-muted">Description</div>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-deep/40 px-3 py-2 text-offwhite outline-none placeholder:text-muted focus:border-gold"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional: what does success look like?"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="mb-1 text-sm text-muted">Category</div>
              <select
                className="w-full rounded-xl border border-white/10 bg-deep/40 px-3 py-2 text-offwhite focus:border-gold"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-1 text-sm text-muted">Difficulty</div>
              <select
                className="w-full rounded-xl border border-white/10 bg-deep/40 px-3 py-2 text-offwhite focus:border-gold"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-1 text-sm text-muted">Quest type</div>
              <select
                className="w-full rounded-xl border border-white/10 bg-deep/40 px-3 py-2 text-offwhite focus:border-gold"
                value={questType}
                onChange={(e) => setQuestType(e.target.value as QuestType)}
              >
                {questTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {questType === "progress" ? (
            <div>
              <div className="mb-1 text-sm text-muted">Progress target</div>
              <Input
                type="number"
                value={progressTarget}
                onChange={(e) => setProgressTarget(Number(e.target.value))}
                min={1}
              />
              <div className="mt-1 text-xs text-muted">Example: 10 gym sessions, 20 pages read, 5 cafés explored.</div>
            </div>
          ) : null}

          {error ? <div className="rounded-xl border border-red/40 bg-red/10 p-3 text-sm">{error}</div> : null}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create quest"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.push("/quests")}>
              Cancel
            </Button>
          </div>
        </form>
      </AppShell>
    </RequireAuth>
  );
}

