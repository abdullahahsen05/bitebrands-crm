import { describe, expect, test } from "vitest";

import { getPortalAction } from "../src/lib/portal-utils";

describe("portal utils", () => {
  test("treats empty portal urls as unavailable", () => {
    expect(getPortalAction("")).toEqual({ type: "missing" });
  });

  test("treats placeholder local demo urls as unavailable", () => {
    expect(getPortalAction("https://demo.bitebrands.local/onboarding")).toEqual({
      type: "placeholder",
    });
  });

  test("allows real http and https portal urls", () => {
    expect(getPortalAction("https://crm.bitebrands.nl/onboarding")).toEqual({
      type: "external",
      url: "https://crm.bitebrands.nl/onboarding",
    });
    expect(getPortalAction("http://localhost:4000")).toEqual({
      type: "external",
      url: "http://localhost:4000",
    });
  });
});
