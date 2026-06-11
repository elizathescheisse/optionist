import { useAppStore } from "../../store/useAppStore";
import ProjectCard from "./ProjectCard";

export default function ProjectList() {
  const projectsById = useAppStore((s) => s.projects);

  const projects = Object.values(projectsById).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="flex flex-col gap-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
