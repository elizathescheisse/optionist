import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import TextInput from "../shared/TextInput";
import Button from "../shared/Button";

export default function CreateProjectForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const createProject = useAppStore((s) => s.createProject);
  const setCurrentProject = useAppStore((s) => s.setCurrentProject);
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Project name is required.");
      return;
    }
    const id = createProject({ name: trimmed });
    setCurrentProject(id);
    navigate(`/projects/${id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2 items-start">
        <TextInput
          placeholder="New project name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          aria-label="Project name"
          error={error}
        />
        <Button type="submit" variant="primary">
          Create project
        </Button>
      </div>
    </form>
  );
}
