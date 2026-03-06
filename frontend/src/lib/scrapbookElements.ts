// Sticker & decoration library for the journal scrapbook

export const EMOJI_STICKERS = [
  "✨", "⭐", "🌟", "🌙", "☀️", "🔥", "💫", "🌈",
  "⚔️", "🛡️", "📜", "🗺️", "🧭", "🏆", "🎯", "🎪",
  "💪", "🧠", "❤️", "💚", "💙", "💜", "💛", "🧡",
  "📚", "🎨", "🎵", "🎬", "📷", "✈️", "🌍", "🍀",
  "🌸", "🌺", "🌻", "🍁", "❄️", "🎄", "🎃", "🎉",
  "📌", "📍", "✏️", "📝", "🔖", "📎", "🖼️", "🖌️",
];

export const SHAPES = [
  { type: "circle", label: "●", svg: "circle" },
  { type: "square", label: "■", svg: "rect" },
  { type: "star", label: "★", svg: "star" },
  { type: "heart", label: "♥", svg: "heart" },
  { type: "diamond", label: "◆", svg: "diamond" },
  { type: "triangle", label: "▲", svg: "triangle" },
];

export const FRAMES = [
  { type: "polaroid", label: "Polaroid" },
  { type: "corner", label: "Corner" },
  { type: "tape", label: "Tape" },
  { type: "bracket", label: "Bracket" },
];

export const LINES = [
  { type: "solid", label: "—" },
  { type: "dashed", label: "┄" },
  { type: "dotted", label: "·" },
  { type: "arrow", label: "→" },
];

export type ElementType = "emoji" | "shape" | "frame" | "line" | "photo" | "text";

export type BaseElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  page: "left" | "right";
};

export type EmojiElement = BaseElement & {
  type: "emoji";
  emoji: string;
};

export type ShapeElement = BaseElement & {
  type: "shape";
  shape: string;
  color: string;
  size: number;
};

export type FrameElement = BaseElement & {
  type: "frame";
  frameType: string;
  width: number;
  height: number;
};

export type LineElement = BaseElement & {
  type: "line";
  lineType: string;
  length: number;
  color: string;
};

export type PhotoElement = BaseElement & {
  type: "photo";
  url: string;
  width: number;
  height: number;
};

export type TextElement = BaseElement & {
  type: "text";
  content: string;
  size: number;
  color: string;
  fontStyle?: "normal" | "italic";
};

export type ScrapbookElement =
  | EmojiElement
  | ShapeElement
  | FrameElement
  | LineElement
  | PhotoElement
  | TextElement;
