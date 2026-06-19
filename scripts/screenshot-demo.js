#!/usr/bin/env node
/**
 * Takes a screenshot of the app with demo data loaded and saves it to
 * screenshots/YYYY-MM-DD-pr<N>.jpg
 *
 * Usage:
 *   node scripts/screenshot-demo.js <pr-number>
 *
 * Requires:
 *   - Dev server running on http://localhost:5176
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

// Log in via the email form so we can reach authenticated routes.
await page.goto("http://localhost:5176/login", { waitUntil: "networkidle" });
await page.click("text=Sign in with email");
await page.fill('input[type="email"]', "fake@gmail.com");
await page.fill('input[type="password"]', "fakeuser");
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard", { timeout: 15000 });

// Set sidebar expanded and reload so seed.json is picked up.
await page.evaluate(() => {
  localStorage.setItem("sidebar-collapsed", "false");
});
await page.reload({ waitUntil: "networkidle" });

// Navigate to the projects list and open the demo project.
await page.goto("http://localhost:5176/projects", { waitUntil: "networkidle" });
await page.waitForSelector("text=demo", { timeout: 10000 });
await page.click("text=demo");
await page.waitForTimeout(300);

// Click the first decision to select it and show the options.
const decisionItem = page.locator('[class*="rounded-lg cursor-pointer"]').first();
await decisionItem.click();
await page.waitForTimeout(500);

// Take the screenshot
const buffer = await page.screenshot({ type: "jpeg", quality: 90 });
writeFileSync(outPath, buffer);

await browser.close();

console.log(`Saved: screenshots/${filename}`);
