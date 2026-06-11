import { Link, useParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";

export default function Header() {
  const { projectId } = useParams<{ projectId?: string }>();
  const project = useAppStore((s) =>
    projectId ? s.projects[projectId] : undefined
  );

  return (
    <header className="border-b border-gray-200 bg-white px-6 h-12 flex items-center gap-2 shrink-0">
      <Link
        to="/"
        className="font-semibold text-gray-900 tracking-tight hover:text-gray-600 transition-colors"
      >
        Decision Compare
      </Link>
      {project && (
        <>
          <span className="text-gray-300 select-none">/</span>
          <span className="text-sm text-gray-600 truncate max-w-xs">
            {project.name}
          </span>
        </>
      )}
    </header>
  );
}
