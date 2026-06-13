import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { useReviewKeyboard } from "../hooks/useReviewKeyboard";
import { WorkspaceShell } from "../components/layout/AppShell";
import DecisionSidebar from "../components/decisions/DecisionSidebar";
import OptionActionsBar from "../components/options/OptionActionsBar";
import OptionFilmstrip from "../components/options/OptionFilmstrip";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import FinalizeDecisionModal from "../components/decisions/FinalizeDecisionModal";
import DecisionSummaryBar from "../components/comparisons/DecisionSummaryBar";
import CompareModeControl from "../components/comparisons/CompareModeControl";
import ComparisonEmptyState from "../components/comparisons/ComparisonEmptyState";
import OptionCardGrid from "../components/comparisons/OptionCardGrid";
import ComparisonInspector from "../components/comparisons/ComparisonInspector";
import Button from "../components/shared/Button";
import { useToast } from "../context/ToastContext";
import type { CompareMode } from "../types/domain";
import { logTimelineEvent } from "../services/timeline";

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
      <div className="flex flex-1 overflow-hidden bg-app-bg">
        <aside className="w-56 shrink-0 bg-app-panel flex flex-col overflow-hidden border-r border-app-border">
          <DecisionSidebar projectId={project.id} />
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {!currentDecisionId ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState
                message="Select or create a comparison."
                detail="Use the sidebar to add your first comparison."
              />
            </div>
          ) : (
            <ComparisonWorkspace decisionId={currentDecisionId} projectName={project.name} />
          )}
        </main>

        <aside className="w-80 shrink-0 flex flex-col overflow-hidden border-l border-app-border">
          {currentDecisionId ? (
            <ComparisonInspector key={currentDecisionId} decisionId={currentDecisionId} />
          ) : (
            <div className="p-4 text-xs text-text-soft">Select a comparison to inspect.</div>
          )}
        </aside>
      </div>
    </WorkspaceShell>
  );
}

function ComparisonWorkspace({
  decisionId,
  projectName,
}: {
  decisionId: string;
  projectName: string;
}) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const currentOption = useAppStore((s) =>
    s.currentOptionId ? s.options[s.currentOptionId] : undefined,
  );
  const updateDecision = useAppStore((s) => s.updateDecision);
  const setCurrentOption = useAppStore((s) => s.setCurrentOption);
  const goToNextOption = useAppStore((s) => s.goToNextOption);
  const goToPreviousOption = useAppStore((s) => s.goToPreviousOption);
  const rejectOption = useAppStore((s) => s.rejectOption);
  const restoreOption = useAppStore((s) => s.restoreOption);

  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeOptionId, setFinalizeOptionId] = useState<string | null>(null);

  const hasOptions = (decision?.optionIds.length ?? 0) > 0;
  const compareMode = decision?.compareMode ?? "grid";

  useEffect(() => {
    if (decision && decision.optionIds.length === 2 && decision.compareMode === "grid") {
      updateDecision(decisionId, { compareMode: "side-by-side" });
    }
  }, [decision?.optionIds.length, decisionId, decision, updateDecision]);

  function setCompareMode(mode: CompareMode) {
    updateDecision(decisionId, { compareMode: mode });
  }

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
    enabled: hasOptions && compareMode === "focus" && !showFinalizeModal,
    onNext: goToNextOption,
    onPrevious: goToPreviousOption,
    onReject: handleReject,
    onFinal: handleFinal,
  });

  if (!decision) return null;

  const badgeVariant =
    decision.decisionStatus === "decided"
      ? "success"
      : decision.decisionStatus === "in_review"
        ? "info"
        : "default";

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-5 py-4 border-b border-app-border bg-app-panel shrink-0">
        <PageHeader
          breadcrumbs={[
            { label: "Projects", to: "/app/projects" },
            { label: projectName, to: `/app/projects/${decision.projectId}` },
            { label: decision.title },
          ]}
          title={decision.title}
          subtitle={decision.description || "Compare design options and capture the decision."}
          badge={{
            label: decision.decisionStatus.replace("_", " "),
            variant: badgeVariant,
          }}
          action={
            <div className="flex items-center gap-2">
              <CompareModeControl
                mode={compareMode}
                onChange={setCompareMode}
                optionCount={decision.optionIds.length}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => showToast("Figma import coming soon")}
              >
                Import
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
          }
        />
      </div>

      <DecisionSummaryBar
        status={decision.decisionStatus}
        onMarkInReview={() =>
          updateDecision(decisionId, { decisionStatus: "in_review" })
        }
        onMarkDecided={() =>
          updateDecision(decisionId, { decisionStatus: "decided" })
        }
        onReopen={() => {
          updateDecision(decisionId, {
            decisionStatus: "in_review",
            status: "active",
          });
          logTimelineEvent({
            type: "comparison_reopened",
            decisionId,
            projectId: decision.projectId,
            label: `Reopened: ${decision.title}`,
          });
        }}
      />

      {!hasOptions ? (
        <ComparisonEmptyState
          onUploadClick={() => showToast("Use Assets tab in the inspector to upload")}
        />
      ) : (
        <>
          <OptionCardGrid
            decisionId={decisionId}
            mode={compareMode}
            onSelectOption={setCurrentOption}
          />
          {compareMode === "focus" && (
            <>
              <OptionActionsBar
                decisionId={decisionId}
                onMarkFinal={handleFinal}
                onReject={handleReject}
              />
              <OptionFilmstrip decisionId={decision.id} />
            </>
          )}
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
