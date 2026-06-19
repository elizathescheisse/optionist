import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import OptionViewer from "../components/options/OptionViewer";
import OptionFilmstrip from "../components/options/OptionFilmstrip";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

// Full-screen presentation mode for a single decision — no app chrome. Renders
// Full-screen presentation mode — no AppLayout chrome.
export default function PresentRoute() {
  const { decisionId } = useParams<{ decisionId: string }>();
  const navigate = useNavigate();

  const decision = useAppStore((s) =>
    decisionId ? s.decisions[decisionId] : undefined,
  );
  const currentOptionId = useAppStore((s) => s.currentOptionId);
  const recommendedOption = useAppStore((s) => {
    if (!decisionId) return undefined;
    const d = s.decisions[decisionId];
    if (!d) return undefined;
    const finalId = d.optionIds.find((id) => s.options[id]?.status === "final");
    return finalId ? s.options[finalId] : undefined;
  });
  const setCurrentDecision = useAppStore((s) => s.setCurrentDecision);
  const setCurrentProject = useAppStore((s) => s.setCurrentProject);
  const setCurrentOption = useAppStore((s) => s.setCurrentOption);

  useEffect(() => {
    if (!decision) return;
    setCurrentProject(decision.projectId);
    setCurrentDecision(decision.id);
    // Make sure something is on screen even if no option was previously selected.
    const inThisDecision =
      currentOptionId && decision.optionIds.includes(currentOptionId);
    if (!inThisDecision) {
      setCurrentOption(decision.selectedOptionId ?? decision.optionIds[0] ?? null);
    }
  }, [
    decision,
    currentOptionId,
    setCurrentDecision,
    setCurrentProject,
    setCurrentOption,
  ]);

  if (!decisionId || !decision) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
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
            onClick={() => navigate(`/projects/${decision.projectId}`)}
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
  );
}
