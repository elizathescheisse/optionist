#!/usr/bin/env node
/**
 * Takes a screenshot of the app with demo data loaded and saves it to
 * screenshots/YYYY-MM-DD-pr<N>.jpg
 *
 * Usage:
 *   node scripts/screenshot-demo.js <pr-number>
 *
 * Requires:
 *   - Dev server running on http://localhost:5173
 *   - public/seed.json already written (run scripts/make-demo-seed.js first)
 */

import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(fileURLToPath(import.meta.url), "../..");
const SCREENSHOTS_DIR = join(ROOT, "screenshots");

const prNumber = process.argv[2];
if (!prNumber) {
  console.error("Usage: node scripts/screenshot-demo.js <pr-number>");
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const filename = `${date}-pr${prNumber}.jpg`;
const outPath = join(SCREENSHOTS_DIR, filename);

mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

// Clear localStorage and load the app — seed.json will auto-load
await page.goto("http://localhost:5173");
await page.evaluate(() => {
  localStorage.clear();
  // The app now gates on auth; seed a demo session so the screenshot reaches
  // the workspace instead of the login screen. Auth lives in its own key, so
  // this does not affect the seed-data load (which keys off the store key).
  localStorage.setItem(
    "optionist.auth",
    JSON.stringify({ email: "test@test.com", name: "Demo User" }),
  );
});
await page.reload({ waitUntil: "networkidle" });

// Wait for the demo project card to appear
await page.waitForSelector("text=demo", { timeout: 10000 });

// Click the project card to open the workspace
await page.click("text=demo");
await page.waitForTimeout(300);

// Click the first decision to select it and show the options
const decisionItem = page.locator('[class*="rounded-lg cursor-pointer"]').first();
await decisionItem.click();
await page.waitForTimeout(500);

// Take the screenshot
const buffer = await page.screenshot({ type: "jpeg", quality: 90 });
writeFileSync(outPath, buffer);

await browser.close();

console.log(`Saved: screenshots/${filename}`);
