import { Link, useMatch } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";

export default function WorkspaceBar() {
  const projectMatch = useMatch("/projects/:projectId");
  const reviewMatch = useMatch("/projects/:projectId/review/:decisionId");
  const projectId =
    projectMatch?.params.projectId ?? reviewMatch?.params.projectId;
  const decisionId = reviewMatch?.params.decisionId;
  const project = useAppStore((s) =>
    projectId ? s.projects[projectId] : undefined,
  );
  const decision = useAppStore((s) =>
    decisionId ? s.decisions[decisionId] : undefined,
  );

  if (!project) return null;

  return (
    <header className="shrink-0 bg-surface border-b border-border px-5 h-12 flex items-center gap-2 text-sm">
      <Link
        to="/projects"
        className="text-text-muted hover:text-text transition-colors"
      >
        Projects
      </Link>
      <span className="text-text-soft select-none">/</span>
      <Link
        to={`/projects/${project.id}`}
        className="text-text-muted hover:text-text transition-colors truncate max-w-xs"
      >
        {project.name}
      </Link>
      {decision && (
        <>
          <span className="text-text-soft select-none">/</span>
          <span className="text-text truncate max-w-xs">{decision.title}</span>
          <span className="ml-1 text-xs font-medium uppercase tracking-wide text-text-soft">
            Review
          </span>
        </>
      )}
    </header>
  );
}
