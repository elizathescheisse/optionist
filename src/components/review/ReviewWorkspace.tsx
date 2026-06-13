import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { useReviewKeyboard } from "../../hooks/useReviewKeyboard";
import OptionViewer from "../options/OptionViewer";
import OptionFilmstrip from "../options/OptionFilmstrip";
import Button from "../shared/Button";
import ReviewToolbar from "./ReviewToolbar";
import KeyboardShortcutHelp from "./KeyboardShortcutHelp";
import FinalizeDecisionModal from "../decisions/FinalizeDecisionModal";

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

  const [showHelp, setShowHelp] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeOptionId, setFinalizeOptionId] = useState<string | null>(null);

  const hasOptions = (decision?.optionIds.length ?? 0) > 0;
  const currentIndex =
    decision && currentOptionId
      ? decision.optionIds.indexOf(currentOptionId) + 1
      : 0;
  const totalOptions = decision?.optionIds.length ?? 0;

  function goBack() {
    navigate(`/app/projects/${projectId}`);
  }

  function handleReject() {
    if (!currentOption) return;
    if (currentOption.status === "active") rejectOption(currentOption.id);
    else if (currentOption.status === "rejected") restoreOption(currentOption.id);
    // final → no-op
  }

  function handleFinal() {
    if (!currentOption) return;
    setFinalizeOptionId(currentOption.id);
    setShowFinalizeModal(true);
  }

  useReviewKeyboard({
    enabled: hasOptions && !showFinalizeModal,
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
            variant={currentOption.status === "rejected" ? "secondary" : "destructive"}
            onClick={handleReject}
            disabled={currentOption.status === "final"}
          >
            {currentOption.status === "rejected" ? "Restore" : "Reject"}
            <kbd className="ml-1 inline-flex items-center rounded bg-gray-100 px-1 py-0.5 text-xs font-mono text-gray-400 leading-none">R</kbd>
          </Button>
          <Button
            variant="primary"
            onClick={handleFinal}
            disabled={currentOption.status === "final"}
          >
            {currentOption.status === "final" ? "Final ✓" : "Mark final"}
            <kbd className="ml-1 inline-flex items-center rounded bg-white/20 px-1 py-0.5 text-xs font-mono text-white/60 leading-none">F</kbd>
          </Button>
        </div>
      )}

      <OptionFilmstrip decisionId={decisionId} />

      {showHelp && <KeyboardShortcutHelp onClose={() => setShowHelp(false)} />}

      {showFinalizeModal && finalizeOptionId && (
        <FinalizeDecisionModal
          decisionId={decisionId}
          optionId={finalizeOptionId}
          onClose={() => {
            setShowFinalizeModal(false);
            setFinalizeOptionId(null);
          }}
        />
      )}
    </div>
  );
}
