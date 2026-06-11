export type ID = string;
export type ISODateString = string;
export type AppDataVersion = 1;

export type Project = {
  id: ID;
  name: string;
  description: string;
  decisionIds: ID[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type DecisionStatus = "active" | "finalized" | "archived" | "postponed";

export type Decision = {
  id: ID;
  projectId: ID;
  title: string;
  description: string;
  status: DecisionStatus;
  optionIds: ID[];
  selectedOptionId: ID | null;
  notes: string;
  finalRationale: string;
  decidedAt: ISODateString | null;
  archivedAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type OptionStatus = "active" | "rejected" | "final";

export type DesignOption = {
  id: ID;
  decisionId: ID;
  name: string;
  imageDataUrl: string;
  imageMimeType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
  status: OptionStatus;
  notes: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type ReviewViewMode = "fit-width" | "full-image";

export type AppState = {
  projects: Record<ID, Project>;
  decisions: Record<ID, Decision>;
  options: Record<ID, DesignOption>;
  currentProjectId: ID | null;
  currentDecisionId: ID | null;
  currentOptionId: ID | null;
  reviewViewMode: ReviewViewMode;
  dataVersion: AppDataVersion;
};
