"use client";

import { useMemo, useRef, useState } from "react";

type Sticker = {
  id: string;
  emoji: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
};

type TextBlock = {
  id: string;
  content: string;
  x: number;
  y: number;
  size: number;
  color: string;
};

const stickerPalette = ["✨", "⭐", "🌙", "⚔️", "🧠", "💪", "📚", "🎨", "🍀", "🔥", "🏆", "🗺️", "🧩", "🎯"];

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

export function StickerEditor({
  backgroundColor,
  stickers,
  textBlocks,
  onChange
}: {
  backgroundColor: string;
  stickers: Sticker[];
  textBlocks: TextBlock[];
  onChange: (next: { stickers: Sticker[]; textBlocks: TextBlock[]; backgroundColor?: string }) => void;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; type: "sticker" | "text"; dx: number; dy: number } | null>(null);

  const activeSticker = useMemo(
    () => (activeStickerId ? stickers.find((s) => s.id === activeStickerId) ?? null : null),
    [activeStickerId, stickers]
  );
  const activeText = useMemo(
    () => (activeTextId ? textBlocks.find((t) => t.id === activeTextId) ?? null : null),
    [activeTextId, textBlocks]
  );

  function toLocalPoint(e: React.PointerEvent) {
    const el = canvasRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const pt = toLocalPoint(e);
    const nextX = pt.x - dragRef.current.dx;
    const nextY = pt.y - dragRef.current.dy;

    if (dragRef.current.type === "sticker") {
      onChange({
        stickers: stickers.map((s) => (s.id === dragRef.current!.id ? { ...s, x: nextX, y: nextY } : s)),
        textBlocks
      });
    } else {
      onChange({
        stickers,
        textBlocks: textBlocks.map((t) => (t.id === dragRef.current!.id ? { ...t, x: nextX, y: nextY } : t))
      });
    }
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-[240px_1fr]">
      <div className="rounded-2xl border border-white/10 bg-card p-4">
        <div className="text-sm font-semibold">Decorate</div>
        <div className="mt-3 text-xs text-muted">Stickers</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {stickerPalette.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-deep/40 text-2xl hover:bg-white/5"
              onClick={() => {
                const id = uid("stk");
                onChange({
                  stickers: [...stickers, { id, emoji, x: 120, y: 120, rotation: 0, scale: 1 }],
                  textBlocks
                });
                setActiveStickerId(id);
                setActiveTextId(null);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="mt-5 text-xs text-muted">Background</div>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onChange({ stickers, textBlocks, backgroundColor: e.target.value })}
            className="h-10 w-12 rounded-lg border border-white/10 bg-deep/40 p-1"
            aria-label="Background color"
          />
          <div className="font-mono text-xs text-muted">{backgroundColor}</div>
        </div>

        <div className="mt-5">
          <button
            type="button"
            className="w-full rounded-xl border border-white/10 bg-deep/40 px-3 py-2 text-sm hover:bg-white/5"
            onClick={() => {
              const id = uid("txt");
              onChange({
                stickers,
                textBlocks: [...textBlocks, { id, content: "New text…", x: 80, y: 240, size: 16, color: "#F0F0FF" }]
              });
              setActiveTextId(id);
              setActiveStickerId(null);
            }}
          >
            + Add text block
          </button>
        </div>

        {activeSticker ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-deep/40 p-3">
            <div className="text-xs text-muted">Selected sticker</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-2xl">{activeSticker.emoji}</div>
              <button
                type="button"
                className="rounded-lg border border-white/10 px-2 py-1 text-xs hover:bg-white/5"
                onClick={() => {
                  onChange({
                    stickers: stickers.filter((s) => s.id !== activeSticker.id),
                    textBlocks
                  });
                  setActiveStickerId(null);
                }}
              >
                Delete
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs text-muted">
              <label className="flex items-center justify-between gap-2">
                <span>Scale</span>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={activeSticker.scale}
                  onChange={(e) =>
                    onChange({
                      stickers: stickers.map((s) =>
                        s.id === activeSticker.id ? { ...s, scale: Number(e.target.value) } : s
                      ),
                      textBlocks
                    })
                  }
                />
              </label>
              <label className="flex items-center justify-between gap-2">
                <span>Rotation</span>
                <input
                  type="range"
                  min={-45}
                  max={45}
                  step={1}
                  value={activeSticker.rotation}
                  onChange={(e) =>
                    onChange({
                      stickers: stickers.map((s) =>
                        s.id === activeSticker.id ? { ...s, rotation: Number(e.target.value) } : s
                      ),
                      textBlocks
                    })
                  }
                />
              </label>
            </div>
          </div>
        ) : null}

        {activeText ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-deep/40 p-3">
            <div className="text-xs text-muted">Selected text</div>
            <textarea
              className="mt-2 w-full rounded-xl border border-white/10 bg-card px-3 py-2 text-sm outline-none focus:border-gold"
              value={activeText.content}
              onChange={(e) =>
                onChange({
                  stickers,
                  textBlocks: textBlocks.map((t) => (t.id === activeText.id ? { ...t, content: e.target.value } : t))
                })
              }
              rows={3}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs text-muted">
                Size
                <input
                  type="range"
                  min={12}
                  max={32}
                  step={1}
                  value={activeText.size}
                  onChange={(e) =>
                    onChange({
                      stickers,
                      textBlocks: textBlocks.map((t) =>
                        t.id === activeText.id ? { ...t, size: Number(e.target.value) } : t
                      )
                    })
                  }
                />
              </label>
              <input
                type="color"
                value={activeText.color}
                onChange={(e) =>
                  onChange({
                    stickers,
                    textBlocks: textBlocks.map((t) => (t.id === activeText.id ? { ...t, color: e.target.value } : t))
                  })
                }
                className="h-10 w-12 rounded-lg border border-white/10 bg-card p-1"
                aria-label="Text color"
              />
              <button
                type="button"
                className="rounded-lg border border-white/10 px-2 py-1 text-xs hover:bg-white/5"
                onClick={() => {
                  onChange({ stickers, textBlocks: textBlocks.filter((t) => t.id !== activeText.id) });
                  setActiveTextId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-card p-4">
        <div className="mb-3 text-sm text-muted">Canvas (drag items)</div>
        <div
          ref={canvasRef}
          className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-white/10"
          style={{ backgroundColor }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {stickers.map((s) => (
            <div
              key={s.id}
              className={`absolute select-none text-4xl ${activeStickerId === s.id ? "drop-shadow-[0_0_10px_rgba(245,166,35,0.6)]" : ""}`}
              style={{
                left: s.x,
                top: s.y,
                transform: `rotate(${s.rotation}deg) scale(${s.scale})`
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setActiveStickerId(s.id);
                setActiveTextId(null);
                const pt = toLocalPoint(e);
                dragRef.current = { id: s.id, type: "sticker", dx: pt.x - s.x, dy: pt.y - s.y };
              }}
            >
              {s.emoji}
            </div>
          ))}

          {textBlocks.map((t) => (
            <div
              key={t.id}
              className={`absolute max-w-[320px] cursor-text whitespace-pre-wrap rounded-xl px-2 py-1 ${
                activeTextId === t.id ? "outline outline-2 outline-gold/60" : "outline outline-1 outline-white/10"
              }`}
              style={{ left: t.x, top: t.y, color: t.color, fontSize: `${t.size}px`, background: "rgba(0,0,0,0.15)" }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setActiveTextId(t.id);
                setActiveStickerId(null);
                const pt = toLocalPoint(e);
                dragRef.current = { id: t.id, type: "text", dx: pt.x - t.x, dy: pt.y - t.y };
              }}
            >
              {t.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

