import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DecisionNotesPanel from "../components/decisions/DecisionNotesPanel";
import { useAppStore } from "../store/useAppStore";

function store() {
  return useAppStore.getState();
}

function setup() {
  localStorage.clear();
  store().resetAllData();
  const projectId = store().createProject({ name: "P" });
  const decisionId = store().createDecision(projectId, { title: "D" });
  return { projectId, decisionId };
}

describe("DecisionNotesPanel — persistence", () => {
  let decisionId: string;

  beforeEach(() => {
    ({ decisionId } = setup());
  });

  it("persists notes on blur", () => {
    render(<DecisionNotesPanel decisionId={decisionId} />);
    const notes = screen.getByPlaceholderText("Working notes for this decision…");
    fireEvent.change(notes, { target: { value: "Consider accessibility" } });
    fireEvent.blur(notes);
    expect(store().decisions[decisionId].notes).toBe("Consider accessibility");
  });

  it("persists final rationale on blur", () => {
    render(<DecisionNotesPanel decisionId={decisionId} />);
    const rationale = screen.getByPlaceholderText("Why was the final option chosen?");
    fireEvent.change(rationale, { target: { value: "Best contrast" } });
    fireEvent.blur(rationale);
    expect(store().decisions[decisionId].finalRationale).toBe("Best contrast");
  });

  it("does not persist an empty title; reverts to stored value", () => {
    render(<DecisionNotesPanel decisionId={decisionId} />);
    const title = screen.getByDisplayValue("D");
    fireEvent.change(title, { target: { value: "   " } });
    fireEvent.blur(title);
    expect(store().decisions[decisionId].title).toBe("D");
  });

  it("preserves line breaks in notes (stored verbatim)", () => {
    render(<DecisionNotesPanel decisionId={decisionId} />);
    const notes = screen.getByPlaceholderText("Working notes for this decision…");
    fireEvent.change(notes, { target: { value: "line one\nline two" } });
    fireEvent.blur(notes);
    expect(store().decisions[decisionId].notes).toBe("line one\nline two");
  });
});

describe("DecisionNotesPanel — incomplete finalized warning", () => {
  it("shows a warning when finalized with empty rationale", () => {
    const { decisionId } = setup();
    const optionId = store().addOption(decisionId, {
      name: "O",
      imageDataUrl: "data:image/png;base64,a",
      imageMimeType: "image/png",
    });
    store().markOptionFinal(optionId);
    render(<DecisionNotesPanel decisionId={decisionId} />);
    expect(screen.getByText(/finalized but has no rationale/i)).toBeInTheDocument();
  });

  it("hides the warning once rationale is present", () => {
    const { decisionId } = setup();
    const optionId = store().addOption(decisionId, {
      name: "O",
      imageDataUrl: "data:image/png;base64,a",
      imageMimeType: "image/png",
    });
    store().markOptionFinal(optionId);
    store().updateDecision(decisionId, { finalRationale: "Chosen for clarity" });
    render(<DecisionNotesPanel decisionId={decisionId} />);
    expect(screen.queryByText(/finalized but has no rationale/i)).not.toBeInTheDocument();
  });

  it("shows no warning for an active decision", () => {
    const { decisionId } = setup();
    render(<DecisionNotesPanel decisionId={decisionId} />);
    expect(screen.queryByText(/finalized but has no rationale/i)).not.toBeInTheDocument();
  });
});

describe("DecisionNotesPanel — safe text rendering", () => {
  it("renders a script-like option name as text, not HTML", () => {
    const { decisionId } = setup();
    const optionId = store().addOption(decisionId, {
      name: "<script>alert('x')</script>",
      imageDataUrl: "data:image/png;base64,a",
      imageMimeType: "image/png",
    });
    store().markOptionFinal(optionId);
    const { container } = render(<DecisionNotesPanel decisionId={decisionId} />);
    // No real <script> element should be injected into the DOM.
    expect(container.querySelector("script")).toBeNull();
    // The raw text is present as a text node instead.
    expect(screen.getByText("<script>alert('x')</script>")).toBeInTheDocument();
  });

  it("keeps script-like notes as a plain string value", () => {
    const { decisionId } = setup();
    render(<DecisionNotesPanel decisionId={decisionId} />);
    const notes = screen.getByPlaceholderText("Working notes for this decision…");
    fireEvent.change(notes, { target: { value: "<img src=x onerror=alert(1)>" } });
    fireEvent.blur(notes);
    expect(store().decisions[decisionId].notes).toBe("<img src=x onerror=alert(1)>");
  });
});
