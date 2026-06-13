import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { useReviewKeyboard } from "../hooks/useReviewKeyboard";
import DecisionSidebar from "../components/decisions/DecisionSidebar";
import OptionViewer from "../components/options/OptionViewer";
import OptionActionsBar from "../components/options/OptionActionsBar";
import OptionFilmstrip from "../components/options/OptionFilmstrip";
import EmptyState from "../components/layout/EmptyState";
import DecisionNotesPanel from "../components/decisions/DecisionNotesPanel";
import FinalizeDecisionModal from "../components/decisions/FinalizeDecisionModal";

export default function ProjectRoute() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const project = useAppStore((s) => (projectId ? s.projects[projectId] : undefined));
  const setCurrentProject = useAppStore((s) => s.setCurrentProject);
  const currentDecisionId = useAppStore((s) => s.currentDecisionId);

  useEffect(() => {
    if (!project) {
      navigate("/");
      return;
    }
    setCurrentProject(project.id);
  }, [project, projectId, setCurrentProject, navigate]);

  if (!project) return null;

  return (
    <div className="flex flex-1 overflow-hidden bg-gray-50">
      {/* Left sidebar — receded surface */}
      <aside className="w-60 shrink-0 bg-gray-50 flex flex-col overflow-hidden border-r border-gray-200/60">
        <DecisionSidebar projectId={project.id} />
      </aside>

      {/* Center panel — elevated canvas */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-white">
        {!currentDecisionId ? (
          <EmptyState
            message="Select or create a decision."
            detail="Use the sidebar to add your first decision."
          />
        ) : (
          <CenterPanel decisionId={currentDecisionId} />
        )}
      </main>

      {/* Right panel — receded surface */}
      <aside className="w-64 shrink-0 bg-gray-50 flex flex-col overflow-hidden border-l border-gray-200/60">
        <RightPanel decisionId={currentDecisionId} />
      </aside>
    </div>
  );
}

function CenterPanel({ decisionId }: { decisionId: string }) {
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const currentOptionId = useAppStore((s) => s.currentOptionId);
  const currentOption = useAppStore((s) =>
    s.currentOptionId ? s.options[s.currentOptionId] : undefined
  );
  const goToNextOption = useAppStore((s) => s.goToNextOption);
  const goToPreviousOption = useAppStore((s) => s.goToPreviousOption);
  const rejectOption = useAppStore((s) => s.rejectOption);
  const restoreOption = useAppStore((s) => s.restoreOption);

  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeOptionId, setFinalizeOptionId] = useState<string | null>(null);

  const hasOptions = (decision?.optionIds.length ?? 0) > 0;

  function handleReject() {
    if (!currentOption) return;
    if (currentOption.status === "active") rejectOption(currentOption.id);
    else if (currentOption.status === "rejected") restoreOption(currentOption.id);
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
  });

  if (!decision) return null;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {!hasOptions ? (
        <EmptyState
          message="No screenshots yet."
          detail="Add screenshots from the right panel →"
        />
      ) : (
        <>
          <OptionViewer optionId={currentOptionId} />
          <OptionActionsBar
            decisionId={decisionId}
            onMarkFinal={handleFinal}
            onReject={handleReject}
          />
          <OptionFilmstrip decisionId={decision.id} />
        </>
      )}

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

function RightPanel({ decisionId }: { decisionId: string | null }) {
  if (!decisionId) {
    return (
      <div className="p-4 text-xs text-gray-400">
        Select a decision to see notes.
      </div>
    );
  }
  return <DecisionNotesPanel key={decisionId} decisionId={decisionId} />;
}
