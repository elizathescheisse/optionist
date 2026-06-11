import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import type { Project } from "../../types/domain";
import Button from "../shared/Button";
import Modal from "../shared/Modal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Props = { project: Project };

export default function ProjectCard({ project }: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const decisions = useAppStore((s) => s.decisions);
  const deleteProject = useAppStore((s) => s.deleteProject);
  const navigate = useNavigate();

  const totalDecisions = project.decisionIds.length;
  const finalizedDecisions = project.decisionIds.filter(
    (id) => decisions[id]?.status === "finalized"
  ).length;

  function handleDelete() {
    deleteProject(project.id);
    setShowDeleteModal(false);
  }

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4 bg-white hover:border-gray-300 transition-colors motion-reduce:transition-none">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-medium text-gray-900 truncate">{project.name}</span>
          {project.description && (
            <span className="text-sm text-gray-500 truncate">{project.description}</span>
          )}
          <span className="text-xs text-gray-400 mt-0.5">
            {totalDecisions === 0
              ? "No decisions"
              : `${totalDecisions} decision${totalDecisions !== 1 ? "s" : ""}${
                  finalizedDecisions > 0 ? ` · ${finalizedDecisions} finalized` : ""
                }`}
            {" · "}Updated {formatDate(project.updatedAt)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            Open
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            Delete
          </Button>
        </div>
      </div>

      {showDeleteModal && (
        <Modal
          title="Delete project?"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          confirmLabel="Delete"
          confirmVariant="danger"
        >
          <p>
            <strong>{project.name}</strong> and all its decisions and options
            will be permanently deleted. This cannot be undone.
          </p>
        </Modal>
      )}
    </>
  );
}
