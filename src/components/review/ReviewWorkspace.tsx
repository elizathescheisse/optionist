import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { useReviewKeyboard } from "../../hooks/useReviewKeyboard";
import OptionViewer from "../options/OptionViewer";
import OptionFilmstrip from "../options/OptionFilmstrip";
import Button from "../shared/Button";
import ReviewToolbar from "./ReviewToolbar";
import KeyboardShortcutHelp from "./KeyboardShortcutHelp";

type Props = {
  projectId: string;
  decisionId: string;
};

export default function ReviewWorkspace({ projectId, decisionId }: Props) {
  const navigate = useNavigate();
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const currentOptionId = useAppStore((s) => s.currentOptionId);
  const currentOption = useAppStore((s) =>
    s.currentOptionId ? s.options[s.currentOptionId] : undefined
  );
  const goToNextOption = useAppStore((s) => s.goToNextOption);
  const goToPreviousOption = useAppStore((s) => s.goToPreviousOption);
  const rejectOption = useAppStore((s) => s.rejectOption);
  const restoreOption = useAppStore((s) => s.restoreOption);
  const markOptionFinal = useAppStore((s) => s.markOptionFinal);

  const [showHelp, setShowHelp] = useState(false);

  const hasOptions = (decision?.optionIds.length ?? 0) > 0;
  const currentIndex =
    decision && currentOptionId
      ? decision.optionIds.indexOf(currentOptionId) + 1
      : 0;
  const totalOptions = decision?.optionIds.length ?? 0;

  function goBack() {
    navigate(`/projects/${projectId}`);
  }

  function handleReject() {
    if (!currentOption) return;
    if (currentOption.status === "active") rejectOption(currentOption.id);
    else if (currentOption.status === "rejected") restoreOption(currentOption.id);
    // final → no-op
  }

  function handleFinal() {
    if (currentOption) markOptionFinal(currentOption.id);
  }

  useReviewKeyboard({
    enabled: hasOptions,
    onNext: goToNextOption,
    onPrevious: goToPreviousOption,
    onReject: handleReject,
    onFinal: handleFinal,
    onEscape: goBack,
    onHelp: () => setShowHelp((v) => !v),
  });

  if (!decision) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ReviewToolbar
        projectId={projectId}
        decision={decision}
        currentIndex={currentIndex}
        totalOptions={totalOptions}
        onHelpToggle={() => setShowHelp((v) => !v)}
      />

      <OptionViewer optionId={currentOptionId} />

      {currentOption && (
        <div className="shrink-0 px-4 py-2 border-t border-gray-200 bg-white flex items-center gap-2">
          <Button
            variant={currentOption.status === "rejected" ? "secondary" : "danger"}
            onClick={handleReject}
            disabled={currentOption.status === "final"}
          >
            {currentOption.status === "rejected" ? "Restore" : "Reject"}
            <span className="ml-1 text-xs opacity-60">R</span>
          </Button>
          <Button
            variant="primary"
            onClick={handleFinal}
            disabled={currentOption.status === "final"}
          >
            {currentOption.status === "final" ? "Final ✓" : "Mark final"}
            <span className="ml-1 text-xs opacity-60">F</span>
          </Button>
        </div>
      )}

      <OptionFilmstrip decisionId={decisionId} />

      {showHelp && <KeyboardShortcutHelp onClose={() => setShowHelp(false)} />}
    </div>
  );
}
