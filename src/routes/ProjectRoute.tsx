import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import DecisionSidebar from "../components/decisions/DecisionSidebar";
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
      {/* Left: decisions sidebar */}
      <aside className="w-60 shrink-0 border-r border-gray-200 flex flex-col overflow-hidden">
        <DecisionSidebar projectId={project.id} />
      </aside>

      {/* Center: option viewer / preview */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {!currentDecisionId ? (
          <EmptyState
            message="Select or create a decision."
            detail="Use the sidebar to add your first decision."
          />
        ) : (
          <CenterPanel decisionId={currentDecisionId} />
        )}
      </main>

      {/* Right: notes panel */}
      <aside className="w-64 shrink-0 border-l border-gray-200 flex flex-col overflow-y-auto">
        <RightPanel decisionId={currentDecisionId} />
      </aside>
    </div>
  );
}

function CenterPanel({ decisionId }: { decisionId: string }) {
  const decision = useAppStore((s) => s.decisions[decisionId]);
  if (!decision) return null;

  const hasOptions = decision.optionIds.length > 0;

  if (!hasOptions) {
    return (
      <EmptyState
        message="Upload screenshots for this decision."
        detail="Option upload coming in the next step."
      />
    );
  }

  // Option viewer implemented in Step 6
  return (
    <EmptyState message="Option viewer coming soon." />
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

  // Full notes panel implemented in Step 9
  return (
    <div className="p-4 text-xs text-gray-400">
      Notes panel coming soon.
    </div>
  );
}
