"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { ScrapbookEditor } from "@/components/ScrapbookEditor";
import { getJournalPage, getLog, updateJournalPage, uploadLogPhoto } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import type { ScrapbookElement } from "@/lib/scrapbookElements";

function asNumber(v: unknown, fallback: number) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function asString(v: unknown, fallback: string) {
  return typeof v === "string" ? v : fallback;
}

function coerceElements(raw: unknown): ScrapbookElement[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => {
      if (!r || typeof r !== "object") return null;
      const o = r as Record<string, unknown>;
      const type = asString(o.type, "emoji");
      const id = asString(o.id, `el_${Math.random().toString(36).slice(2)}`);
      const page = (o.page === "left" || o.page === "right" ? o.page : "right") as "left" | "right";
      const base = {
        id,
        type,
        x: asNumber(o.x, 80),
        y: asNumber(o.y, 80),
        rotation: asNumber(o.rotation, 0),
        scale: asNumber(o.scale, 1),
        page,
      };

      if (type === "emoji" || o.emoji) {
        return { ...base, type: "emoji" as const, emoji: asString(o.emoji, "✨") };
      }
      if (type === "text" || o.content) {
        return {
          ...base,
          type: "text" as const,
          content: asString(o.content, "Text…"),
          size: asNumber(o.size, 16),
          color: asString(o.color, "#1a1625"),
        };
      }
      if (type === "shape") {
        return {
          ...base,
          type: "shape" as const,
          shape: asString(o.shape, "circle"),
          color: asString(o.color, "#E94560"),
          size: asNumber(o.size, 36),
        };
      }
      if (type === "line") {
        return {
          ...base,
          type: "line" as const,
          lineType: asString(o.lineType, "solid"),
          length: asNumber(o.length, 100),
          color: asString(o.color, "#1a1625"),
        };
      }
      if (type === "photo") {
        return {
          ...base,
          type: "photo" as const,
          url: asString(o.url, ""),
          width: asNumber(o.width, 120),
          height: asNumber(o.height, 120),
        };
      }
      return null;
    })
    .filter((x): x is ScrapbookElement => Boolean(x));
}

export default function JournalPage() {
  const params = useParams<{ logId: string }>();
  const logId = params.logId;
  const token = useAuthStore((s) => s.token)!;

  const logQ = useQuery({ queryKey: ["log", logId], queryFn: () => getLog(token, logId) });
  const pageQ = useQuery({ queryKey: ["journal", logId], queryFn: () => getJournalPage(token, logId) });

  const initialElements = useMemo(() => {
    if (!pageQ.data) return [];
    const fromStickers = coerceElements(pageQ.data.sticker_data);
    const fromText = coerceElements(
      (pageQ.data.text_blocks as unknown[] || []).map((t: Record<string, unknown>) => ({
        ...t,
        type: "text",
      }))
    );
    if (fromStickers.some((e) => e.type === "text" || e.type === "emoji")) {
      return fromStickers;
    }
    return [...fromStickers, ...fromText];
  }, [pageQ.data]);

  const [elements, setElements] = useState<ScrapbookElement[]>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const hasInitialized = useRef(false);
  useEffect(() => {
    if (pageQ.data && !hasInitialized.current) {
      hasInitialized.current = true;
      setElements(initialElements);
    }
  }, [pageQ.data, initialElements]);

  const photos = useMemo(() => {
    return elements
      .filter((e): e is ScrapbookElement & { type: "photo" } => e.type === "photo")
      .map((e) => ({ id: e.id, url: e.url }));
  }, [elements]);

  const handlePhotoUpload = useCallback(
    async (file: File) => {
      const res = await uploadLogPhoto(token, logId, file);
      return res.url;
    },
    [token, logId]
  );

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      await updateJournalPage(token, logId, {
        sticker_data: elements as unknown as Record<string, unknown>[],
        text_blocks: [],
      });
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireAuth>
      <AppShell title="Journal">
        {logQ.isLoading || pageQ.isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-card/60 p-12 text-center text-muted">
            Loading your journal…
          </div>
        ) : logQ.isError || pageQ.isError ? (
          <div className="text-red">Failed to load journal page</div>
        ) : (
          <>
            {"is_sealed" in (logQ.data as object) && (logQ.data as { is_sealed?: boolean }).is_sealed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-amber-800/40 bg-amber-950/20 p-8 text-center"
              >
                <div className="text-4xl mb-4">🔒</div>
                <div className="font-display text-2xl text-amber-200">Sealed Time Capsule</div>
                <div className="mt-2 text-muted">
                  This memory unlocks on{" "}
                  <span className="font-mono text-gold">
                    {(logQ.data as { opens_on: string }).opens_on}
                  </span>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-card/60 p-5">
                  <div>
                    <div className="text-sm text-muted">Entry</div>
                    <div className="font-display text-2xl text-offwhite">
                      {(logQ.data as { date: string }).date}
                    </div>
                    {(logQ.data as { notes?: string }).notes ? (
                      <p className="mt-2 max-w-2xl text-muted">
                        {(logQ.data as { notes: string }).notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={save}
                      disabled={saving}
                      className="rounded-xl bg-gradient-to-r from-gold-dim to-gold px-5 py-2.5 font-semibold text-ink shadow-gold transition hover:shadow-gold-strong disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Save page"}
                    </button>
                  </div>
                  <div className="w-full text-xs text-muted">
                    {saveError ? (
                      <span className="text-red">{saveError}</span>
                    ) : savedAt ? (
                      <>Saved at {savedAt}</>
                    ) : null}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-card/40 p-6"
                >
                  <div className="mb-4 text-sm text-muted">
                    Drag stickers, shapes, and photos onto the open book. Click to select and adjust.
                  </div>
                  <ScrapbookEditor
                    elements={elements}
                    photos={photos}
                    onChange={setElements}
                    onPhotoUpload={handlePhotoUpload}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                </motion.div>
              </>
            )}
          </>
        )}
      </AppShell>
    </RequireAuth>
  );
}
