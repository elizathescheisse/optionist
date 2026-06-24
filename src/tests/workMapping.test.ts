import { describe, it, expect } from "vitest";
import { buildWorkState } from "../types/work";
import type { ProjectRow, DecisionRow, DecisionOptionRow } from "../types/work";

// Pins the two deliberate model-translation decisions when DB rows become the
// app's domain shape:
//   1. A "final" option is derived from decisions.final_option_id (there is no
//      "final" option status column in the DB).
//   2. The DB only emits active/finalized/postponed — "archived" never appears.
// If a later change flattens either rule, these go red.

const project: ProjectRow = {
  id: "p1",
  organization_id: "org1",
  name: "Demo project",
  description: null,
  visibility: "organization",
  created_by: "u1",
  deleted_at: null,
  created_at: "2026-06-23T00:00:00Z",
  updated_at: "2026-06-23T00:00:00Z",
};

function decision(over: Partial<DecisionRow>): DecisionRow {
  return {
    id: "d1",
    project_id: "p1",
    title: "A decision",
    description: null,
    working_notes: null,
    status: "active",
    final_option_id: null,
    final_rationale: null,
    finalized_at: null,
    finalized_by: null,
    created_by: "u1",
    deleted_at: null,
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z",
    ...over,
  };
}

function option(over: Partial<DecisionOptionRow>): DecisionOptionRow {
  return {
    id: "o1",
    decision_id: "d1",
    label: "Option",
    storage_path: "path/o1.png",
    original_filename: null,
    mime_type: "image/png",
    file_size_bytes: null,
    sort_order: 0,
    status: "active",
    rejection_reason: null,
    rejected_at: null,
    rejected_by: null,
    created_by: "u1",
    deleted_at: null,
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z",
    ...over,
  };
}

describe("buildWorkState", () => {
  it("derives a finalized decision's chosen option from final_option_id", () => {
    const d = decision({
      id: "d1",
      status: "finalized",
      final_option_id: "o2",
      final_rationale: "B was clearer.",
      finalized_at: "2026-06-23T01:00:00Z",
    });
    const o1 = option({ id: "o1", sort_order: 0 });
    const o2 = option({ id: "o2", sort_order: 1 });

    const { decisions, options } = buildWorkState([project], [d], [o1, o2], {
      o1: "https://signed/o1",
      o2: "https://signed/o2",
    });

    // Decision carries the selection + rationale + decided timestamp.
    expect(decisions.d1.status).toBe("finalized");
    expect(decisions.d1.selectedOptionId).toBe("o2");
    expect(decisions.d1.finalRationale).toBe("B was clearer.");
    expect(decisions.d1.decidedAt).toBe("2026-06-23T01:00:00Z");

    // The pointed-at option becomes "final"; the other stays "active".
    expect(options.o2.status).toBe("final");
    expect(options.o1.status).toBe("active");
    // Signed URL flows into the existing imageDataUrl field.
    expect(options.o2.imageDataUrl).toBe("https://signed/o2");
  });

  it("orders options by sort_order and keeps rejected ones rejected", () => {
    const d = decision({ id: "d1" });
    const second = option({ id: "o2", sort_order: 0 });
    const first = option({ id: "o1", sort_order: 1, status: "rejected" });

    const { decisions, options } = buildWorkState([project], [d], [first, second], {});

    expect(decisions.d1.optionIds).toEqual(["o2", "o1"]);
    expect(options.o1.status).toBe("rejected");
  });

  it("never produces an archived status (DB has only active/finalized/postponed)", () => {
    const rows = [
      decision({ id: "d1", status: "active" }),
      decision({ id: "d2", status: "postponed" }),
      decision({ id: "d3", status: "finalized" }),
    ];
    const { decisions } = buildWorkState([project], rows, [], {});
    const statuses = Object.values(decisions).map((d) => d.status);
    expect(statuses).not.toContain("archived");
    expect(new Set(statuses)).toEqual(new Set(["active", "postponed", "finalized"]));
  });
});
