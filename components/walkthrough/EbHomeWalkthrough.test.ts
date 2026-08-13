import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  EB_HOME_POST_UPI_STEP_INDEX,
  getEbHomeSteps,
} from "@/features/walkthrough/steps";

const hostWalkthrough = readFileSync(
  join(process.cwd(), "components/walkthrough/EbHomeWalkthrough.tsx"),
  "utf8",
);
const sourceApp = readFileSync(
  join(process.cwd(), "public/employee-benefits/app.js"),
  "utf8",
);

describe("EB+ post-UPI walkthrough handoff", () => {
  it("sends an explicit completion message from the embedded setup flow", () => {
    expect(sourceApp).toContain(
      'const UPI_CREATED_MESSAGE = "employee-benefits:upi-created"',
    );
    expect(sourceApp).toMatch(
      /function completeUpiSetupFlow\(\)[\s\S]*window\.parent\.postMessage\([\s\S]*UPI_CREATED_MESSAGE/,
    );
  });

  it("queues Scan & Pay as the first coachmark shown on return home", () => {
    expect(getEbHomeSteps(true)[EB_HOME_POST_UPI_STEP_INDEX].key).toBe(
      "upi-scan",
    );
    expect(hostWalkthrough).toContain(
      "queueResumeAtRef.current(EB_HOME_POST_UPI_STEP_INDEX)",
    );
    expect(hostWalkthrough).toContain(
      "window.dispatchEvent(new Event(UPI_CREATED_EVENT))",
    );
  });
});
