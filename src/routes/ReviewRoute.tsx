import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import ReviewWorkspace from "../components/review/ReviewWorkspace";
import WorkspaceBar from "../components/layout/WorkspaceBar";

export default function ReviewRoute() {
  const { projectId, decisionId } = useParams<{
    projectId: string;
    decisionId: string;
  }>();
  const navigate = useNavigate();
  const project = useAppStore((s) => (projectId ? s.projects[projectId] : undefined));
  const decision = useAppStore((s) => (decisionId ? s.decisions[decisionId] : undefined));
  const setCurrentProject = useAppStore((s) => s.setCurrentProject);
  const setCurrentDecision = useAppStore((s) => s.setCurrentDecision);

  useEffect(() => {
    if (!project) {
      navigate("/projects");
      return;
    }
    if (!decision) {
      navigate(`/projects/${projectId}`);
      return;
    }
    setCurrentProject(project.id);
    setCurrentDecision(decision.id);
  }, [project, decision, projectId, navigate, setCurrentProject, setCurrentDecision]);

  if (!project || !decision) return null;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <WorkspaceBar />
      <ReviewWorkspace projectId={project.id} decisionId={decision.id} />
    </div>
  );
}
