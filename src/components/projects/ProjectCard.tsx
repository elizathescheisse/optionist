import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import type { Project } from "../../types/domain";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { useState } from "react";

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
    (id) => decisions[id]?.decisionStatus === "decided",
  ).length;
  const inReview = project.decisionIds.filter(
    (id) => decisions[id]?.decisionStatus === "in_review",
  ).length;
  const optionCount = project.decisionIds.reduce(
    (n, id) => n + (decisions[id]?.optionIds.length ?? 0),
    0,
  );

  function handleDelete() {
    deleteProject(project.id);
    setShowDeleteModal(false);
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className="w-full text-left group cursor-pointer"
        onClick={() => navigate(`/app/projects/${project.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter") navigate(`/app/projects/${project.id}`);
        }}
      >
        <Card padding="md" hover>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center shrink-0 text-primary font-semibold text-sm">
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-medium text-text truncate text-sm">{project.name}</span>
                {project.description && (
                  <span className="text-xs text-text-soft truncate">{project.description}</span>
                )}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <Badge variant="default">{totalDecisions} comparisons</Badge>
                  {inReview > 0 && <Badge variant="info">{inReview} in review</Badge>}
                  {finalizedDecisions > 0 && (
                    <Badge variant="success">{finalizedDecisions} decided</Badge>
                  )}
                  {optionCount > 0 && (
                    <Badge variant="default">{optionCount} design options</Badge>
                  )}
                </div>
                <span className="text-xs text-text-soft">Updated {formatDate(project.updatedAt)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end -mt-2 mb-2 opacity-0 group-hover:opacity-100">
        <Button variant="destructive" size="sm" onClick={() => setShowDeleteModal(true)}>
          Delete
        </Button>
      </div>

      {showDeleteModal && (
        <Modal
          title="Delete project?"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          confirmLabel="Delete"
          confirmVariant="destructive"
        >
          <p>
            <strong>{project.name}</strong> and all its comparisons and design options will be
            permanently deleted.
          </p>
        </Modal>
      )}
    </>
  );
}
