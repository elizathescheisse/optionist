import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import EmptyState from "../components/ui/EmptyState";
import CreateProjectForm from "../components/projects/CreateProjectForm";
import ProjectList from "../components/projects/ProjectList";
import ImportExportControls from "../components/projects/ImportExportControls";

export default function ProjectsRoute() {
  const projectCount = useAppStore((s) => Object.keys(s.projects).length);
  const isGuest = useAuthStore((s) => s.isGuest);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-text tracking-tight">Projects</h1>
          {!isGuest() && <ImportExportControls />}
        </div>

        <CreateProjectForm />

        {projectCount === 0 ? (
          <EmptyState
            message="No projects yet."
            detail="Create a project above to start comparing design options."
          />
        ) : (
          <ProjectList />
        )}
      </div>
    </div>
  );
}
