import { useAppStore } from "../../store/useAppStore";
import OptionStatusBadge from "./OptionStatusBadge";
import EmptyState from "../layout/EmptyState";

type Props = {
  optionId: string | null;
};

export default function OptionViewer({ optionId }: Props) {
  const option = useAppStore((s) => (optionId ? s.options[optionId] : undefined));
  const reviewViewMode = useAppStore((s) => s.reviewViewMode);

  if (!option) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <EmptyState message="No option selected." />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <img
          src={option.imageDataUrl}
          alt={option.name}
          draggable={false}
          className={
            reviewViewMode === "fit-width"
              ? "max-w-full max-h-full object-contain"
              : "max-w-none"
          }
        />
      </div>
      <div className="shrink-0 px-4 py-2 border-t border-gray-200 bg-white flex items-center gap-2">
        <span className="text-sm font-medium text-gray-800 truncate">
          {option.name}
        </span>
        <OptionStatusBadge status={option.status} />
      </div>
    </div>
  );
}
