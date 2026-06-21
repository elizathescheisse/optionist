import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreateProjectForm from "../components/projects/CreateProjectForm";
import { useAppStore } from "../store/useAppStore";

// Guards the form's validation: a blank/whitespace name must be rejected with
// an error and must not create a project.

function store() {
  return useAppStore.getState();
}

function renderForm() {
  return render(
    <MemoryRouter>
      <CreateProjectForm />
    </MemoryRouter>,
  );
}

describe("CreateProjectForm validation", () => {
  beforeEach(() => {
    localStorage.clear();
    store().resetAllData();
  });

  it("rejects an empty name and creates nothing", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /project/i }));

    expect(screen.getByText("Project name is required.")).toBeInTheDocument();
    expect(Object.keys(store().projects)).toHaveLength(0);
  });

  it("creates a project when a name is given", () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Project name"), {
      target: { value: "Checkout redesign" },
    });
    fireEvent.click(screen.getByRole("button", { name: /project/i }));

    const names = Object.values(store().projects).map((p) => p.name);
    expect(names).toContain("Checkout redesign");
  });
});
