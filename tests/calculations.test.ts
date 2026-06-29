import { describe, expect, test } from "vitest";

import {
  billingRows,
  liveButNotInBilling,
  phaseOf,
  progressOf,
  requiredProgressOf,
  syncConceptLiveState,
  verificationMissing,
} from "../src/lib/calculations";
import { canEditAdmin, canSeeBillingAlerts } from "../src/lib/permissions";
import type { CrmConfig, Partner, User } from "../src/lib/types";

const config: CrmConfig = {
  countries: [
    { code: "NL", name: "Nederland", flag: "🇳🇱" },
    { code: "BE", name: "België", flag: "🇧🇪" },
  ],
  concepts: [
    { id: "chick", name: "Chick'n Box", color: "#E0962B" },
    { id: "smash", name: "Smash Bird", color: "#D63E3E" },
  ],
  steps: [
    { id: "contract", name: "Contract getekend", general: true },
    { id: "docs", name: "Alle documenten ontvangen", general: true },
    { id: "tb", name: "Aangemeld bij Thuisbezorgd" },
    { id: "ue", name: "Aangemeld bij Uber Eats", optional: true },
    { id: "onb", name: "Onboarding partner klaar" },
    { id: "kassa", name: "Kassa gekoppeld" },
    { id: "plan", name: "Live datum gepland" },
    { id: "live", name: "Live" },
  ],
  fields: [],
  platforms: [],
  templates: {},
  relationCategories: [],
  portals: {},
};

const basePartner: Partner = {
  id: "P001",
  name: "Chick'n Box Tilburg",
  contact: "Huib",
  city: "Tilburg",
  country: "NL",
  phone: "+31 6 1234 5678",
  email: "tilburg@example.com",
  concepts: ["chick"],
  general: {
    contract: true,
    docs: true,
  },
  steps: {
    chick: {
      tb: true,
      ue: false,
      onb: true,
      kassa: true,
      plan: true,
      live: false,
    },
  },
  custom: {},
  fee: 12,
  platforms: {},
  billing: {
    chick: {
      invoiced: false,
      live: false,
      verifDone: false,
      verif: "",
    },
  },
  events: [],
  createdAt: "2026-06-29T00:00:00.000Z",
};

describe("crm calculations", () => {
  test("required progress ignores the optional uber eats step until it is ticked", () => {
    expect(requiredProgressOf(basePartner, config)).toEqual({ done: 6, total: 7 });
    expect(progressOf(basePartner, config)).toBe(6);
  });

  test("partner stays in onboarding until the live step is completed", () => {
    expect(phaseOf(basePartner, config)).toBe("prog");
  });

  test("syncing the live step updates the matching billing concept status", () => {
    const updated = syncConceptLiveState(basePartner, "chick", true);

    expect(updated.steps.chick.live).toBe(true);
    expect(updated.billing.chick.live).toBe(true);
    expect(phaseOf(updated, config)).toBe("live");
  });

  test("verification and billing alerts are tracked per partner concept", () => {
    const livePartner = syncConceptLiveState(basePartner, "chick", true);

    expect(verificationMissing(livePartner)).toEqual(["chick"]);
    expect(liveButNotInBilling(livePartner)).toEqual(["chick"]);
  });

  test("billing rows flatten one row per partner concept", () => {
    const rows = billingRows([basePartner], config);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      partnerId: "P001",
      conceptId: "chick",
      city: "Tilburg",
      countryCode: "NL",
      phase: "prog",
    });
  });
});

describe("crm permissions", () => {
  const admin: User = { id: "u1", name: "Huib", role: "Beheerder", color: "#F0531C", pw: "demo" };
  const billing: User = { id: "u2", name: "Sanne", role: "Facturatie-manager", color: "#2F6FB0", pw: "demo" };
  const sales: User = { id: "u3", name: "Kerem", role: "Sales", color: "#2E9E5B", pw: "demo" };

  test("only admin and billing manager can see billing alerts", () => {
    expect(canSeeBillingAlerts(admin)).toBe(true);
    expect(canSeeBillingAlerts(billing)).toBe(true);
    expect(canSeeBillingAlerts(sales)).toBe(false);
  });

  test("only admin can edit admin configuration", () => {
    expect(canEditAdmin(admin)).toBe(true);
    expect(canEditAdmin(billing)).toBe(false);
  });
});
