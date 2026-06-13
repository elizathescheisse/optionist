import { Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import ProjectRoute from "./ProjectRoute";

/** Resolves a comparison (decision) ID and renders the project workspace with that decision selected. */
export default function ComparisonRoute() {
  const { comparisonId } = useParams<{ comparisonId: string }>();
  const decision = useAppStore((s) =>
    comparisonId ? s.decisions[comparisonId] : undefined,
  );
  const setCurrentDecision = useAppStore((s) => s.setCurrentDecision);
  const setCurrentProject = useAppStore((s) => s.setCurrentProject);

  useEffect(() => {
    if (decision) {
      setCurrentProject(decision.projectId);
      setCurrentDecision(decision.id);
    }
  }, [decision, setCurrentDecision, setCurrentProject]);

  if (!comparisonId || !decision) {
    return <Navigate to="/app" replace />;
  }

  return <ProjectRoute projectIdOverride={decision.projectId} />;
}
