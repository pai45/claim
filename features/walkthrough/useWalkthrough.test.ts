import { describe, expect, it } from "vitest";
import { canStartWalkthrough } from "./useWalkthrough";

const readyGate = {
  enabled: true,
  ready: true,
  stepCount: 5,
};

describe("canStartWalkthrough", () => {
  it("starts an unseen or session-paused walkthrough on a fresh mount", () => {
    expect(
      canStartWalkthrough({
        ...readyGate,
        phase: "idle",
        resumeArmed: false,
      }),
    ).toBe(true);
  });

  it("keeps a tapped walkthrough paused until its surface went away", () => {
    expect(
      canStartWalkthrough({
        ...readyGate,
        phase: "paused",
        resumeArmed: false,
      }),
    ).toBe(false);
    expect(
      canStartWalkthrough({
        ...readyGate,
        phase: "paused",
        resumeArmed: true,
      }),
    ).toBe(true);
  });

  it("does not start while disabled, unsettled, running, or complete", () => {
    expect(
      canStartWalkthrough({
        ...readyGate,
        enabled: false,
        phase: "paused",
        resumeArmed: true,
      }),
    ).toBe(false);
    expect(
      canStartWalkthrough({
        ...readyGate,
        phase: "running",
        resumeArmed: true,
      }),
    ).toBe(false);
    expect(
      canStartWalkthrough({
        ...readyGate,
        phase: "done",
        resumeArmed: true,
      }),
    ).toBe(false);
  });
});
