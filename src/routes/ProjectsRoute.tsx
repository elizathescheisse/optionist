import { useAppStore } from "../store/useAppStore";
import EmptyState from "../components/ui/EmptyState";
import CreateProjectForm from "../components/projects/CreateProjectForm";
import ProjectList from "../components/projects/ProjectList";
import ImportExportControls from "../components/projects/ImportExportControls";
import PageHeader from "../components/ui/PageHeader";

export default function ProjectsRoute() {
  const projectCount = useAppStore((s) => Object.keys(s.projects).length);

  return (
    <div className="flex-1 overflow-y-auto bg-app-bg">
      <div className="max-w-2xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        <PageHeader
          title="Projects"
          subtitle="Workspaces for organizing comparisons and decisions."
          action={<ImportExportControls />}
        />

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
