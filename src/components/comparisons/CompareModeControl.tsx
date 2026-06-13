import type { CompareMode } from "../../types/domain";
import { cn } from "../../utils/cn";

type Props = {
  mode: CompareMode;
  onChange: (mode: CompareMode) => void;
  optionCount: number;
};

const MODES: { id: CompareMode; label: string }[] = [
  { id: "grid", label: "Grid" },
  { id: "side-by-side", label: "Side-by-side" },
  { id: "focus", label: "Focus" },
];

export default function CompareModeControl({ mode, onChange, optionCount }: Props) {
  return (
    <div
      className="inline-flex rounded-lg border border-app-border bg-app-surface-soft p-0.5"
      role="group"
      aria-label="Compare mode"
    >
      {MODES.map((m) => {
        const disabled = m.id === "side-by-side" && optionCount < 2;
        return (
          <button
            key={m.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(m.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              mode === m.id
                ? "bg-app-panel text-primary shadow-sm"
                : "text-text-muted hover:text-text",
              disabled && "opacity-40 cursor-not-allowed",
            )}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
