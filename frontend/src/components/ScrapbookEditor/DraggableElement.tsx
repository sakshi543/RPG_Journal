"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type {
  EmojiElement,
  LineElement,
  PhotoElement,
  ScrapbookElement,
  ShapeElement,
  TextElement,
} from "@/lib/scrapbookElements";

type DraggableElementProps = {
  element: ScrapbookElement;
  isSelected?: boolean;
  isDragging?: boolean;
  onSelect?: () => void;
  onUpdate?: (patch: Partial<ScrapbookElement>) => void;
};

export function DraggableElement({
  element,
  isSelected = false,
  isDragging = false,
  onSelect,
  onUpdate,
}: DraggableElementProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: element.id,
    data: element,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        left: element.x,
        top: element.y,
        transform: `rotate(${element.rotation}deg) scale(${element.scale})`,
        ...style,
        zIndex: isSelected ? 50 : 10,
      }}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={`cursor-grab touch-none select-none ${isDragging ? "cursor-grabbing" : ""} ${
        isSelected ? "ring-2 ring-gold ring-offset-2 ring-offset-parchment" : ""
      }`}
    >
      {element.type === "emoji" && (
        <span className="text-4xl" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" }}>
          {(element as EmojiElement).emoji}
        </span>
      )}
      {element.type === "shape" && (
        <ShapeRenderer element={element as ShapeElement} />
      )}
      {element.type === "photo" && (
        <PhotoRenderer element={element as PhotoElement} />
      )}
      {element.type === "text" && (
        <TextRenderer element={element as TextElement} />
      )}
      {element.type === "line" && (
        <LineRenderer element={element as LineElement} />
      )}
    </div>
  );
}

function ShapeRenderer({ element }: { element: ShapeElement }) {
  const size = element.size || 40;
  const color = element.color || "#E94560";
  const baseStyle = { boxShadow: "0 2px 8px rgba(0,0,0,0.2)" };

  if (element.shape === "circle") {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: color,
          ...baseStyle,
        }}
      />
    );
  }
  if (element.shape === "square") {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 4,
          backgroundColor: color,
          ...baseStyle,
        }}
      />
    );
  }
  if (element.shape === "diamond") {
    return (
      <div
        style={{
          width: size,
          height: size,
          transform: "rotate(45deg)",
          backgroundColor: color,
          borderRadius: 2,
          ...baseStyle,
        }}
      />
    );
  }
  if (element.shape === "star") {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          ...baseStyle,
        }}
      />
    );
  }
  if (element.shape === "heart") {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          clipPath: "path('M50 85 C50 85 0 50 0 30 C0 10 20 0 50 30 C80 0 100 10 100 30 C100 50 50 85 50 85')",
          ...baseStyle,
        }}
      />
    );
  }
  if (element.shape === "triangle") {
    return (
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
          ...baseStyle,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        backgroundColor: color,
        ...baseStyle,
      }}
    />
  );
}

function PhotoRenderer({ element }: { element: PhotoElement }) {
  const w = element.width || 120;
  const h = element.height || 120;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";
  const src = element.url.startsWith("http") ? element.url : `${apiUrl}${element.url}`;
  return (
    <div
      className="overflow-hidden rounded-lg border-2 border-amber-800/40 bg-white shadow-lg"
      style={{ width: w, height: h }}
    >
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        draggable={false}
      />
    </div>
  );
}

function TextRenderer({ element }: { element: TextElement }) {
  return (
    <div
      className="max-w-[200px] rounded px-2 py-1"
      style={{
        fontSize: element.size || 16,
        color: element.color || "#1a1625",
        fontStyle: element.fontStyle || "normal",
        background: "rgba(255,255,255,0.6)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      {(element.content || "Text").split("\n").map((line, i) => (
        <div key={i}>{line || " "}</div>
      ))}
    </div>
  );
}

function LineRenderer({ element }: { element: LineElement }) {
  const len = element.length || 100;
  const borderStyle =
    element.lineType === "dashed"
      ? "dashed"
      : element.lineType === "dotted"
      ? "dotted"
      : "solid";
  return (
    <div
      style={{
        width: len,
        height: 4,
        borderBottom: `3px ${borderStyle} ${element.color || "#1a1625"}`,
      }}
    />
  );
}
