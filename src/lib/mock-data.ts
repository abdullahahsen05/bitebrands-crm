import { PALETTE } from "./constants";
import type {
  ChatMessage,
  Concept,
  Country,
  CrmConfig,
  CrmData,
  Partner,
  PartnerBillingState,
  PartnerEvent,
  PartnerPlatformState,
  Relation,
  Task,
  User,
} from "./types";

const now = new Date("2026-06-29T10:00:00.000Z").getTime();
const day = 24 * 60 * 60 * 1000;
const hour = 60 * 60 * 1000;

function iso(offsetMs: number) {
  return new Date(now - offsetMs).toISOString();
}

function event(id: string, kind: "contact" | "system", type: string, text: string, by: string, offsetMs: number): PartnerEvent {
  return {
    id,
    kind,
    type,
    text,
    by,
    at: iso(offsetMs),
  };
}

function billingState(
  live: boolean,
  invoiced: boolean,
  verifDone: boolean,
  verif = "",
): PartnerBillingState {
  return { live, invoiced, verifDone, verif };
}

function deliveryPlatform(active: boolean, login: string, partnerId: string, pass = "demo123"): PartnerPlatformState {
  return {
    active,
    login,
    partnerId,
    pass,
  };
}

function webPlatform(active: boolean, url: string): PartnerPlatformState {
  return {
    active,
    url,
  };
}

export function createDefaultConfig(): CrmConfig {
  const countries: Country[] = [
    { code: "NL", name: "Nederland", flag: "🇳🇱" },
    { code: "BE", name: "België", flag: "🇧🇪" },
    { code: "DE", name: "Duitsland", flag: "🇩🇪" },
    { code: "PL", name: "Polen", flag: "🇵🇱" },
    { code: "CZ", name: "Tsjechië", flag: "🇨🇿" },
  ];

  const concepts: Concept[] = [
    { id: "chick", name: "Chick'n Box", color: "#E0962B" },
    { id: "smash", name: "Smash Bird", color: "#D63E3E" },
    { id: "fire", name: "Fire Wing", color: "#F0531C" },
    { id: "tasty", name: "Tasty American", color: "#2F6FB0" },
  ];

  const templates = Object.fromEntries(
    countries.map((country) => [
      country.code,
      [
        {
          id: `tmpl-wa-${country.code}`,
          channel: "wa",
          title: "Welkom bij Bite Brands",
          body: "Hoi {contactpersoon}! Welkom bij Bite Brands. We brengen {naam} in {stad} live met {concepten}.",
        },
        {
          id: `tmpl-mail-${country.code}`,
          channel: "mail",
          title: "Onboarding gestart",
          subject: "Welkom bij Bite Brands - {naam}",
          body: "Beste {contactpersoon},\n\nWe starten de onboarding voor {concepten} in {stad}. Partner-ID: {partnerid}.",
        },
      ],
    ]),
  );

  return {
    countries,
    concepts,
    steps: [
      { id: "contract", name: "Contract getekend", sub: "Franchiseovereenkomst ondertekend", general: true },
      { id: "docs", name: "Alle documenten ontvangen", sub: "KvK, ID, IBAN e.d. compleet", general: true },
      { id: "tb", name: "Aangemeld bij Thuisbezorgd", sub: "Aanmelding ingediend" },
      { id: "ue", name: "Aangemeld bij Uber Eats", sub: "Indien van toepassing", optional: true },
      { id: "onb", name: "Onboarding partner klaar", sub: "Partner volledig ingericht" },
      { id: "kassa", name: "Kassa gekoppeld", sub: "Kassakoppeling actief" },
      { id: "plan", name: "Live datum gepland", sub: "Go-live datum vastgesteld" },
      { id: "live", name: "Live", sub: "Vestiging is online" },
    ],
    fields: [
      { id: "kvk", label: "KvK-nummer", type: "text" },
      { id: "iban", label: "IBAN", type: "text" },
      { id: "address", label: "Vestigingsadres", type: "text" },
    ],
    platforms: [
      { id: "thuisbezorgd", name: "Thuisbezorgd.nl", kind: "delivery" },
      { id: "ubereats", name: "Uber Eats", kind: "delivery" },
      { id: "website", name: "Eigen website", kind: "web" },
    ],
    templates,
    relationCategories: [
      "Kassaleverancier",
      "Groothandel",
      "Verpakkingen",
      "Marketingbureau",
      "Boekhouding",
      "Overig",
    ],
    portals: {
      onboarding: { url: "https://aanmelden.bitebrands.nl" },
      facturatie: { url: "https://facturatie.bitebrands.nl" },
      review: { url: "https://reviews.bitebrands.nl" },
    },
  };
}

export function createDemoUsers(): User[] {
  return [
    { id: "u1", name: "Huib", role: "Beheerder", color: PALETTE[2], pw: "demo" },
    { id: "u2", name: "Sanne", role: "Facturatie-manager", color: PALETTE[3], pw: "demo" },
    { id: "u3", name: "Kerem", role: "Sales", color: PALETTE[4], pw: "demo" },
    { id: "u4", name: "Noor", role: "Operations", color: PALETTE[6], pw: "demo" },
    { id: "u5", name: "Lotte", role: "Marketing", color: PALETTE[8], pw: "demo" },
  ];
}

export function createSamplePartners(config: CrmConfig): Partner[] {
  const steps = config.steps;

  const partner = (value: Partner): Partner => value;

  return [
    partner({
      id: "P001",
      name: "Chick'n Box Tilburg Centrum",
      contact: "Sem de Vries",
      city: "Tilburg",
      country: "NL",
      phone: "+31 6 1020 3040",
      email: "tilburg@chick.partner",
      concepts: ["chick", "smash"],
      general: { contract: true, docs: true },
      steps: {
        chick: { tb: true, ue: false, onb: true, kassa: true, plan: true, live: true },
        smash: { tb: true, ue: true, onb: true, kassa: false, plan: true, live: false },
      },
      custom: {
        kvk: "62001991",
        iban: "NL91BUNQ2030405060",
        address: "Heuvelring 12, Tilburg",
      },
      fee: 12,
      platforms: {
        thuisbezorgd: deliveryPlatform(true, "tilburg@partner", "TB10001"),
        ubereats: deliveryPlatform(true, "tilburg@ue.partner", "UE10001"),
        website: webPlatform(true, "https://tilburg.bitebrands-demo.nl"),
      },
      billing: {
        chick: billingState(true, true, true, "481920"),
        smash: billingState(false, false, false, ""),
      },
      events: [
        event("e1", "contact", "call", "Go-live voor Chick'n Box bevestigd.", "Huib", day * 3),
        event("e2", "system", "system", "Concept Smash Bird toegevoegd", "Huib", day * 8),
      ],
      createdAt: iso(day * 42),
    }),
    partner({
      id: "P002",
      name: "Smash Bird Breda",
      contact: "Lotte Vermeer",
      city: "Breda",
      country: "NL",
      phone: "+31 6 2233 4455",
      email: "breda@smash.partner",
      concepts: ["smash"],
      general: { contract: true, docs: true },
      steps: {
        smash: { tb: true, ue: false, onb: true, kassa: true, plan: true, live: true },
      },
      custom: {
        kvk: "82112218",
        iban: "NL12BUNQ9988776655",
        address: "Grote Markt 4, Breda",
      },
      fee: 10,
      platforms: {
        thuisbezorgd: deliveryPlatform(true, "smash.breda@partner", "TB11022"),
        ubereats: deliveryPlatform(false, "", ""),
        website: webPlatform(false, ""),
      },
      billing: {
        smash: billingState(true, false, false, ""),
      },
      events: [
        event("e3", "contact", "mail", "Documenten per mail ontvangen.", "Kerem", day * 2),
      ],
      createdAt: iso(day * 35),
    }),
    partner({
      id: "P003",
      name: "Fire Wing Antwerpen",
      contact: "Ana Peeters",
      city: "Antwerpen",
      country: "BE",
      phone: "+32 3 223 8899",
      email: "antwerpen@fire.partner",
      concepts: ["fire"],
      general: { contract: true, docs: false },
      steps: {
        fire: { tb: true, ue: false, onb: false, kassa: false, plan: false, live: false },
      },
      custom: {
        kvk: "BE0102030405",
        iban: "BE88000012345678",
        address: "Meir 22, Antwerpen",
      },
      fee: 15,
      platforms: {
        thuisbezorgd: deliveryPlatform(true, "antwerpen@partner", "TB22001"),
        ubereats: deliveryPlatform(false, "", ""),
        website: webPlatform(true, "https://antwerpen.bitebrands-demo.be"),
      },
      billing: {
        fire: billingState(false, false, false, ""),
      },
      events: [
        event("e4", "contact", "wa", "Checklist via WhatsApp gestuurd.", "Kerem", day * 4),
      ],
      createdAt: iso(day * 28),
    }),
    partner({
      id: "P004",
      name: "Tasty American Berlin",
      contact: "David Koch",
      city: "Berlin",
      country: "DE",
      phone: "+49 30 9988 4411",
      email: "berlin@tasty.partner",
      concepts: ["tasty"],
      general: { contract: false, docs: false },
      steps: {
        tasty: { tb: false, ue: false, onb: false, kassa: false, plan: false, live: false },
      },
      custom: {
        kvk: "DE9988122",
        iban: "DE12500105170648489890",
        address: "Oranienstrasse 33, Berlin",
      },
      fee: 8,
      platforms: {
        thuisbezorgd: deliveryPlatform(false, "", ""),
        ubereats: deliveryPlatform(false, "", ""),
        website: webPlatform(false, ""),
      },
      billing: {
        tasty: billingState(false, false, false, ""),
      },
      events: [
        event("e5", "system", "system", "Partner aangemaakt", "Huib", day * 1),
      ],
      createdAt: iso(day * 20),
    }),
    partner({
      id: "P005",
      name: "Chick'n Box Warszawa",
      contact: "Tomasz Kowalski",
      city: "Warszawa",
      country: "PL",
      phone: "+48 22 123 6677",
      email: "warszawa@chick.partner",
      concepts: ["chick"],
      general: { contract: true, docs: true },
      steps: {
        chick: { tb: true, ue: true, onb: true, kassa: true, plan: true, live: true },
      },
      custom: {
        kvk: "PL88990011",
        iban: "PL10105000997603123456789123",
        address: "Marszalkowska 9, Warszawa",
      },
      fee: 12,
      platforms: {
        thuisbezorgd: deliveryPlatform(true, "warszawa@partner", "TB30021"),
        ubereats: deliveryPlatform(true, "warszawa@ue.partner", "UE30021"),
        website: webPlatform(false, ""),
      },
      billing: {
        chick: billingState(true, true, false, ""),
      },
      events: [
        event("e6", "contact", "note", "Live maar verificatie ontbreekt nog.", "Sanne", day * 1),
      ],
      createdAt: iso(day * 18),
    }),
    partner({
      id: "P006",
      name: "Smash Bird Praha",
      contact: "Pavel Novak",
      city: "Praha",
      country: "CZ",
      phone: "+420 222 333 444",
      email: "praha@smash.partner",
      concepts: ["smash", "fire"],
      general: { contract: true, docs: true },
      steps: {
        smash: { tb: true, ue: false, onb: true, kassa: true, plan: true, live: true },
        fire: { tb: true, ue: false, onb: true, kassa: true, plan: true, live: true },
      },
      custom: {
        kvk: "CZ77441122",
        iban: "CZ6508000000192000145399",
        address: "Karlovo namesti 10, Praha",
      },
      fee: 12,
      platforms: {
        thuisbezorgd: deliveryPlatform(true, "praha@partner", "TB44011"),
        ubereats: deliveryPlatform(false, "", ""),
        website: webPlatform(true, "https://praha.bitebrands-demo.cz"),
      },
      billing: {
        smash: billingState(true, true, true, "203981"),
        fire: billingState(true, false, true, "774129"),
      },
      events: [
        event("e7", "contact", "call", "Facturatie voor Fire Wing nog toevoegen.", "Sanne", hour * 30),
      ],
      createdAt: iso(day * 12),
    }),
  ].map((item) => ({
    ...item,
    steps: Object.fromEntries(
      Object.entries(item.steps).map(([conceptId, conceptSteps]) => [
        conceptId,
        Object.fromEntries(
          steps
            .filter((step) => !step.general)
            .map((step) => [step.id, conceptSteps[step.id] ?? false]),
        ),
      ]),
    ),
  }));
}

export function createSampleRelations(): Relation[] {
  return [
    {
      id: "R001",
      name: "KassaConnect B.V.",
      category: "Kassaleverancier",
      contact: "Dennis Klaver",
      phone: "+31 20 123 4567",
      email: "support@kassaconnect.nl",
      website: "https://kassaconnect.nl",
      notes: "Levert kassakoppeling voor NL-vestigingen.",
      events: [
        event("re1", "contact", "mail", "Koppelingsdocumentatie opgevraagd.", "Huib", day * 3),
      ],
    },
    {
      id: "R002",
      name: "Family Chicken Groothandel",
      category: "Groothandel",
      contact: "Inkoop",
      phone: "+31 161 22 33 44",
      email: "orders@familychicken.nl",
      website: "",
      notes: "Primaire leverancier kip en sauzen.",
      events: [
        event("re2", "contact", "wa", "Prijslijst Q3 ontvangen.", "Huib", day * 5),
      ],
    },
    {
      id: "R003",
      name: "Verpakt! Verpakkingen",
      category: "Verpakkingen",
      contact: "Lisa Bos",
      phone: "+31 13 555 6677",
      email: "info@verpakt.nl",
      website: "https://verpakt.nl",
      notes: "Branded verpakkingen per concept.",
      events: [],
    },
  ];
}

export function createSampleChat(): ChatMessage[] {
  return [
    { id: "c1", byId: "u3", text: "Heb net 3 nieuwe leads in Antwerpen toegevoegd.", at: iso(hour * 7) },
    { id: "c2", byId: "u1", text: "Top! Sanne, kun jij de facturatie voor Tilburg checken?", at: iso(hour * 6) },
    { id: "c3", byId: "u2", text: "Ja, ik pak het vanmiddag op.", at: iso(hour * 5) },
  ];
}

export function createSampleTasks(): Task[] {
  return [
    {
      id: "t1",
      title: "Verificatiecodes Thuisbezorgd controleren",
      desc: "Voor alle live vestigingen in NL de TB-verificatiecode bevestigen.",
      assigneeId: "u2",
      byId: "u1",
      partnerId: "P005",
      status: "open",
      at: iso(day * 2),
    },
    {
      id: "t2",
      title: "Contract Smash Bird Gent natrekken",
      desc: "Getekend contract ontbreekt nog in het dossier.",
      assigneeId: "u3",
      byId: "u1",
      partnerId: undefined,
      status: "open",
      at: iso(day * 1),
    },
    {
      id: "t3",
      title: "Kassakoppeling Eindhoven testen",
      desc: "",
      assigneeId: "u4",
      byId: "u4",
      partnerId: undefined,
      status: "done",
      at: iso(day * 6),
      doneAt: iso(day * 5),
    },
  ];
}

export function createInitialData(): CrmData {
  const config = createDefaultConfig();

  return {
    config,
    users: createDemoUsers(),
    currentUserId: null,
    loggedIn: false,
    partners: createSamplePartners(config),
    relations: createSampleRelations(),
    chat: createSampleChat(),
    tasks: createSampleTasks(),
    savedAt: new Date(now).toISOString(),
  };
}
