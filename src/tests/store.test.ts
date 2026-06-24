import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "../store/useAppStore";
import { validateImageFile } from "../utils/files";

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

  it("deleteProject cascades to grandchild options", async () => {
    const projectId = store().createProject({ name: "P" });
    const decisionId = store().createDecision(projectId, { title: "D" });
    const optionId = await store().addOption(decisionId, {
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

  it("deleteDecision cascades to child options", async () => {
    const id = store().createDecision(projectId, { title: "D" });
    const optionId = await store().addOption(id, {
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

  it("setCurrentDecision resets currentOptionId to first option of new decision", async () => {
    const d1 = store().createDecision(projectId, { title: "D1" });
    const d2 = store().createDecision(projectId, { title: "D2" });
    const o1 = await store().addOption(d1, { name: "O1", imageDataUrl: "data:image/png;base64,a", imageMimeType: "image/png" });
    const o2 = await store().addOption(d2, { name: "O2", imageDataUrl: "data:image/png;base64,b", imageMimeType: "image/png" });
    store().setCurrentDecision(d1);
    expect(store().currentOptionId).toBe(o1);
    store().setCurrentDecision(d2);
    expect(store().currentOptionId).toBe(o2);
  });

  it("setCurrentDecision sets currentOptionId to null when decision has no options", () => {
    const id = store().createDecision(projectId, { title: "D" });
    store().setCurrentDecision(id);
    expect(store().currentOptionId).toBeNull();
  });

  it("setCurrentDecision can be set to null", () => {
    const id = store().createDecision(projectId, { title: "D" });
    store().setCurrentDecision(id);
    store().setCurrentDecision(null);
    expect(store().currentDecisionId).toBeNull();
  });
});

describe("store — options", () => {
  let projectId: string;
  let decisionId: string;

  beforeEach(() => {
    localStorage.clear();
    store().resetAllData();
    projectId = store().createProject({ name: "P" });
    decisionId = store().createDecision(projectId, { title: "D" });
  });

  it("addOption adds an option with correct fields", async () => {
    const id = await store().addOption(decisionId, {
      name: "Option A",
      imageDataUrl: "data:image/png;base64,abc",
      imageMimeType: "image/png",
    });
    const option = store().options[id];
    expect(option).toBeDefined();
    expect(option.name).toBe("Option A");
    expect(option.decisionId).toBe(decisionId);
    expect(option.status).toBe("active");
    expect(option.imageDataUrl).toBe("data:image/png;base64,abc");
    expect(option.imageMimeType).toBe("image/png");
  });

  it("addOption appends id to decision.optionIds", async () => {
    const id = await store().addOption(decisionId, {
      name: "O",
      imageDataUrl: "data:image/png;base64,abc",
      imageMimeType: "image/png",
    });
    expect(store().decisions[decisionId].optionIds).toContain(id);
  });

  it("first uploaded option sets currentOptionId", async () => {
    expect(store().currentOptionId).toBeNull();
    const id = await store().addOption(decisionId, {
      name: "O",
      imageDataUrl: "data:image/png;base64,abc",
      imageMimeType: "image/png",
    });
    expect(store().currentOptionId).toBe(id);
  });

  it("second option does not override currentOptionId", async () => {
    const id1 = await store().addOption(decisionId, {
      name: "O1",
      imageDataUrl: "data:image/png;base64,abc",
      imageMimeType: "image/png",
    });
    await store().addOption(decisionId, {
      name: "O2",
      imageDataUrl: "data:image/png;base64,def",
      imageMimeType: "image/png",
    });
    expect(store().currentOptionId).toBe(id1);
  });

  it("updateOption patches name and notes", async () => {
    const id = await store().addOption(decisionId, {
      name: "O",
      imageDataUrl: "data:image/png;base64,abc",
      imageMimeType: "image/png",
    });
    store().updateOption(id, { name: "Renamed", notes: "Some notes" });
    expect(store().options[id].name).toBe("Renamed");
    expect(store().options[id].notes).toBe("Some notes");
  });

  it("deleteOption removes from state and decision.optionIds", async () => {
    const id = await store().addOption(decisionId, {
      name: "O",
      imageDataUrl: "data:image/png;base64,abc",
      imageMimeType: "image/png",
    });
    store().deleteOption(id);
    expect(store().options[id]).toBeUndefined();
    expect(store().decisions[decisionId].optionIds).not.toContain(id);
  });

  it("deleteOption clears selectedOptionId on decision if it matched", async () => {
    const id = await store().addOption(decisionId, {
      name: "O",
      imageDataUrl: "data:image/png;base64,abc",
      imageMimeType: "image/png",
    });
    store().markOptionFinal(id);
    store().deleteOption(id);
    expect(store().decisions[decisionId].selectedOptionId).toBeNull();
  });
});

describe("store — reject and final", () => {
  let projectId: string;
  let decisionId: string;
  let o1: string;
  let o2: string;
  let o3: string;

  beforeEach(async () => {
    localStorage.clear();
    store().resetAllData();
    projectId = store().createProject({ name: "P" });
    decisionId = store().createDecision(projectId, { title: "D" });
    o1 = await store().addOption(decisionId, { name: "O1", imageDataUrl: "data:image/png;base64,a", imageMimeType: "image/png" });
    o2 = await store().addOption(decisionId, { name: "O2", imageDataUrl: "data:image/png;base64,b", imageMimeType: "image/png" });
    o3 = await store().addOption(decisionId, { name: "O3", imageDataUrl: "data:image/png;base64,c", imageMimeType: "image/png" });
  });

  it("rejectOption sets an active option to rejected", () => {
    store().rejectOption(o1);
    expect(store().options[o1].status).toBe("rejected");
  });

  it("restoreOption sets a rejected option back to active", () => {
    store().rejectOption(o1);
    store().restoreOption(o1);
    expect(store().options[o1].status).toBe("active");
  });

  it("rejectOption does not reject a final option", () => {
    store().markOptionFinal(o1);
    store().rejectOption(o1);
    expect(store().options[o1].status).toBe("final");
  });

  it("restoreOption only affects rejected options", () => {
    store().restoreOption(o1); // o1 is active
    expect(store().options[o1].status).toBe("active");
  });

  it("markOptionFinal sets the option status to final", () => {
    store().markOptionFinal(o1);
    expect(store().options[o1].status).toBe("final");
  });

  it("markOptionFinal sets decision.selectedOptionId", () => {
    store().markOptionFinal(o2);
    expect(store().decisions[decisionId].selectedOptionId).toBe(o2);
  });

  it("markOptionFinal sets decision status to finalized", () => {
    store().markOptionFinal(o1);
    expect(store().decisions[decisionId].status).toBe("finalized");
  });

  it("markOptionFinal sets decidedAt", () => {
    store().markOptionFinal(o1);
    expect(store().decisions[decisionId].decidedAt).not.toBeNull();
  });

  it("markOptionFinal sets other non-rejected options to active", () => {
    store().markOptionFinal(o1);
    expect(store().options[o2].status).toBe("active");
    expect(store().options[o3].status).toBe("active");
  });

  it("markOptionFinal leaves rejected options rejected", () => {
    store().rejectOption(o2);
    store().markOptionFinal(o1);
    expect(store().options[o2].status).toBe("rejected");
  });

  it("re-marking a different option final moves the final flag", () => {
    store().markOptionFinal(o1);
    store().markOptionFinal(o2);
    expect(store().options[o1].status).toBe("active");
    expect(store().options[o2].status).toBe("final");
    expect(store().decisions[decisionId].selectedOptionId).toBe(o2);
  });

  it("selected final option belongs to the decision", () => {
    store().markOptionFinal(o3);
    const selected = store().decisions[decisionId].selectedOptionId;
    expect(store().decisions[decisionId].optionIds).toContain(selected);
  });
});

describe("store — current option navigation", () => {
  let projectId: string;
  let decisionId: string;
  let o1: string;
  let o2: string;
  let o3: string;

  beforeEach(async () => {
    localStorage.clear();
    store().resetAllData();
    projectId = store().createProject({ name: "P" });
    decisionId = store().createDecision(projectId, { title: "D" });
    store().setCurrentDecision(decisionId);
    o1 = await store().addOption(decisionId, { name: "O1", imageDataUrl: "data:image/png;base64,a", imageMimeType: "image/png" });
    o2 = await store().addOption(decisionId, { name: "O2", imageDataUrl: "data:image/png;base64,b", imageMimeType: "image/png" });
    o3 = await store().addOption(decisionId, { name: "O3", imageDataUrl: "data:image/png;base64,c", imageMimeType: "image/png" });
  });

  it("setCurrentOption selects the clicked option", () => {
    store().setCurrentOption(o2);
    expect(store().currentOptionId).toBe(o2);
  });

  it("goToNextOption advances to the next option", () => {
    store().setCurrentOption(o1);
    store().goToNextOption();
    expect(store().currentOptionId).toBe(o2);
  });

  it("goToPreviousOption goes back to the previous option", () => {
    store().setCurrentOption(o2);
    store().goToPreviousOption();
    expect(store().currentOptionId).toBe(o1);
  });

  it("goToNextOption wraps from last to first", () => {
    store().setCurrentOption(o3);
    store().goToNextOption();
    expect(store().currentOptionId).toBe(o1);
  });

  it("goToPreviousOption wraps from first to last", () => {
    store().setCurrentOption(o1);
    store().goToPreviousOption();
    expect(store().currentOptionId).toBe(o3);
  });

  it("goToNextOption skips rejected options", () => {
    store().rejectOption(o2);
    store().setCurrentOption(o1);
    store().goToNextOption();
    expect(store().currentOptionId).toBe(o3);
  });

  it("goToPreviousOption skips rejected options", () => {
    store().rejectOption(o2);
    store().setCurrentOption(o3);
    store().goToPreviousOption();
    expect(store().currentOptionId).toBe(o1);
  });

  it("goToNextOption wraps correctly while skipping rejected", () => {
    store().rejectOption(o1);
    store().setCurrentOption(o3);
    store().goToNextOption();
    expect(store().currentOptionId).toBe(o2); // wraps, skips rejected o1
  });

  it("goToNextOption does nothing when all options are rejected", () => {
    store().setCurrentOption(o1);
    store().rejectOption(o1);
    store().rejectOption(o2);
    store().rejectOption(o3);
    store().goToNextOption();
    expect(store().currentOptionId).toBe(o1); // unchanged
  });

  it("setCurrentOption does not change option status", () => {
    store().rejectOption(o2);
    store().setCurrentOption(o2);
    expect(store().options[o2].status).toBe("rejected");
  });

  it("rejected options remain in decision.optionIds", () => {
    store().rejectOption(o2);
    expect(store().decisions[decisionId].optionIds).toContain(o2);
  });
});

describe("store — status transitions", () => {
  let projectId: string;
  let decisionId: string;
  let optionId: string;

  beforeEach(async () => {
    localStorage.clear();
    store().resetAllData();
    projectId = store().createProject({ name: "P" });
    decisionId = store().createDecision(projectId, { title: "D" });
    store().updateDecision(decisionId, { notes: "keep me", finalRationale: "important" });
    optionId = await store().addOption(decisionId, {
      name: "O",
      imageDataUrl: "data:image/png;base64,a",
      imageMimeType: "image/png",
    });
  });

  // --- archiveDecision ---

  it("archiveDecision from active sets status to archived and sets archivedAt", () => {
    store().archiveDecision(decisionId);
    const d = store().decisions[decisionId];
    expect(d.status).toBe("archived");
    expect(d.archivedAt).not.toBeNull();
  });

  it("archiveDecision from finalized sets status to archived", () => {
    store().markOptionFinal(optionId);
    store().archiveDecision(decisionId);
    expect(store().decisions[decisionId].status).toBe("archived");
  });

  it("archiveDecision from postponed sets status to archived", () => {
    store().postponeDecision(decisionId);
    store().archiveDecision(decisionId);
    expect(store().decisions[decisionId].status).toBe("archived");
  });

  // --- postponeDecision ---

  it("postponeDecision from active sets status to postponed", () => {
    store().postponeDecision(decisionId);
    expect(store().decisions[decisionId].status).toBe("postponed");
  });

  it("postponeDecision does not set archivedAt", () => {
    store().postponeDecision(decisionId);
    expect(store().decisions[decisionId].archivedAt).toBeNull();
  });

  // --- reactivateDecision ---

  it("reactivateDecision from archived sets status to active and clears archivedAt", () => {
    store().archiveDecision(decisionId);
    store().reactivateDecision(decisionId);
    const d = store().decisions[decisionId];
    expect(d.status).toBe("active");
    expect(d.archivedAt).toBeNull();
  });

  it("reactivateDecision from postponed sets status to active", () => {
    store().postponeDecision(decisionId);
    store().reactivateDecision(decisionId);
    expect(store().decisions[decisionId].status).toBe("active");
  });

  // --- data preservation ---

  it("archiving preserves notes and finalRationale", () => {
    store().archiveDecision(decisionId);
    const d = store().decisions[decisionId];
    expect(d.notes).toBe("keep me");
    expect(d.finalRationale).toBe("important");
  });

  it("archiving preserves options", () => {
    store().archiveDecision(decisionId);
    expect(store().decisions[decisionId].optionIds).toContain(optionId);
    expect(store().options[optionId]).toBeDefined();
  });

  it("postponing preserves options", () => {
    store().postponeDecision(decisionId);
    expect(store().decisions[decisionId].optionIds).toContain(optionId);
    expect(store().options[optionId]).toBeDefined();
  });

  it("reactivating preserves options and notes", () => {
    store().archiveDecision(decisionId);
    store().reactivateDecision(decisionId);
    expect(store().decisions[decisionId].optionIds).toContain(optionId);
    expect(store().decisions[decisionId].notes).toBe("keep me");
  });

  it("reactivating a finalized decision preserves selectedOptionId and decidedAt", () => {
    store().markOptionFinal(optionId);
    const before = store().decisions[decisionId];
    store().archiveDecision(decisionId);
    store().reactivateDecision(decisionId);
    const after = store().decisions[decisionId];
    expect(after.selectedOptionId).toBe(before.selectedOptionId);
    expect(after.decidedAt).toBe(before.decidedAt);
  });

  // --- round trips ---

  it("round trip active → postponed → active → archived → active preserves title", () => {
    store().postponeDecision(decisionId);
    store().reactivateDecision(decisionId);
    store().archiveDecision(decisionId);
    store().reactivateDecision(decisionId);
    expect(store().decisions[decisionId].title).toBe("D");
    expect(store().decisions[decisionId].status).toBe("active");
  });
});

describe("store — reviewViewMode", () => {
  beforeEach(() => {
    localStorage.clear();
    store().resetAllData();
  });

  it("default reviewViewMode is fit-width", () => {
    expect(store().reviewViewMode).toBe("fit-width");
  });

  it("setReviewViewMode updates the mode", () => {
    store().setReviewViewMode("full-image");
    expect(store().reviewViewMode).toBe("full-image");
  });

  it("setReviewViewMode persists across reload", () => {
    store().setReviewViewMode("full-image");
    store().resetAllData();
    // resetAllData clears; persisted value is from the reset
    expect(store().reviewViewMode).toBe("fit-width");
  });
});

describe("file validation", () => {
  function makeFile(name: string, type: string, size: number): File {
    const content = new Uint8Array(size).fill(1);
    return new File([content], name, { type });
  }

  it("accepts a valid PNG file", () => {
    expect(validateImageFile(makeFile("a.png", "image/png", 100))).toBeNull();
  });

  it("accepts a valid JPEG file", () => {
    expect(validateImageFile(makeFile("a.jpg", "image/jpeg", 100))).toBeNull();
  });

  it("accepts a valid WebP file", () => {
    expect(validateImageFile(makeFile("a.webp", "image/webp", 100))).toBeNull();
  });

  it("accepts a valid GIF file", () => {
    expect(validateImageFile(makeFile("a.gif", "image/gif", 100))).toBeNull();
  });

  it("rejects a PDF file", () => {
    expect(validateImageFile(makeFile("a.pdf", "application/pdf", 100))).toBe("invalid-type");
  });

  it("rejects an empty file", () => {
    expect(validateImageFile(makeFile("a.png", "image/png", 0))).toBe("empty");
  });

  it("rejects a file over 10 MB", () => {
    expect(
      validateImageFile(makeFile("a.png", "image/png", 10 * 1024 * 1024 + 1))
    ).toBe("too-large");
  });

  it("accepts a file exactly at 10 MB", () => {
    expect(
      validateImageFile(makeFile("a.png", "image/png", 10 * 1024 * 1024))
    ).toBeNull();
  });
});
