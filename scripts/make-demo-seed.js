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
const decisionId = randomUUID();
const ts = now();

// Build options from images
const optionIds = [];
const options = {};
for (const file of imageFiles) {
  const ext = extname(file).toLowerCase();
  const mime = MIME[ext];
  const raw = readFileSync(join(DEMODATA_DIR, file));
  const b64 = raw.toString("base64");
  const dataUrl = `data:${mime};base64,${b64}`;
  const id = randomUUID();
  optionIds.push(id);
  options[id] = {
    id,
    decisionId,
    name: basename(file, ext),
    imageDataUrl: dataUrl,
    imageMimeType: mime,
    status: "active",
    notes: "",
    createdAt: ts,
    updatedAt: ts,
  };
}

const decision = {
  id: decisionId,
  projectId,
  title: "font",
  description: "",
  status: "active",
  optionIds,
  selectedOptionId: null,
  notes: "",
  finalRationale: "",
  decidedAt: null,
  archivedAt: null,
  createdAt: ts,
  updatedAt: ts,
};

const project = {
  id: projectId,
  name: "demo",
  description: "Demo project for screenshots",
  decisionIds: [decisionId],
  createdAt: ts,
  updatedAt: ts,
};

const seed = {
  appName: "design-decision-tool",
  dataVersion: 1,
  exportedAt: ts,
  projects: { [projectId]: project },
  decisions: { [decisionId]: decision },
  options,
};

writeFileSync(OUT_PATH, JSON.stringify(seed, null, 2));
console.log(`Wrote seed.json with ${imageFiles.length} options from demodata/`);
console.log("  Project: demo");
console.log("  Decision: font");
console.log(`  Options: ${imageFiles.join(", ")}`);
