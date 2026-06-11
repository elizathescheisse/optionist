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
    expect(project.id).toBe(id);
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
    const project = store().projects[id];
    expect(project.name).toBe("Updated");
    expect(project.description).toBe("New desc");
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
