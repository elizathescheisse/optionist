import type { ExportedAppData } from "../../types/importExport";
import { now } from "../../utils/dates";
import { loadGuestAppState } from "./appState";

export function buildGuestExportData(): ExportedAppData {
  const state = loadGuestAppState();
  return {
    appName: "design-decision-tool",
    dataVersion: 1,
    exportedAt: now(),
    projects: state.projects,
    decisions: state.decisions,
    options: state.options,
  };
}

export function downloadGuestExportJson(): void {
  const data = buildGuestExportData();
  const json = JSON.stringify(
    { ...data, exportSource: "guest", exportVersion: 1 },
    null,
    2,
  );
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `optionist-guest-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type GuestWorkSummary = {
  projectCount: number;
  decisionCount: number;
  optionCount: number;
  projects: { id: string; name: string; decisionCount: number }[];
};

export function summarizeGuestWork(): GuestWorkSummary {
  const state = loadGuestAppState();
  const projects = Object.values(state.projects).map((p) => ({
    id: p.id,
    name: p.name,
    decisionCount: p.decisionIds.length,
  }));
  return {
    projectCount: projects.length,
    decisionCount: Object.keys(state.decisions).length,
    optionCount: Object.keys(state.options).length,
    projects,
  };
}
