import { expect, test } from "vitest";

import { fillTemplate } from "../src/lib/template-utils";
import type { Partner } from "../src/lib/types";

const partner: Partner = {
  id: "P088",
  name: "Smash Bird Breda",
  contact: "Lotte",
  city: "Breda",
  country: "NL",
  phone: "+31 6 1111 2222",
  email: "lotte@smashbird.partner",
  concepts: ["smash"],
  general: {},
  steps: { smash: {} },
  custom: {},
  fee: 10,
  platforms: {},
  billing: {},
  events: [],
  createdAt: "2026-06-29T00:00:00.000Z",
};

test("message templates fill partner, country, and concept variables", () => {
  const result = fillTemplate("Hoi {contactpersoon}, {naam} in {stad} draait {concepten}.", partner, {
    countryName: "Nederland",
    conceptNames: ["Smash Bird"],
  });

  expect(result).toBe("Hoi Lotte, Smash Bird Breda in Breda draait Smash Bird.");
});
