import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { useReviewKeyboard } from "../hooks/useReviewKeyboard";
import { WorkspaceShell } from "../components/layout/AppShell";
import DecisionSidebar from "../components/decisions/DecisionSidebar";
import OptionViewer from "../components/options/OptionViewer";
import OptionActionsBar from "../components/options/OptionActionsBar";
import OptionFilmstrip from "../components/options/OptionFilmstrip";
import EmptyState from "../components/ui/EmptyState";
import DecisionNotesPanel from "../components/decisions/DecisionNotesPanel";
import FinalizeDecisionModal from "../components/decisions/FinalizeDecisionModal";
import StakeholderFeedbackPanel from "../components/comparisons/StakeholderFeedbackPanel";
import Button from "../components/shared/Button";
import { useToast } from "../context/ToastContext";

type Props = {
  projectIdOverride?: string;
};

export default function ProjectRoute({ projectIdOverride }: Props) {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const projectId = projectIdOverride ?? paramProjectId;
  const navigate = useNavigate();
  const project = useAppStore((s) => (projectId ? s.projects[projectId] : undefined));
  const setCurrentProject = useAppStore((s) => s.setCurrentProject);
  const currentDecisionId = useAppStore((s) => s.currentDecisionId);

  useEffect(() => {
    if (!project) {
      navigate("/app/projects");
      return;
    }
    setCurrentProject(project.id);
  }, [project, projectId, setCurrentProject, navigate]);

  if (!project) return null;

  return (
    <WorkspaceShell>
      <div className="flex flex-1 overflow-hidden bg-surface-muted">
        <aside className="w-60 shrink-0 bg-surface-muted flex flex-col overflow-hidden border-r border-border">
          <DecisionSidebar projectId={project.id} />
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-surface">
          {!currentDecisionId ? (
            <EmptyState
              message="Select or create a comparison."
              detail="Use the sidebar to add your first comparison."
            />
          ) : (
            <CenterPanel decisionId={currentDecisionId} />
          )}
        </main>

        <aside className="w-72 shrink-0 bg-surface-muted flex flex-col overflow-hidden border-l border-border">
          <RightPanel decisionId={currentDecisionId} />
        </aside>
      </div>
    </WorkspaceShell>
  );
}

function CenterPanel({ decisionId }: { decisionId: string }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const currentOptionId = useAppStore((s) => s.currentOptionId);
  const currentOption = useAppStore((s) =>
    s.currentOptionId ? s.options[s.currentOptionId] : undefined,
  );
  const goToNextOption = useAppStore((s) => s.goToNextOption);
  const goToPreviousOption = useAppStore((s) => s.goToPreviousOption);
  const rejectOption = useAppStore((s) => s.rejectOption);
  const restoreOption = useAppStore((s) => s.restoreOption);

  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeOptionId, setFinalizeOptionId] = useState<string | null>(null);

  const hasOptions = (decision?.optionIds.length ?? 0) > 0;
  const navigableCount = useAppStore((s) => {
    const d = s.decisions[decisionId];
    if (!d) return 0;
    return d.optionIds.filter((id) => s.options[id]?.status !== "rejected").length;
  });
  const allRejected = hasOptions && navigableCount === 0;

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
      <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-text">{decision.title}</h2>
          {decision.description && (
            <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
              {decision.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => showToast("Figma import is coming soon.")}
          >
            Import from Figma
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              navigate(`/app/comparisons/${decisionId}/present?present=1`)
            }
          >
            Present
          </Button>
        </div>
      </div>

      {!hasOptions ? (
        <EmptyState
          message="No screenshots yet."
          detail="Add screenshots from the right panel →"
        />
      ) : allRejected ? (
        <>
          <EmptyState
            message="All options rejected."
            detail="Upload new screenshots or click a thumbnail below to restore one."
          />
          <OptionFilmstrip decisionId={decision.id} />
        </>
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
      <div className="p-4 text-xs text-text-soft">
        Select a comparison to see notes.
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DecisionNotesPanel key={decisionId} decisionId={decisionId} />
      <StakeholderFeedbackPanel decisionId={decisionId} />
    </div>
  );
}
