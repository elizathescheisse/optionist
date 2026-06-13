import type { ID } from "../types/domain";
import { useAppStore } from "../store/useAppStore";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect fill="#EEF1FF" width="400" height="300"/>
      <rect fill="#4D61A3" opacity="0.15" x="40" y="40" width="320" height="24" rx="4"/>
      <rect fill="#4D61A3" opacity="0.1" x="40" y="80" width="200" height="16" rx="4"/>
      <rect fill="#EBA03F" opacity="0.2" x="40" y="120" width="320" height="120" rx="8"/>
    </svg>`,
  );

const DEMO_COMPARISONS = [
  {
    title: "Dashboard Direction Comparison",
    description: "Comparing layout approaches for the executive dashboard.",
    options: [
      { name: "Option A — Card Grid", notes: "Dense information, familiar pattern" },
      { name: "Option B — List + Detail", notes: "More scannable for executives" },
      { name: "Option C — Single Canvas", notes: "Bold, presentation-first" },
    ],
  },
  {
    title: "Onboarding Flow Options",
    description: "Which onboarding path best reduces time-to-value?",
    options: [
      { name: "Guided wizard", notes: "Step-by-step, higher completion" },
      { name: "Quick start", notes: "Minimal friction, faster entry" },
    ],
  },
  {
    title: "Pricing Page Layouts",
    description: "Presenting tier options to enterprise buyers.",
    options: [
      { name: "Three-column tiers", notes: "Standard SaaS pattern" },
      { name: "Comparison table", notes: "Better for feature-heavy plans" },
      { name: "Contact-first", notes: "Enterprise-focused, no public pricing" },
    ],
  },
];

export function seedDemoComparisons(projectId: ID): void {
  const store = useAppStore.getState();

  for (const demo of DEMO_COMPARISONS) {
    const decisionId = store.createDecision(projectId, {
      title: demo.title,
      description: demo.description,
    });

    for (const opt of demo.options) {
      store.addOption(decisionId, {
        name: opt.name,
        imageDataUrl: PLACEHOLDER_IMAGE,
        imageMimeType: "image/png",
      });
      const latestOptions = useAppStore.getState().decisions[decisionId]?.optionIds ?? [];
      const lastOptionId = latestOptions[latestOptions.length - 1];
      if (lastOptionId) {
        store.updateOption(lastOptionId, { notes: opt.notes });
      }
    }
  }
}
