import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "../store/useAppStore";

function store() {
  return useAppStore.getState();
}

describe("store — projects", () => {
  beforeEach(() => {
    localStorage.clear();
    store().resetAllData();
  });

  it("createProject adds a project with correct fields", () => {
    const id = store().createProject({ name: "My Project" });
    const project = store().projects[id];
    expect(project).toBeDefined();
    expect(project.name).toBe("My Project");
    expect(project.description).toBe("");
    expect(project.decisionIds).toEqual([]);
  });

  it("createProject trims the project name", () => {
    const id = store().createProject({ name: "  Trimmed  " });
    expect(store().projects[id].name).toBe("Trimmed");
  });

  it("createProject stores description when provided", () => {
    const id = store().createProject({ name: "P", description: "A desc" });
    expect(store().projects[id].description).toBe("A desc");
  });

  it("updateProject updates name and description", () => {
    const id = store().createProject({ name: "Original" });
    store().updateProject(id, { name: "Updated", description: "New desc" });
    expect(store().projects[id].name).toBe("Updated");
    expect(store().projects[id].description).toBe("New desc");
  });

  it("deleteProject removes the project from state", () => {
    const id = store().createProject({ name: "To Delete" });
    store().deleteProject(id);
    expect(store().projects[id]).toBeUndefined();
  });

  it("deleteProject cascades to child decisions", () => {
    const projectId = store().createProject({ name: "P" });
    const decisionId = store().createDecision(projectId, { title: "D" });
    store().deleteProject(projectId);
    expect(store().decisions[decisionId]).toBeUndefined();
  });

  it("deleteProject cascades to grandchild options", () => {
    const projectId = store().createProject({ name: "P" });
    const decisionId = store().createDecision(projectId, { title: "D" });
    const optionId = store().addOption(decisionId, {
      name: "O",
      imageDataUrl: "data:image/png;base64,abc",
      imageMimeType: "image/png",
    });
    store().deleteProject(projectId);
    expect(store().options[optionId]).toBeUndefined();
  });

  it("deleteProject clears currentProjectId if it matched", () => {
    const id = store().createProject({ name: "P" });
    store().setCurrentProject(id);
    store().deleteProject(id);
    expect(store().currentProjectId).toBeNull();
  });

  it("deleteProject does not clear currentProjectId for a different project", () => {
    const id1 = store().createProject({ name: "P1" });
    const id2 = store().createProject({ name: "P2" });
    store().setCurrentProject(id1);
    store().deleteProject(id2);
    expect(store().currentProjectId).toBe(id1);
  });

  it("setCurrentProject updates currentProjectId", () => {
    const id = store().createProject({ name: "P" });
    store().setCurrentProject(id);
    expect(store().currentProjectId).toBe(id);
  });

  it("setCurrentProject can be set to null", () => {
    const id = store().createProject({ name: "P" });
    store().setCurrentProject(id);
    store().setCurrentProject(null);
    expect(store().currentProjectId).toBeNull();
  });
});

describe("store — decisions", () => {
  let projectId: string;

  beforeEach(() => {
    localStorage.clear();
    store().resetAllData();
    projectId = store().createProject({ name: "P" });
  });

  it("createDecision adds a decision with correct fields", () => {
    const id = store().createDecision(projectId, { title: "My Decision" });
    const decision = store().decisions[id];
    expect(decision).toBeDefined();
    expect(decision.title).toBe("My Decision");
    expect(decision.status).toBe("active");
    expect(decision.projectId).toBe(projectId);
    expect(decision.optionIds).toEqual([]);
    expect(decision.selectedOptionId).toBeNull();
  });

  it("createDecision trims the title", () => {
    const id = store().createDecision(projectId, { title: "  Trimmed  " });
    expect(store().decisions[id].title).toBe("Trimmed");
  });

  it("createDecision adds the id to project.decisionIds", () => {
    const id = store().createDecision(projectId, { title: "D" });
    expect(store().projects[projectId].decisionIds).toContain(id);
  });

  it("updateDecision patches title and notes", () => {
    const id = store().createDecision(projectId, { title: "Original" });
    store().updateDecision(id, { title: "Updated", notes: "Some notes" });
    expect(store().decisions[id].title).toBe("Updated");
    expect(store().decisions[id].notes).toBe("Some notes");
  });

  it("deleteDecision removes the decision from state", () => {
    const id = store().createDecision(projectId, { title: "D" });
    store().deleteDecision(id);
    expect(store().decisions[id]).toBeUndefined();
  });

  it("deleteDecision removes id from project.decisionIds", () => {
    const id = store().createDecision(projectId, { title: "D" });
    store().deleteDecision(id);
    expect(store().projects[projectId].decisionIds).not.toContain(id);
  });

  it("deleteDecision cascades to child options", () => {
    const id = store().createDecision(projectId, { title: "D" });
    const optionId = store().addOption(id, {
      name: "O",
      imageDataUrl: "data:image/png;base64,abc",
      imageMimeType: "image/png",
    });
    store().deleteDecision(id);
    expect(store().options[optionId]).toBeUndefined();
  });

  it("deleteDecision clears currentDecisionId if it matched", () => {
    const id = store().createDecision(projectId, { title: "D" });
    store().setCurrentDecision(id);
    store().deleteDecision(id);
    expect(store().currentDecisionId).toBeNull();
  });

  it("archiveDecision sets status to archived", () => {
    const id = store().createDecision(projectId, { title: "D" });
    store().archiveDecision(id);
    expect(store().decisions[id].status).toBe("archived");
    expect(store().decisions[id].archivedAt).not.toBeNull();
  });

  it("postponeDecision sets status to postponed", () => {
    const id = store().createDecision(projectId, { title: "D" });
    store().postponeDecision(id);
    expect(store().decisions[id].status).toBe("postponed");
  });

  it("reactivateDecision sets status to active and clears archivedAt", () => {
    const id = store().createDecision(projectId, { title: "D" });
    store().archiveDecision(id);
    store().reactivateDecision(id);
    expect(store().decisions[id].status).toBe("active");
    expect(store().decisions[id].archivedAt).toBeNull();
  });

  it("setCurrentDecision updates currentDecisionId", () => {
    const id = store().createDecision(projectId, { title: "D" });
    store().setCurrentDecision(id);
    expect(store().currentDecisionId).toBe(id);
  });

  it("setCurrentDecision can be set to null", () => {
    const id = store().createDecision(projectId, { title: "D" });
    store().setCurrentDecision(id);
    store().setCurrentDecision(null);
    expect(store().currentDecisionId).toBeNull();
  });
});
