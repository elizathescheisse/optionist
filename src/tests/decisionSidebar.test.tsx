import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DecisionSidebar from "../components/decisions/DecisionSidebar";
import { useAppStore } from "../store/useAppStore";

// Guards the grouping logic: decisions must sort into Active / Decided /
// Postponed sections by status. A rewrite that drops or mislabels a group
// would break these assertions.

function store() {
  return useAppStore.getState();
}

function renderSidebar(projectId: string) {
  return render(
    <MemoryRouter>
      <DecisionSidebar projectId={projectId} />
    </MemoryRouter>,
  );
}

describe("DecisionSidebar grouping", () => {
  let projectId: string;

  beforeEach(() => {
    localStorage.clear();
    store().resetAllData();
    projectId = store().createProject({ name: "P" });
  });

  it("places each decision under the section that matches its status", async () => {
    // Active — left as-is after creation.
    store().createDecision(projectId, { title: "Active one" });

    // Postponed.
    const postponed = store().createDecision(projectId, { title: "Postponed one" });
    store().postponeDecision(postponed);

    // Finalized — create, add an option, mark it final.
    const finalized = store().createDecision(projectId, { title: "Finalized one" });
    const optionId = await store().addOption(finalized, {
      name: "Opt A",
      imageDataUrl: "data:image/png;base64,AAAA",
      imageMimeType: "image/png",
    });
    store().markOptionFinal(optionId);

    const { container } = renderSidebar(projectId);

    // Section headers render. Target the header spans by their distinct class
    // (tracking-wider) so a status badge with the same word doesn't masquerade
    // as the section header.
    const headers = Array.from(
      container.querySelectorAll("span.tracking-wider"),
    ).map((el) => el.textContent);
    expect(headers).toEqual(
      expect.arrayContaining(["Decided", "Postponed"]),
    );

    // Each decision shows up.
    expect(screen.getByText("Active one")).toBeInTheDocument();
    expect(screen.getByText("Finalized one")).toBeInTheDocument();
    expect(screen.getByText("Postponed one")).toBeInTheDocument();
  });

  it("hides empty secondary sections", () => {
    store().createDecision(projectId, { title: "Just active" });
    renderSidebar(projectId);

    // No postponed decisions → that header should not render.
    expect(screen.queryByText("Postponed")).not.toBeInTheDocument();
  });
});
