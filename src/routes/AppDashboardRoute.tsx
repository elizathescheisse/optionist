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
import { logTimelineEvent } from "../services/timeline";

const TEMPLATES = [
  { id: "blank", label: "Blank comparison", description: "Start from scratch" },
  { id: "dashboard", label: "Dashboard review", description: "Layout and IA decisions" },
  { id: "brand", label: "Brand direction", description: "Visual identity options" },
];

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

function getReviewQueue(decisions: Record<ID, Decision>) {
  return Object.values(decisions)
    .filter((d) => d.decisionStatus !== "decided" && d.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
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
  const [templateId, setTemplateId] = useState("blank");

  const decisionList = Object.values(decisions);
  const activeCount = decisionList.filter((d) => d.status === "active").length;
  const finalizedCount = decisionList.filter((d) => d.status === "finalized").length;
  const inReviewCount = decisionList.filter((d) => d.decisionStatus === "in_review").length;
  const recent = getRecentDecisions(decisions, projects);
  const reviewQueue = getReviewQueue(decisions);

  const welcomeName = settingsName(onboarding?.role, user?.name);

  function handleCreate() {
    if (!title.trim()) return;

    let projectId = Object.keys(projects)[0];
    if (!projectId) {
      projectId = createProject({
        name: onboarding?.workspaceName ?? "My Workspace",
      });
    }

    const template = TEMPLATES.find((t) => t.id === templateId);
    const decisionId = createDecision(projectId, {
      title: title.trim(),
      description: [
        description.trim() || template?.description || "",
        audience.trim() ? `Audience: ${audience.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (decisionDate) {
      useAppStore.getState().updateDecision(decisionId, {
        dueDate: decisionDate,
        audience: audience.trim(),
        decisionStatus: "in_review",
      });
    }

    logTimelineEvent({
      type: "comparison_created",
      decisionId,
      projectId,
      label: `Created: ${title.trim()}`,
    });

    setShowCreate(false);
    setTitle("");
    setDescription("");
    setAudience("");
    setDecisionDate("");
    setTemplateId("blank");
    navigate(`/app/comparisons/${decisionId}`);
  }

  return (
    <div className="flex-1 overflow-y-auto bg-app-bg">
      <div className="max-w-4xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        <PageHeader
          title={`Welcome back, ${welcomeName}`}
          subtitle="Compare design directions and capture decisions in one place."
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/app/projects")}>
                View projects
              </Button>
              <Button variant="primary" onClick={() => setShowCreate(true)}>
                Create Comparison
              </Button>
            </div>
          }
        />

        <Card padding="lg" className="bg-gradient-to-br from-app-panel to-primary-soft/30 border-primary/10">
          <p className="text-sm text-text-muted">
            Ready to review? Open a comparison, upload design options, gather feedback, and capture the decision — all in one workspace.
          </p>
          <Button variant="primary" className="mt-4" onClick={() => setShowCreate(true)}>
            Start a comparison
          </Button>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active comparisons" value={activeCount} onClick={() => navigate("/app/projects")} />
          <StatCard label="In review" value={inReviewCount} />
          <StatCard label="Decisions captured" value={finalizedCount} />
          <StatCard label="Projects" value={Object.keys(projects).length} onClick={() => navigate("/app/projects")} />
        </div>

        {reviewQueue.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-md font-semibold text-text">Review queue</h2>
              <Link to="/app/history" className="text-xs text-primary hover:underline">
                View history
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {reviewQueue.map((d) => (
                <Link key={d.id} to={`/app/comparisons/${d.id}`} className="block">
                  <Card hover padding="md">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-text">{d.title}</p>
                        <p className="text-xs text-text-soft">Due {d.dueDate}</p>
                      </div>
                      <Badge variant="warning">Due soon</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

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
                <Link key={d.id} to={`/app/comparisons/${d.id}`} className="block">
                  <Card hover padding="md">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-text">{d.title}</p>
                        <p className="text-xs text-text-soft mt-0.5">{d.projectName}</p>
                      </div>
                      <Badge
                        variant={
                          d.decisionStatus === "decided"
                            ? "success"
                            : d.decisionStatus === "in_review"
                              ? "info"
                              : "default"
                        }
                      >
                        {d.decisionStatus.replace("_", " ")}
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
          size="md"
          onConfirm={handleCreate}
          onCancel={() => setShowCreate(false)}
        >
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-medium text-text-muted mb-2">Template</p>
              <div className="flex flex-col gap-1">
                {TEMPLATES.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm text-text cursor-pointer">
                    <input
                      type="radio"
                      name="template"
                      checked={templateId === t.id}
                      onChange={() => {
                        setTemplateId(t.id);
                        if (t.id !== "blank" && !title) setTitle(t.label);
                      }}
                    />
                    {t.label}
                    <span className="text-text-soft text-xs">— {t.description}</span>
                  </label>
                ))}
              </div>
            </div>
            <TextInput
              label="Comparison title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Dashboard direction review"
            />
            <Textarea
              label="Decision to make"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What decision needs to be made?"
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

function settingsName(role?: string, name?: string) {
  return role ?? name ?? "there";
}

function StatCard({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <p className="text-xs text-text-soft font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-semibold text-text mt-1">{value}</p>
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="text-left w-full">
        <Card padding="md" hover>{inner}</Card>
      </button>
    );
  }
  return <Card padding="md">{inner}</Card>;
}
