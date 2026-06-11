import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Link } from "react-router-dom";
import DecisionSidebar from "../components/decisions/DecisionSidebar";
import OptionUploader from "../components/options/OptionUploader";
import OptionViewer from "../components/options/OptionViewer";
import OptionFilmstrip from "../components/options/OptionFilmstrip";
import EmptyState from "../components/layout/EmptyState";

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
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-60 shrink-0 border-r border-gray-200 flex flex-col overflow-hidden">
        <DecisionSidebar projectId={project.id} />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {!currentDecisionId ? (
          <EmptyState
            message="Select or create a decision."
            detail="Use the sidebar to add your first decision."
          />
        ) : (
          <CenterPanel decisionId={currentDecisionId} />
        )}
      </main>

      <aside className="w-64 shrink-0 border-l border-gray-200 flex flex-col overflow-y-auto">
        <RightPanel decisionId={currentDecisionId} />
      </aside>
    </div>
  );
}

function CenterPanel({ decisionId }: { decisionId: string }) {
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const currentOptionId = useAppStore((s) => s.currentOptionId);

  if (!decision) return null;

  const hasOptions = decision.optionIds.length > 0;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Decision header bar */}
      <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between gap-4 shrink-0">
        <span className="text-sm font-medium text-gray-800 truncate">
          {decision.title}
        </span>
        {hasOptions && (
          <div className="flex items-center gap-2 shrink-0">
            <OptionUploader decisionId={decision.id} compact />
            <Link
              to={`/projects/${decision.projectId}/review/${decision.id}`}
              className="px-3 py-1.5 rounded text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors"
            >
              Review
            </Link>
          </div>
        )}
      </div>

      {/* Main content area */}
      {!hasOptions ? (
        <div className="flex-1 overflow-y-auto">
          <OptionUploader decisionId={decision.id} />
        </div>
      ) : (
        <>
          <OptionViewer optionId={currentOptionId} />
          <OptionFilmstrip decisionId={decision.id} />
        </>
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
  return (
    <div className="p-4 text-xs text-gray-400">
      Notes panel — Step 9.
    </div>
  );
}
