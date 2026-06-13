import { Link, useMatch, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import Button from "../shared/Button";

export default function Header() {
  const navigate = useNavigate();
  const projectMatch = useMatch("/app/projects/:projectId");
  const reviewMatch = useMatch("/app/projects/:projectId/review/:decisionId");
  const comparisonMatch = useMatch("/app/comparisons/:comparisonId");
  const projectId =
    projectMatch?.params.projectId ?? reviewMatch?.params.projectId;

  const comparisonId = comparisonMatch?.params.comparisonId;
  const comparisonDecision = useAppStore((s) =>
    comparisonId ? s.decisions[comparisonId] : undefined,
  );
  const resolvedProjectId = projectId ?? comparisonDecision?.projectId;

  const project = useAppStore((s) =>
    resolvedProjectId ? s.projects[resolvedProjectId] : undefined,
  );

  return (
    <header className="bg-surface border-b border-border px-5 h-[var(--spacing-topbar)] flex items-center gap-3 shrink-0">
      <Link
        to="/app"
        className="flex items-center gap-2 hover:opacity-75 transition-opacity motion-reduce:transition-none"
      >
        <span className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-white text-xs font-bold select-none">
          O
        </span>
        <span className="font-semibold text-text tracking-tight text-sm">
          Optionist
        </span>
      </Link>
      {project && (
        <>
          <span className="text-border select-none text-sm">/</span>
          <span className="text-sm text-text-muted truncate max-w-xs">
            {project.name}
          </span>
        </>
      )}
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="secondary"
          className="text-xs"
          onClick={() => navigate("/app/history")}
        >
          View History
        </Button>
      </div>
    </header>
  );
}
