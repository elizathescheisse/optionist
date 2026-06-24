import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FinalizeDecisionModal from "../components/decisions/FinalizeDecisionModal";
import { useAppStore } from "../store/useAppStore";

function store() {
  return useAppStore.getState();
}

async function setup() {
  localStorage.clear();
  store().resetAllData();
  const projectId = store().createProject({ name: "P" });
  const decisionId = store().createDecision(projectId, { title: "D" });
  const optionId = await store().addOption(decisionId, {
    name: "O",
    imageDataUrl: "data:image/png;base64,a",
    imageMimeType: "image/png",
  });
  return { decisionId, optionId };
}

describe("FinalizeDecisionModal — missing rationale warning", () => {
  let decisionId: string;
  let optionId: string;

  beforeEach(async () => {
    ({ decisionId, optionId } = await setup());
  });

  it("shows a warning when the rationale field is empty", () => {
    render(
      <FinalizeDecisionModal decisionId={decisionId} optionId={optionId} onClose={() => {}} />
    );
    expect(screen.getByText(/will be finalized without a rationale/i)).toBeInTheDocument();
  });

  it("hides the warning once a rationale is typed", () => {
    render(
      <FinalizeDecisionModal decisionId={decisionId} optionId={optionId} onClose={() => {}} />
    );
    const rationale = screen.getByPlaceholderText(/add your rationale/i);
    fireEvent.change(rationale, { target: { value: "Best contrast" } });
    expect(screen.queryByText(/will be finalized without a rationale/i)).not.toBeInTheDocument();
  });

  it("persists the rationale when finalizing", () => {
    render(
      <FinalizeDecisionModal decisionId={decisionId} optionId={optionId} onClose={() => {}} />
    );
    const rationale = screen.getByPlaceholderText(/add your rationale/i);
    fireEvent.change(rationale, { target: { value: "Chosen for clarity" } });
    fireEvent.click(screen.getByRole("button", { name: "Finalize decision" }));
    expect(store().decisions[decisionId].finalRationale).toBe("Chosen for clarity");
  });
});
