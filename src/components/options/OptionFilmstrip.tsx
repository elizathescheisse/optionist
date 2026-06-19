import { useAppStore } from "../../store/useAppStore";
import OptionThumbnail from "./OptionThumbnail";

type Props = {
  decisionId: string;
};

export default function OptionFilmstrip({ decisionId }: Props) {
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const options = useAppStore((s) => s.options);
  const currentOptionId = useAppStore((s) => s.currentOptionId);
  const setCurrentOption = useAppStore((s) => s.setCurrentOption);

  if (!decision || decision.optionIds.length === 0) return null;

  const orderedOptions = decision.optionIds
    .map((id) => options[id])
    .filter(Boolean);

  return (
    <div className="shrink-0 border-t border-border bg-surface">
      <div className="flex gap-2 overflow-x-auto p-3">
        {orderedOptions.map((option, index) => (
          <OptionThumbnail
            key={option.id}
            option={option}
            index={index}
            isCurrent={currentOptionId === option.id}
            onSelect={() => setCurrentOption(option.id)}
          />
        ))}
      </div>
    </div>
  );
}
