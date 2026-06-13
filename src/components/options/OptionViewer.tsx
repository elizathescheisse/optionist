import { useAppStore } from "../../store/useAppStore";
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
      <div className="flex-1 overflow-auto flex items-center justify-center p-6">
        <img
          src={option.imageDataUrl}
          alt={option.name}
          draggable={false}
          className={
            reviewViewMode === "fit-width"
              ? "max-w-full max-h-full object-contain rounded shadow-sm"
              : "max-w-none rounded shadow-sm"
          }
        />
      </div>
    </div>
  );
}
