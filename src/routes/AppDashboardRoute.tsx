import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import Button from "../components/shared/Button";
import TextInput from "../components/shared/TextInput";
import Textarea from "../components/shared/Textarea";
import Modal from "../components/shared/Modal";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import type { Decision, ID } from "../types/domain";

function getRecentDecisions(
  decisions: Record<ID, Decision>,
  projects: Record<ID, { name: string }>,
  limit = 6,
): Array<Decision & { projectName: string }> {
  return Object.values(decisions)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit)
    .map((d) => ({
      ...d,
      projectName: projects[d.projectId]?.name ?? "Unknown",
    }));
}

export default function AppDashboardRoute() {
  const navigate = useNavigate();
  const onboarding = useAuthStore((s) => s.onboarding);
  const user = useAuthStore((s) => s.user);
  const decisions = useAppStore((s) => s.decisions);
  const projects = useAppStore((s) => s.projects);
  const createProject = useAppStore((s) => s.createProject);
  const createDecision = useAppStore((s) => s.createDecision);

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [decisionDate, setDecisionDate] = useState("");

  const decisionList = Object.values(decisions);
  const activeCount = decisionList.filter((d) => d.status === "active").length;
  const finalizedCount = decisionList.filter((d) => d.status === "finalized").length;
  const recent = getRecentDecisions(decisions, projects);

  const welcomeName = onboarding?.role ?? user?.name ?? "there";

  function handleCreate() {
    if (!title.trim()) return;

    let projectId = Object.keys(projects)[0];
    if (!projectId) {
      projectId = createProject({
        name: onboarding?.workspaceName ?? "My Workspace",
      });
    }

    const decisionId = createDecision(projectId, {
      title: title.trim(),
      description: [
        description.trim(),
        audience.trim() ? `Audience: ${audience.trim()}` : "",
        decisionDate ? `Decision needed by: ${decisionDate}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    setShowCreate(false);
    setTitle("");
    setDescription("");
    setAudience("");
    setDecisionDate("");
    navigate(`/app/comparisons/${decisionId}`);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        <PageHeader
          title={`Welcome back, ${welcomeName}`}
          subtitle="Compare design directions and capture decisions in one place."
          action={
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              Create Comparison
            </Button>
          }
        />

        <div className="grid grid-cols-3 gap-4">
          <Card padding="md">
            <p className="text-xs text-text-soft font-medium uppercase tracking-wider">
              Active comparisons
            </p>
            <p className="text-2xl font-semibold text-text mt-1">{activeCount}</p>
          </Card>
          <Card padding="md">
            <p className="text-xs text-text-soft font-medium uppercase tracking-wider">
              Decisions captured
            </p>
            <p className="text-2xl font-semibold text-text mt-1">{finalizedCount}</p>
          </Card>
          <Card padding="md">
            <p className="text-xs text-text-soft font-medium uppercase tracking-wider">
              Stakeholders involved
            </p>
            <p className="text-2xl font-semibold text-text mt-1">—</p>
          </Card>
        </div>

        <section>
          <h2 className="text-md font-semibold text-text mb-4">Recent comparisons</h2>
          {recent.length === 0 ? (
            <EmptyState
              message="No comparisons yet"
              detail="Create your first comparison to present design options, capture feedback, and document the decision."
              action={
                <Button variant="primary" onClick={() => setShowCreate(true)}>
                  Create Comparison
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              {recent.map((d) => (
                <Link
                  key={d.id}
                  to={`/app/comparisons/${d.id}`}
                  className="block"
                >
                  <Card hover padding="md">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-text">{d.title}</p>
                        <p className="text-xs text-text-soft mt-0.5">
                          {d.projectName}
                        </p>
                      </div>
                      <Badge
                        variant={
                          d.status === "finalized"
                            ? "success"
                            : d.status === "active"
                              ? "primary"
                              : "default"
                        }
                      >
                        {d.status}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {showCreate && (
        <Modal
          title="Create Comparison"
          confirmLabel="Create"
          onConfirm={handleCreate}
          onCancel={() => setShowCreate(false)}
          className="max-w-md"
        >
          <div className="flex flex-col gap-3">
            <TextInput
              label="Comparison title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Dashboard direction review"
            />
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <TextInput
              label="Audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Executive team"
            />
            <TextInput
              label="Decision needed by"
              type="date"
              value={decisionDate}
              onChange={(e) => setDecisionDate(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
