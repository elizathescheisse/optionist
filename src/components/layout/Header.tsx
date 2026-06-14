import { Link, useMatch, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import Button from "../shared/Button";

export default function Header() {
  const navigate = useNavigate();
  const projectMatch = useMatch("/projects/:projectId");
  const reviewMatch = useMatch("/projects/:projectId/review/:decisionId");
  const projectId =
    projectMatch?.params.projectId ?? reviewMatch?.params.projectId;
  const project = useAppStore((s) =>
    projectId ? s.projects[projectId] : undefined
  );

  return (
    <header className="bg-white border-b border-gray-100 px-5 h-12 flex items-center gap-3 shrink-0">
      <Link
        to="/"
        className="flex items-center gap-2 hover:opacity-75 transition-opacity motion-reduce:transition-none"
      >
        <span className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center text-white text-xs font-bold select-none">
          O
        </span>
        <span className="font-semibold text-gray-900 tracking-tight text-sm">
          Optionist
        </span>
      </Link>
      {project && (
        <>
          <span className="text-gray-200 select-none text-sm">/</span>
          <span className="text-sm text-gray-500 truncate max-w-xs">
            {project.name}
          </span>
        </>
      )}
      <div className="ml-auto">
        <Button
          variant="secondary"
          className="text-xs"
          onClick={() => navigate("/history")}
        >
          View History
        </Button>
      </div>
    </header>
  );
}
