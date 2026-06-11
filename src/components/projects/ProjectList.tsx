import { useAppStore } from "../../store/useAppStore";
import ProjectCard from "./ProjectCard";

export default function ProjectList() {
  const projects = useAppStore((s) =>
    Object.values(s.projects).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  );

  return (
    <div className="flex flex-col gap-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
