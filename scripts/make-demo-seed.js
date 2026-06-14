#!/usr/bin/env node
/**
 * Generates public/seed.json from the images in demodata/.
 * Run with: node scripts/make-demo-seed.js
 *
 * The output is a valid Optionist export file. Drop it in public/seed.json
 * and the app will load it on first launch (empty localStorage).
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, extname, basename } from "path";
import { randomUUID } from "crypto";

const ROOT = new URL("..", import.meta.url).pathname;
const DEMODATA_DIR = join(ROOT, "demodata");
const OUT_PATH = join(ROOT, "public", "seed.json");

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const now = () => new Date().toISOString();

// Read all images from demodata/
const imageFiles = readdirSync(DEMODATA_DIR)
  .filter((f) => MIME[extname(f).toLowerCase()])
  .sort();

if (imageFiles.length === 0) {
  console.error("No images found in demodata/");
  process.exit(1);
}

// IDs
const projectId = randomUUID();
const fontDecisionId = randomUUID();
const logoDecisionId = randomUUID();
const heroDecisionId = randomUUID();
const ts = now();

const options = {};

// Helper: turn a demodata file into an option object for a given decision.
function makeOption(file, decisionId) {
  const ext = extname(file).toLowerCase();
  const mime = MIME[ext];
  const raw = readFileSync(join(DEMODATA_DIR, file));
  const b64 = raw.toString("base64");
  const id = randomUUID();
  options[id] = {
    id,
    decisionId,
    name: basename(file, ext),
    imageDataUrl: `data:${mime};base64,${b64}`,
    imageMimeType: mime,
    status: "active",
    notes: "",
    createdAt: ts,
    updatedAt: ts,
  };
  return id;
}

// "font" — the active, selected decision; all demo images are its options.
const fontOptionIds = imageFiles.map((file) => makeOption(file, fontDecisionId));

const fontDecision = {
  id: fontDecisionId,
  projectId,
  title: "font",
  description: "",
  status: "active",
  optionIds: fontOptionIds,
  selectedOptionId: null,
  notes: "",
  finalRationale: "",
  decidedAt: null,
  archivedAt: null,
  createdAt: ts,
  updatedAt: ts,
};

// "Logo color" — a second active decision that hasn't been worked on yet.
// Shows as an unselected card with no options, so screenshots capture the
// resting (not-current) card state.
const logoDecision = {
  id: logoDecisionId,
  projectId,
  title: "Logo color",
  description: "",
  status: "active",
  optionIds: [],
  selectedOptionId: null,
  notes: "",
  finalRationale: "",
  decidedAt: null,
  archivedAt: null,
  createdAt: ts,
  updatedAt: ts,
};

// "Hero layout" — a finalized decision. Reuses the first demo image as its
// chosen option so the card shows the ✓ plus the chosen option's name.
const heroOptionId = makeOption(imageFiles[0], heroDecisionId);

const heroDecision = {
  id: heroDecisionId,
  projectId,
  title: "Hero layout",
  description: "",
  status: "finalized",
  optionIds: [heroOptionId],
  selectedOptionId: heroOptionId,
  notes: "",
  finalRationale: "",
  decidedAt: ts,
  archivedAt: null,
  createdAt: ts,
  updatedAt: ts,
};

const project = {
  id: projectId,
  name: "demo",
  description: "Demo project for screenshots",
  decisionIds: [fontDecisionId, logoDecisionId, heroDecisionId],
  createdAt: ts,
  updatedAt: ts,
};

const seed = {
  appName: "design-decision-tool",
  dataVersion: 1,
  exportedAt: ts,
  projects: { [projectId]: project },
  decisions: {
    [fontDecisionId]: fontDecision,
    [logoDecisionId]: logoDecision,
    [heroDecisionId]: heroDecision,
  },
  options,
};

writeFileSync(OUT_PATH, JSON.stringify(seed, null, 2));
console.log(`Wrote seed.json with ${Object.keys(options).length} options from demodata/`);
console.log("  Project: demo");
console.log("  Decisions: font (active), Logo color (active), Hero layout (finalized)");
console.log(`  Font options: ${imageFiles.join(", ")}`);
