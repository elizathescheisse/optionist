import { useAppStore } from "../../store/useAppStore";
import type { CompareMode } from "../../types/domain";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import OptionViewer from "../options/OptionViewer";
import { cn } from "../../utils/cn";

type Props = {
  decisionId: string;
  mode: CompareMode;
  onSelectOption: (optionId: string) => void;
};

const DISPLAY_LABELS: Record<string, string> = {
  draft: "Draft",
  ready: "Ready",
  recommended: "Recommended",
  selected: "Selected",
  rejected: "Not selected",
};

export default function OptionCardGrid({ decisionId, mode, onSelectOption }: Props) {
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const currentOptionId = useAppStore((s) => s.currentOptionId);
  const optionIds = decision?.optionIds ?? [];

  if (!decision) return null;

  if (mode === "focus" && currentOptionId) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <OptionViewer optionId={currentOptionId} />
      </div>
    );
  }

  if (mode === "side-by-side" && optionIds.length >= 2) {
    const pair = optionIds.slice(0, 2);
    return (
      <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
        {pair.map((id) => (
          <OptionPreview key={id} optionId={id} selected={currentOptionId === id} onSelect={onSelectOption} fill />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {optionIds.map((id) => (
          <OptionPreview
            key={id}
            optionId={id}
            selected={currentOptionId === id}
            onSelect={onSelectOption}
          />
        ))}
      </div>
    </div>
  );
}

function OptionPreview({
  optionId,
  selected,
  onSelect,
  fill,
}: {
  optionId: string;
  selected: boolean;
  onSelect: (id: string) => void;
  fill?: boolean;
}) {
  const option = useAppStore((s) => s.options[optionId]);
  if (!option) return null;

  const variant =
    option.displayStatus === "selected"
      ? "success"
      : option.displayStatus === "recommended"
        ? "primary"
        : option.displayStatus === "rejected"
          ? "default"
          : "info";

  return (
    <button
      type="button"
      onClick={() => onSelect(optionId)}
      className={cn("text-left w-full", fill && "h-full flex flex-col")}
    >
      <Card
        padding="none"
        hover
        selected={selected}
        className={cn("overflow-hidden w-full", fill && "h-full flex flex-col flex-1")}
      >
      <div className={cn("relative bg-app-surface-soft", fill ? "flex-1 min-h-0" : "aspect-video")}>
        <img
          src={option.imageDataUrl}
          alt={option.name}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
      <div className="p-3 flex items-center justify-between gap-2 border-t border-app-border">
        <span className="text-sm font-medium text-text truncate">{option.name}</span>
        <Badge variant={variant}>{DISPLAY_LABELS[option.displayStatus] ?? option.displayStatus}</Badge>
      </div>
      </Card>
    </button>
  );
}
