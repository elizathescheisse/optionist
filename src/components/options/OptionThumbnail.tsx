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
      className={`relative shrink-0 w-24 h-20 rounded overflow-hidden border-2 transition-colors bg-white ${
        isCurrent ? "border-gray-800" : "border-transparent hover:border-gray-300"
      }`}
    >
      <img
        src={option.imageDataUrl}
        alt={option.name}
        draggable={false}
        className={`w-full h-full object-cover ${
          option.status === "rejected" ? "opacity-40" : ""
        }`}
      />

      {/* Index number */}
      <span className="absolute top-0.5 left-0.5 text-[10px] font-medium px-1 rounded bg-black/50 text-white">
        {index + 1}
      </span>

      {/* Rejected overlay */}
      {option.status === "rejected" && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600 bg-white/80 px-1 rounded">
            Rejected
          </span>
        </span>
      )}

      {/* Final indicator */}
      {option.status === "final" && (
        <span className="absolute top-0.5 right-0.5 text-[10px] font-semibold px-1 rounded bg-green-600 text-white">
          ✓ Final
        </span>
      )}

      {/* Name */}
      <span className="absolute bottom-0 inset-x-0 text-[10px] text-white bg-black/50 px-1 py-0.5 truncate text-left">
        {option.name}
      </span>
    </button>
  );
}
