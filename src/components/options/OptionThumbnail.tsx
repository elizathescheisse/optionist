import type { DesignOption } from "../../types/domain";

type Props = {
  option: DesignOption;
  isCurrent: boolean;
  index: number;
  onSelect: () => void;
};

export default function OptionThumbnail({ option, isCurrent, index, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={option.name}
      className={`relative shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all motion-reduce:transition-none bg-surface-muted ${
        isCurrent
          ? "border-transparent ring-2 ring-primary ring-offset-1"
          : "border-transparent hover:border-border"
      }`}
    >
      <img
        src={option.imageDataUrl}
        alt={option.name}
        draggable={false}
        className={`w-full h-full object-cover ${
          option.status === "rejected" ? "opacity-30" : ""
        }`}
      />

      {/* Index number */}
      <span className="absolute top-1 left-1 text-[10px] font-semibold px-1 rounded-md bg-black/40 text-white leading-tight">
        {index + 1}
      </span>

      {/* Rejected overlay */}
      {option.status === "rejected" && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-red-500 bg-surface/90 px-1.5 py-0.5 rounded-full">
            Rejected
          </span>
        </span>
      )}

      {/* Final indicator */}
      {option.status === "final" && (
        <span className="absolute top-1 right-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white leading-tight">
          ✓
        </span>
      )}

      {/* Name */}
      <span className="absolute bottom-0 inset-x-0 text-[10px] text-white bg-black/40 px-1.5 py-0.5 truncate text-left">
        {option.name}
      </span>
    </button>
  );
}
