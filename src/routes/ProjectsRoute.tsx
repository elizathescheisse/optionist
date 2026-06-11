import { useAppStore } from "../store/useAppStore";
import EmptyState from "../components/layout/EmptyState";

export default function ProjectsRoute() {
  const projects = useAppStore((s) => Object.values(s.projects));

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-6 py-8 gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Projects</h1>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          message="No projects yet."
          detail="Create a project to start comparing design options."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {/* Project cards — Step 3 */}
        </div>
      )}
    </div>
  );
}
