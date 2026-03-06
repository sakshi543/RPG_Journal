"use client";

const moods = [
  { value: 1, label: "😔" },
  { value: 2, label: "😐" },
  { value: 3, label: "🙂" },
  { value: 4, label: "😄" },
  { value: 5, label: "🤩" }
];

export function MoodPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2">
      {moods.map((m) => (
        <button
          key={m.value}
          type="button"
          onClick={() => onChange(m.value)}
          className={`flex h-12 w-12 items-center justify-center rounded-xl border transition ${
            value === m.value ? "border-gold bg-gold/10" : "border-white/10 bg-deep/40 hover:bg-white/5"
          }`}
          aria-label={`Mood ${m.value}`}
        >
          <span className="text-2xl">{m.label}</span>
        </button>
      ))}
    </div>
  );
}

