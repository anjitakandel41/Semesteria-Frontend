import { describe, it, expect } from "vitest";
import {
  VALID_STAGE_TRANSITIONS,
  TERMINAL_STAGES,
  WITHDRAWABLE_STAGES,
  ApplicationStage,
} from "@/types";

describe("Recruitment Assessment Business Rules", () => {
  it("enforces allowed transitions from APPLIED", () => {
    const transitions = VALID_STAGE_TRANSITIONS.APPLIED;
    expect(transitions).toContain("SHORTLISTED");
    expect(transitions).toContain("REJECTED");
    expect(transitions).toContain("WITHDRAWN");
    expect(transitions).not.toContain("HIRED");
  });

  it("enforces allowed transitions from SHORTLISTED", () => {
    const transitions = VALID_STAGE_TRANSITIONS.SHORTLISTED;
    expect(transitions).toContain("INTERVIEWED");
    expect(transitions).toContain("REJECTED");
    expect(transitions).toContain("WITHDRAWN");
    expect(transitions).not.toContain("HIRED");
  });

  it("enforces allowed transitions from INTERVIEWED", () => {
    const transitions = VALID_STAGE_TRANSITIONS.INTERVIEWED;
    expect(transitions).toContain("HIRED");
    expect(transitions).toContain("REJECTED");
    expect(transitions).toContain("WITHDRAWN");
  });

  it("enforces that terminal stages have no outgoing transitions", () => {
    for (const stage of TERMINAL_STAGES) {
      expect(VALID_STAGE_TRANSITIONS[stage]).toEqual([]);
    }
  });

  it("enforces correct withdrawable stage rules for candidates", () => {
    expect(WITHDRAWABLE_STAGES).toContain("APPLIED");
    expect(WITHDRAWABLE_STAGES).toContain("SHORTLISTED");
    expect(WITHDRAWABLE_STAGES).toContain("INTERVIEWED");

    expect(WITHDRAWABLE_STAGES).not.toContain("HIRED");
    expect(WITHDRAWABLE_STAGES).not.toContain("REJECTED");
    expect(WITHDRAWABLE_STAGES).not.toContain("WITHDRAWN");
  });

  it("validates transition checker logic", () => {
    function isTransitionValid(
      current: ApplicationStage,
      target: ApplicationStage
    ): boolean {
      if (TERMINAL_STAGES.includes(current)) return false;
      if (current === target) return false;
      const allowed = VALID_STAGE_TRANSITIONS[current] || [];
      return allowed.includes(target);
    }

    expect(isTransitionValid("APPLIED", "SHORTLISTED")).toBe(true);
    expect(isTransitionValid("APPLIED", "HIRED")).toBe(false);
    expect(isTransitionValid("REJECTED", "INTERVIEWED")).toBe(false);
    expect(isTransitionValid("HIRED", "WITHDRAWN")).toBe(false);
  });
});
