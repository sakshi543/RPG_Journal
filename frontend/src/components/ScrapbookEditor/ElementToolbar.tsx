"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

import {
  EMOJI_STICKERS,
  FRAMES,
  LINES,
  SHAPES,
  type EmojiElement,
  type LineElement,
  type PhotoElement,
  type ScrapbookElement,
  type ShapeElement,
  type TextElement,
} from "@/lib/scrapbookElements";

function uid() {
  return `el_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

type ElementToolbarProps = {
  activeTab: "stickers" | "shapes" | "frames" | "lines" | "photos";
  onTabChange: (tab: "stickers" | "shapes" | "frames" | "lines" | "photos") => void;
  onAddElement: (el: ScrapbookElement) => void;
  onPhotoUpload: (file: File) => Promise<string>;
  photos: { id: string; url: string }[];
  selectedElement: ScrapbookElement | null;
  onUpdateElement: (id: string, patch: Partial<ScrapbookElement>) => void;
  onDeleteElement: (id: string) => void;
  onSelect: (id: string | null) => void;
};

const SHAPE_COLORS = ["#E94560", "#0FB8AD", "#F5A623", "#8B5CF6", "#10B981", "#1a1625"];

export function ElementToolbar({
  activeTab,
  onTabChange,
  onAddElement,
  onPhotoUpload,
  photos,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onSelect,
}: ElementToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: "stickers" as const, label: "Stickers", icon: "✨" },
    { id: "shapes" as const, label: "Shapes", icon: "◆" },
    { id: "frames" as const, label: "Frames", icon: "🖼️" },
    { id: "lines" as const, label: "Lines", icon: "—" },
    { id: "photos" as const, label: "Photos", icon: "📷" },
  ];

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await onPhotoUpload(file);
      const el: PhotoElement = {
        id: uid(),
        type: "photo",
        url,
        x: 80,
        y: 80,
        rotation: 0,
        scale: 1,
        page: "right",
        width: 140,
        height: 140,
      };
      onAddElement(el);
    } catch (err) {
      console.error(err);
    }
    e.target.value = "";
  };

  return (
    <div className="w-full shrink-0 rounded-2xl border border-white/10 bg-card/80 p-4 lg:w-72">
      <div className="mb-4 font-display text-sm font-semibold text-gold">
        Decorate your page
      </div>

      <div className="flex gap-1 rounded-xl bg-deep/60 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-xs transition ${
              activeTab === t.id
                ? "bg-gold/20 text-gold"
                : "text-muted hover:text-offwhite"
            }`}
          >
            <span className="text-lg">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 max-h-48 overflow-y-auto">
        {activeTab === "stickers" && (
          <div className="flex flex-wrap gap-2">
            {EMOJI_STICKERS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  const el: EmojiElement = {
                    id: uid(),
                    type: "emoji",
                    emoji,
                    x: 60,
                    y: 60,
                    rotation: 0,
                    scale: 1,
                    page: "right",
                  };
                  onAddElement(el);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-deep/60 text-2xl transition hover:scale-110 hover:border-gold/30"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {activeTab === "shapes" && (
          <div className="space-y-3">
            {SHAPES.map((s) => (
              <div key={s.type} className="flex flex-wrap gap-2">
                {SHAPE_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      const el: ShapeElement = {
                        id: uid(),
                        type: "shape",
                        shape: s.type,
                        color,
                        size: 36,
                        x: 80,
                        y: 80,
                        rotation: 0,
                        scale: 1,
                        page: "right",
                      };
                      onAddElement(el);
                    }}
                    className="h-10 w-10 rounded-lg border border-white/10 transition hover:scale-110 hover:border-gold/30"
                    style={{
                      backgroundColor: color,
                      borderRadius: s.type === "circle" ? "50%" : 4,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === "lines" && (
          <div className="space-y-2">
            {LINES.map((l) => (
              <button
                key={l.type}
                onClick={() => {
                  const el: LineElement = {
                    id: uid(),
                    type: "line",
                    lineType: l.type,
                    length: 120,
                    color: "#1a1625",
                    x: 40,
                    y: 40,
                    rotation: 0,
                    scale: 1,
                    page: "right",
                  };
                  onAddElement(el);
                }}
                className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-deep/60 py-3 text-muted hover:border-gold/30 hover:text-gold"
              >
                {l.label} {l.type}
              </button>
            ))}
          </div>
        )}

        {activeTab === "photos" && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold/40 bg-gold/5 py-4 text-gold transition hover:bg-gold/10"
            >
              <span className="text-2xl">📷</span>
              Upload photo
            </button>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      const el: PhotoElement = {
                        id: uid(),
                        type: "photo",
                        url: p.url,
                        x: 80,
                        y: 80,
                        rotation: 0,
                        scale: 1,
                        page: "right",
                        width: 120,
                        height: 120,
                      };
                      onAddElement(el);
                    }}
                    className="h-16 w-16 overflow-hidden rounded-lg border border-white/10 object-cover"
                  >
                    <img
                      src={p.url.startsWith("http") ? p.url : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000"}${p.url}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "frames" && (
          <div className="space-y-2">
            <button
              onClick={() => {
                const el: TextElement = {
                  id: uid(),
                  type: "text",
                  content: "Add your thoughts...",
                  size: 16,
                  color: "#1a1625",
                  x: 40,
                  y: 120,
                  rotation: 0,
                  scale: 1,
                  page: "right",
                };
                onAddElement(el);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-deep/60 py-3 text-sm text-muted hover:border-gold/30 hover:text-gold"
            >
              + Add text block
            </button>
          </div>
        )}
      </div>

      {selectedElement && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-gold/20 bg-gold/5 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-muted">Selected</span>
            <button
              onClick={() => {
                onDeleteElement(selectedElement.id);
                onSelect(null);
              }}
              className="rounded px-2 py-1 text-xs text-red hover:bg-red/10"
            >
              Delete
            </button>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-2 text-xs text-muted">
              <span>Scale</span>
              <input
                type="range"
                min={0.3}
                max={2}
                step={0.05}
                value={selectedElement.scale}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    scale: Number(e.target.value),
                  })
                }
                className="w-24"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-xs text-muted">
              <span>Rotation</span>
              <input
                type="range"
                min={-180}
                max={180}
                step={5}
                value={selectedElement.rotation}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    rotation: Number(e.target.value),
                  })
                }
                className="w-24"
              />
            </label>
            {selectedElement.type === "text" && (
              <>
                <textarea
                  value={(selectedElement as TextElement).content}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, {
                      content: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-deep/60 px-3 py-2 text-sm outline-none focus:border-gold"
                  rows={3}
                />
                <label className="flex items-center justify-between gap-2 text-xs text-muted">
                  <span>Size</span>
                  <input
                    type="range"
                    min={12}
                    max={32}
                    value={(selectedElement as TextElement).size}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        size: Number(e.target.value),
                      })
                    }
                    className="w-24"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-muted">
                  <span>Color</span>
                  <input
                    type="color"
                    value={(selectedElement as TextElement).color}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        color: e.target.value,
                      })
                    }
                    className="h-8 w-12 rounded border border-white/10"
                  />
                </label>
              </>
            )}
            {selectedElement.type === "shape" && (
              <label className="flex items-center gap-2 text-xs text-muted">
                <span>Color</span>
                <input
                  type="color"
                  value={(selectedElement as ShapeElement).color}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, {
                      color: e.target.value,
                    })
                  }
                  className="h-8 w-12 rounded border border-white/10"
                />
              </label>
            )}
            {selectedElement.type === "line" && (
              <>
                <label className="flex items-center justify-between gap-2 text-xs text-muted">
                  <span>Length</span>
                  <input
                    type="range"
                    min={40}
                    max={200}
                    value={(selectedElement as LineElement).length}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        length: Number(e.target.value),
                      })
                    }
                    className="w-24"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-muted">
                  <span>Color</span>
                  <input
                    type="color"
                    value={(selectedElement as LineElement).color}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        color: e.target.value,
                      })
                    }
                    className="h-8 w-12 rounded border border-white/10"
                  />
                </label>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
