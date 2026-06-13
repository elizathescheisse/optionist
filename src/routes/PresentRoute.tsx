import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import { WorkspaceShell } from "../components/layout/AppShell";
import OptionViewer from "../components/options/OptionViewer";
import OptionFilmstrip from "../components/options/OptionFilmstrip";
import Button from "../components/shared/Button";
import Badge from "../components/ui/Badge";

export default function PresentRoute() {
  const { comparisonId } = useParams<{ comparisonId: string }>();
  const navigate = useNavigate();

  const decision = useAppStore((s) =>
    comparisonId ? s.decisions[comparisonId] : undefined,
  );
  const currentOptionId = useAppStore((s) => s.currentOptionId);
  const recommendedOption = useAppStore((s) => {
    if (!comparisonId) return undefined;
    const d = s.decisions[comparisonId];
    if (!d) return undefined;
    const finalId = d.optionIds.find((id) => s.options[id]?.status === "final");
    return finalId ? s.options[finalId] : undefined;
  });
  const setCurrentDecision = useAppStore((s) => s.setCurrentDecision);
  const setCurrentProject = useAppStore((s) => s.setCurrentProject);

  useEffect(() => {
    if (decision) {
      setCurrentProject(decision.projectId);
      setCurrentDecision(decision.id);
    }
  }, [decision, setCurrentDecision, setCurrentProject]);

  if (!comparisonId || !decision) {
    navigate("/app");
    return null;
  }

  return (
    <WorkspaceShell>
      <div className="flex-1 flex flex-col overflow-hidden bg-bg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div>
            <h1 className="text-lg font-semibold text-text">{decision.title}</h1>
            {decision.description && (
              <p className="text-sm text-text-muted mt-0.5 line-clamp-2">
                {decision.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {recommendedOption && (
              <Badge variant="primary">
                Recommendation: {recommendedOption.name}
              </Badge>
            )}
            <Button
              variant="secondary"
              onClick={() => navigate(`/app/comparisons/${comparisonId}`)}
            >
              Exit presentation
            </Button>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <OptionViewer optionId={currentOptionId} />
          <OptionFilmstrip decisionId={decision.id} />
        </div>
      </div>
    </WorkspaceShell>
  );
}
