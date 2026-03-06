"use client";

import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";

import type { ScrapbookElement } from "@/lib/scrapbookElements";
import { DraggableElement } from "./DraggableElement";

type OpenBookSpreadProps = {
  elements: ScrapbookElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (elements: ScrapbookElement[]) => void;
};

const PAGE_WIDTH = 320;
const PAGE_HEIGHT = 420;

export function OpenBookSpread({
  elements,
  selectedId,
  onSelect,
  onChange,
}: OpenBookSpreadProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto inline-flex rounded-lg border-4 border-amber-900/60 bg-amber-950/30 p-4 shadow-2xl"
      style={{
        boxShadow: "inset 0 0 80px rgba(139,90,43,0.15), 0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      {/* Left page */}
      <DroppablePage
        side="left"
        elements={elements.filter((e) => e.page === "left")}
        allElements={elements}
        selectedId={selectedId}
        onSelect={onSelect}
        onChange={onChange}
      />
      {/* Spine shadow */}
      <div
        className="w-2 shrink-0 bg-gradient-to-r from-amber-900/40 via-amber-800/20 to-transparent"
        style={{ width: 12 }}
      />
      {/* Right page */}
      <DroppablePage
        side="right"
        elements={elements.filter((e) => e.page === "right")}
        allElements={elements}
        selectedId={selectedId}
        onSelect={onSelect}
        onChange={onChange}
      />
    </motion.div>
  );
}

function DroppablePage({
  side,
  elements,
  allElements,
  selectedId,
  onSelect,
  onChange,
}: {
  side: "left" | "right";
  elements: ScrapbookElement[];
  allElements: ScrapbookElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (elements: ScrapbookElement[]) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `page-${side}` });

  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-lg border border-amber-800/30 transition-colors ${
        isOver ? "bg-amber-900/20" : ""
      }`}
      style={{
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        background: "linear-gradient(135deg, #f8f0dc 0%, #f4e8c8 30%, #efe0bc 70%, #e8d4a8 100%)",
        boxShadow: "inset 0 0 40px rgba(139,90,43,0.08)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {elements.map((el) => (
          <DraggableElement
            key={el.id}
            element={el}
            isSelected={selectedId === el.id}
            onSelect={() => onSelect(el.id)}
            onUpdate={(patch) => {
              onChange(
                allElements.map((e) => (e.id === el.id ? { ...e, ...patch } : e))
              );
            }}
          />
        ))}
      </div>
    </div>
  );
}
