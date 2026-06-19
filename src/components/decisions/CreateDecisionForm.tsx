import { useState, type FormEvent } from "react";
import { useAppStore } from "../../store/useAppStore";
import TextInput from "../ui/TextInput";
import Button from "../ui/Button";

type Props = { projectId: string };

export default function CreateDecisionForm({ projectId }: Props) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const createDecision = useAppStore((s) => s.createDecision);
  const setCurrentDecision = useAppStore((s) => s.setCurrentDecision);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Decision title is required.");
      return;
    }
    const id = createDecision(projectId, { title: trimmed });
    setCurrentDecision(id);
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1 px-3 pb-3">
      <div className="flex gap-1.5 items-start">
        <TextInput
          placeholder="New decision title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          className="text-xs py-1"
          aria-label="Decision title"
          error={error}
        />
        <Button type="submit" variant="primary" size="sm" className="shrink-0">
          Add
        </Button>
      </div>
    </form>
  );
}
