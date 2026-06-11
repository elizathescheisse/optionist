import { useAppStore } from "../store/useAppStore";
import EmptyState from "../components/layout/EmptyState";
import CreateProjectForm from "../components/projects/CreateProjectForm";
import ProjectList from "../components/projects/ProjectList";
import ImportExportControls from "../components/projects/ImportExportControls";

export default function ProjectsRoute() {
  const projectCount = useAppStore((s) => Object.keys(s.projects).length);

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-6 py-8 gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-900">Projects</h1>
        <ImportExportControls />
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
  );
}
