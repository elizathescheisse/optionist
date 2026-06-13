import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import OptionCardGrid from "../components/comparisons/OptionCardGrid";
import Button from "../components/shared/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

export default function PresentRoute() {
  const { comparisonId } = useParams<{ comparisonId: string }>();
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);

  const decision = useAppStore((s) =>
    comparisonId ? s.decisions[comparisonId] : undefined,
  );
  const settings = useAuthStore((s) => s.settings);
  const setCurrentDecision = useAppStore((s) => s.setCurrentDecision);
  const setCurrentProject = useAppStore((s) => s.setCurrentProject);
  const setCurrentOption = useAppStore((s) => s.setCurrentOption);

  const recommendedOption = useAppStore((s) => {
    if (!comparisonId) return undefined;
    const d = s.decisions[comparisonId];
    if (!d?.selectedOptionId) return undefined;
    return s.options[d.selectedOptionId];
  });

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

  const pres = decision.presentationSettings;
  const globalPres = settings.presentationDefaults;
  const showRec = pres?.showRecommendation ?? globalPres?.showRecommendation ?? true;
  const showExec = pres?.showExecutiveSummary ?? globalPres?.showExecutiveSummary ?? true;
  const compareMode = decision.compareMode === "focus" ? "focus" : "grid";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-app-bg overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-app-border bg-app-panel shrink-0">
        <div className="min-w-0">
          <p className="text-xs text-text-soft uppercase tracking-wider">Presentation</p>
          <h1 className="text-lg font-semibold text-text truncate">{decision.title}</h1>
          {decision.description && (
            <p className="text-sm text-text-muted mt-0.5 line-clamp-2">{decision.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {showRec && recommendedOption && (
            <Badge variant="primary">Recommendation: {recommendedOption.name}</Badge>
          )}
          <Badge variant={decision.decisionStatus === "decided" ? "success" : "info"}>
            {decision.decisionStatus.replace("_", " ")}
          </Badge>
          {showExec && (
            <Button variant="outline" size="sm" onClick={() => setShowSummary(!showSummary)}>
              {showSummary ? "Show options" : "Executive summary"}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/app/comparisons/${comparisonId}`)}
          >
            Exit
          </Button>
        </div>
      </header>

      {showSummary ? (
        <div className="flex-1 overflow-y-auto p-8">
          <Card padding="lg" className="max-w-2xl mx-auto shadow-card">
            <h2 className="text-xl font-semibold text-text mb-4">Executive summary</h2>
            {decision.summary && (
              <p className="text-sm text-text-muted leading-relaxed mb-4">{decision.summary}</p>
            )}
            {recommendedOption && (
              <div className="mb-4">
                <p className="text-xs font-medium text-text-soft mb-2">Selected direction</p>
                <img
                  src={recommendedOption.imageDataUrl}
                  alt={recommendedOption.name}
                  className="rounded-lg border border-app-border max-h-64 object-contain"
                />
                <p className="text-sm font-medium text-text mt-2">{recommendedOption.name}</p>
              </div>
            )}
            {decision.finalRationale && (
              <div className="mb-3">
                <p className="text-xs font-medium text-text-soft">Rationale</p>
                <p className="text-sm text-text-muted">{decision.finalRationale}</p>
              </div>
            )}
            {decision.nextSteps && (
              <div>
                <p className="text-xs font-medium text-text-soft">Next steps</p>
                <p className="text-sm text-text-muted">{decision.nextSteps}</p>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <OptionCardGrid
          decisionId={comparisonId}
          mode={compareMode}
          onSelectOption={setCurrentOption}
        />
      )}
    </div>
  );
}
