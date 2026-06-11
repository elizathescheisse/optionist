import type { ID, ISODateString, Project, Decision, DesignOption } from "./domain";

export type ExportedAppData = {
  appName: "design-decision-tool";
  dataVersion: 1;
  exportedAt: ISODateString;
  projects: Record<ID, Project>;
  decisions: Record<ID, Decision>;
  options: Record<ID, DesignOption>;
};
