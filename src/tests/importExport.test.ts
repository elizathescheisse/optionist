import { describe, it, expect, beforeEach } from "vitest";
import { validateImportedData } from "../utils/validation";
import { useAppStore } from "../store/useAppStore";
import type { ExportedAppData } from "../types/importExport";

function store() {
  return useAppStore.getState();
}

// Minimal valid export payload; tests mutate copies of this.
function makeValidExport(): ExportedAppData {
  return {
    appName: "design-decision-tool",
    dataVersion: 1,
    exportedAt: "2026-01-01T00:00:00.000Z",
    projects: {
      p1: {
        id: "p1",
        name: "Project",
        description: "",
        decisionIds: ["d1"],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    },
    decisions: {
      d1: {
        id: "d1",
        projectId: "p1",
        title: "Decision",
        description: "",
        status: "active",
        optionIds: ["o1"],
        selectedOptionId: null,
        notes: "",
        finalRationale: "",
        decidedAt: null,
        archivedAt: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    },
    options: {
      o1: {
        id: "o1",
        decisionId: "d1",
        name: "Option",
        imageDataUrl: "data:image/png;base64,abc",
        imageMimeType: "image/png",
        status: "active",
        notes: "",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    },
  };
}

describe("validateImportedData — valid data", () => {
  it("accepts a valid minimal export", () => {
    expect(validateImportedData(makeValidExport())).toEqual({
      ok: true,
      data: makeValidExport(),
    });
  });

  it("accepts an empty export (no projects, decisions, or options)", () => {
    const data = { ...makeValidExport(), projects: {}, decisions: {}, options: {} };
    const result = validateImportedData(data);
    expect(result.ok).toBe(true);
  });
});

describe("validateImportedData — envelope errors", () => {
  it("rejects non-object input", () => {
    expect(validateImportedData(null)).toMatchObject({ ok: false });
    expect(validateImportedData("string")).toMatchObject({ ok: false });
    expect(validateImportedData(42)).toMatchObject({ ok: false });
  });

  it("rejects wrong appName", () => {
    const result = validateImportedData({ ...makeValidExport(), appName: "other-tool" });
    expect(result.ok).toBe(false);
  });

  it("rejects unsupported dataVersion", () => {
    const result = validateImportedData({ ...makeValidExport(), dataVersion: 2 });
    expect(result.ok).toBe(false);
  });

  it("rejects missing projects key", () => {
    const { projects: _p, ...rest } = makeValidExport();
    const result = validateImportedData(rest);
    expect(result.ok).toBe(false);
  });

  it("rejects non-object projects", () => {
    const result = validateImportedData({ ...makeValidExport(), projects: [] });
    expect(result.ok).toBe(false);
  });
});

describe("validateImportedData — record-level errors", () => {
  it("rejects a project record missing a required field", () => {
    const data = makeValidExport();
    const { name: _n, ...badProject } = data.projects.p1;
    const result = validateImportedData({
      ...data,
      projects: { p1: badProject },
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a decision record with an invalid status", () => {
    const data = makeValidExport();
    const result = validateImportedData({
      ...data,
      decisions: { d1: { ...data.decisions.d1, status: "unknown" } },
    });
    expect(result.ok).toBe(false);
  });

  it("rejects an option record with an unsupported MIME type", () => {
    const data = makeValidExport();
    const result = validateImportedData({
      ...data,
      options: { o1: { ...data.options.o1, imageMimeType: "image/bmp" } },
    });
    expect(result.ok).toBe(false);
  });
});

describe("validateImportedData — reference integrity", () => {
  it("rejects a project that references a missing decision", () => {
    const data = makeValidExport();
    const result = validateImportedData({
      ...data,
      projects: { p1: { ...data.projects.p1, decisionIds: ["d1", "d-missing"] } },
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a decision that references a missing project", () => {
    const data = makeValidExport();
    const result = validateImportedData({
      ...data,
      decisions: { d1: { ...data.decisions.d1, projectId: "p-missing" } },
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a decision that references a missing option", () => {
    const data = makeValidExport();
    const result = validateImportedData({
      ...data,
      decisions: { d1: { ...data.decisions.d1, optionIds: ["o1", "o-missing"] } },
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a decision whose selectedOptionId does not exist", () => {
    const data = makeValidExport();
    const result = validateImportedData({
      ...data,
      decisions: { d1: { ...data.decisions.d1, selectedOptionId: "o-missing" } },
    });
    expect(result.ok).toBe(false);
  });

  it("rejects an option that references a missing decision", () => {
    const data = makeValidExport();
    const result = validateImportedData({
      ...data,
      options: { o1: { ...data.options.o1, decisionId: "d-missing" } },
    });
    expect(result.ok).toBe(false);
  });
});

describe("exportData / importDataReplace round trip", () => {
  beforeEach(() => {
    localStorage.clear();
    store().resetAllData();
  });

  it("exported data validates successfully", () => {
    const pId = store().createProject({ name: "P", description: "desc" });
    const dId = store().createDecision(pId, { title: "D" });
    store().addOption(dId, {
      name: "O",
      imageDataUrl: "data:image/png;base64,abc",
      imageMimeType: "image/png",
    });
    const exported = store().exportData();
    expect(validateImportedData(exported)).toMatchObject({ ok: true });
  });

  it("importDataReplace restores projects, decisions, and options", () => {
    const data = makeValidExport();
    store().importDataReplace(data);
    expect(store().projects.p1.name).toBe("Project");
    expect(store().decisions.d1.title).toBe("Decision");
    expect(store().options.o1.name).toBe("Option");
  });

  it("import clears currentDecisionId and currentOptionId", () => {
    const pId = store().createProject({ name: "P" });
    const dId = store().createDecision(pId, { title: "D" });
    const oId = store().addOption(dId, {
      name: "O",
      imageDataUrl: "data:image/png;base64,a",
      imageMimeType: "image/png",
    });
    store().setCurrentDecision(dId);
    expect(store().currentOptionId).toBe(oId);

    store().importDataReplace(makeValidExport());
    expect(store().currentDecisionId).toBeNull();
    expect(store().currentOptionId).toBeNull();
  });

  it("full round trip preserves all project fields", () => {
    const pId = store().createProject({ name: "Round Trip", description: "A project" });
    const dId = store().createDecision(pId, { title: "My Decision" });
    store().updateDecision(dId, { notes: "Some notes", finalRationale: "Good rationale" });
    const oId = store().addOption(dId, {
      name: "Option A",
      imageDataUrl: "data:image/png;base64,xyz",
      imageMimeType: "image/png",
    });
    store().markOptionFinal(oId);

    const exported = store().exportData();
    store().resetAllData();
    store().importDataReplace(exported);

    expect(store().projects[pId].name).toBe("Round Trip");
    expect(store().decisions[dId].notes).toBe("Some notes");
    expect(store().decisions[dId].status).toBe("finalized");
    expect(store().options[oId].status).toBe("final");
  });
});
