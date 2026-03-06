"use client";

import { useCallback, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";

import type { ScrapbookElement } from "@/lib/scrapbookElements";
import { DraggableElement } from "./DraggableElement";
import { ElementToolbar } from "./ElementToolbar";
import { OpenBookSpread } from "./OpenBookSpread";

export type ScrapbookEditorProps = {
  elements: ScrapbookElement[];
  photos: { id: string; url: string }[];
  onChange: (elements: ScrapbookElement[]) => void;
  onPhotoUpload: (file: File) => Promise<string>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function ScrapbookEditor({
  elements,
  photos,
  onChange,
  onPhotoUpload,
  selectedId,
  onSelect,
}: ScrapbookEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"stickers" | "shapes" | "frames" | "lines" | "photos">("stickers");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, delta, over } = event;
      const el = elements.find((e) => e.id === active.id);
      if (!el) return;
      const overPage = over?.id === "page-left" ? "left" : over?.id === "page-right" ? "right" : null;
      const updates: Partial<ScrapbookElement> = {
        x: el.x + (delta?.x ?? 0),
        y: el.y + (delta?.y ?? 0),
      };
      if (overPage && overPage !== el.page) {
        updates.page = overPage;
      }
      onChange(
        elements.map((e) => (e.id === active.id ? { ...e, ...updates } : e))
      );
    },
    [elements, onChange]
  );

  const selectedElement = selectedId ? elements.find((e) => e.id === selectedId) : null;
  const activeElement = activeId ? elements.find((e) => e.id === activeId) : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-6 lg:flex-row">
        <ElementToolbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddElement={(el) => {
            onChange([...elements, el]);
            onSelect(el.id);
          }}
          onPhotoUpload={onPhotoUpload}
          photos={photos}
          selectedElement={selectedElement}
          onUpdateElement={(id, patch) => {
            onChange(
              elements.map((e) => (e.id === id ? { ...e, ...patch } : e))
            );
          }}
          onDeleteElement={(id) => {
            onChange(elements.filter((e) => e.id !== id));
            onSelect(null);
          }}
          onSelect={onSelect}
        />

        <div className="flex-1 overflow-x-auto">
          <OpenBookSpread
            elements={elements}
            selectedId={selectedId}
            onSelect={onSelect}
            onChange={onChange}
          />
        </div>
      </div>

      <DragOverlay>
        {activeElement ? (
          <div className="cursor-grabbing opacity-90">
            <DraggableElement element={activeElement} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
