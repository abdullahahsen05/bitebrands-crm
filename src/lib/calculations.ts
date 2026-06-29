import type {
  BillingRow,
  Concept,
  CrmConfig,
  CrmData,
  Partner,
  PartnerFilters,
  PartnerPhase,
  Task,
} from "./types";

export function generalSteps(config: CrmConfig) {
  return config.steps.filter((step) => step.general);
}

export function conceptSteps(config: CrmConfig) {
  return config.steps.filter((step) => !step.general);
}

export function requiredGeneralSteps(config: CrmConfig) {
  return generalSteps(config).filter((step) => !step.optional);
}

export function requiredConceptSteps(config: CrmConfig) {
  return conceptSteps(config).filter((step) => !step.optional);
}

export function conceptDone(partner: Partner, conceptId: string, stepId: string) {
  return Boolean(partner.steps[conceptId]?.[stepId]);
}

export function generalDone(partner: Partner, stepId: string) {
  return Boolean(partner.general?.[stepId]);
}

export function progressOf(partner: Partner, config: CrmConfig) {
  const generalCount = generalSteps(config).reduce(
    (total, step) => total + (generalDone(partner, step.id) ? 1 : 0),
    0,
  );

  const conceptCount = partner.concepts.reduce((total, conceptId) => {
    return (
      total +
      conceptSteps(config).reduce(
        (stepTotal, step) => stepTotal + (conceptDone(partner, conceptId, step.id) ? 1 : 0),
        0,
      )
    );
  }, 0);

  return generalCount + conceptCount;
}

export function requiredProgressOf(partner: Partner, config: CrmConfig) {
  const generalRequired = requiredGeneralSteps(config);
  const conceptRequired = requiredConceptSteps(config);

  const generalDoneCount = generalRequired.reduce(
    (total, step) => total + (generalDone(partner, step.id) ? 1 : 0),
    0,
  );

  const conceptDoneCount = partner.concepts.reduce((total, conceptId) => {
    return (
      total +
      conceptRequired.reduce(
        (stepTotal, step) => stepTotal + (conceptDone(partner, conceptId, step.id) ? 1 : 0),
        0,
      )
    );
  }, 0);

  return {
    done: generalDoneCount + conceptDoneCount,
    total: generalRequired.length + conceptRequired.length * partner.concepts.length,
  };
}

export function phaseOfConcept(partner: Partner, conceptId: string, config: CrmConfig): PartnerPhase {
  const hasProgress = conceptSteps(config).some((step) => conceptDone(partner, conceptId, step.id));

  if (!hasProgress) {
    return "new";
  }

  const done = requiredConceptSteps(config).every((step) => conceptDone(partner, conceptId, step.id));
  return done ? "live" : "prog";
}

export function phaseOf(partner: Partner, config: CrmConfig): PartnerPhase {
  const anyGeneral = generalSteps(config).some((step) => generalDone(partner, step.id));
  const anyConcept = partner.concepts.some((conceptId) =>
    conceptSteps(config).some((step) => conceptDone(partner, conceptId, step.id)),
  );

  if (!anyGeneral && !anyConcept) {
    return "new";
  }

  const generalReady = requiredGeneralSteps(config).every((step) => generalDone(partner, step.id));
  const conceptsReady =
    partner.concepts.length > 0 &&
    partner.concepts.every((conceptId) => phaseOfConcept(partner, conceptId, config) === "live");

  return generalReady && conceptsReady ? "live" : "prog";
}

export function syncConceptLiveState(partner: Partner, conceptId: string, isLive: boolean): Partner {
  return {
    ...partner,
    steps: {
      ...partner.steps,
      [conceptId]: {
        ...partner.steps[conceptId],
        live: isLive,
      },
    },
    billing: {
      ...partner.billing,
      [conceptId]: {
        ...(partner.billing[conceptId] ?? {
          invoiced: false,
          live: false,
          verifDone: false,
          verif: "",
        }),
        live: isLive,
      },
    },
  };
}

export function verificationMissing(partner: Partner) {
  return partner.concepts.filter((conceptId) => {
    const billing = partner.billing[conceptId];
    return Boolean(billing?.live) && !billing?.verifDone;
  });
}

export function liveButNotInBilling(partner: Partner) {
  return partner.concepts.filter((conceptId) => {
    const billing = partner.billing[conceptId];
    return Boolean(billing?.live) && !billing?.invoiced;
  });
}

export function billingRows(partners: Partner[], config: CrmConfig): BillingRow[] {
  return partners.flatMap((partner) =>
    partner.concepts.map((conceptId) => {
      const concept = config.concepts.find((entry) => entry.id === conceptId) as Concept;
      const country = config.countries.find((entry) => entry.code === partner.country);
      const billing = partner.billing[conceptId] ?? {
        invoiced: false,
        live: false,
        verifDone: false,
        verif: "",
      };

      return {
        partnerId: partner.id,
        partnerName: partner.name,
        conceptId,
        conceptName: concept?.name ?? conceptId,
        conceptColor: concept?.color ?? "#9A938C",
        city: partner.city,
        countryCode: partner.country,
        countryFlag: country?.flag ?? "🌍",
        phase: phaseOf(partner, config),
        invoiced: billing.invoiced,
        live: billing.live,
        verifDone: billing.verifDone,
        verif: billing.verif ?? "",
      };
    }),
  );
}

export function openTasksForUser(tasks: Task[], userId: string | null) {
  if (!userId) {
    return [];
  }

  return tasks.filter((task) => task.assigneeId === userId && task.status === "open");
}

export function partnerMatchesFilters(
  partner: Partner,
  config: CrmConfig,
  filters: PartnerFilters,
) {
  const query = filters.query.trim().toLowerCase();
  const target = [
    partner.name,
    partner.contact,
    partner.city,
    partner.email,
    ...partner.concepts.map(
      (conceptId) => config.concepts.find((concept) => concept.id === conceptId)?.name ?? conceptId,
    ),
  ]
    .join(" ")
    .toLowerCase();

  const queryMatch = !query || target.includes(query);
  const countryMatch = filters.country === "all" || partner.country === filters.country;
  const conceptMatch =
    filters.concept === "all" || partner.concepts.includes(filters.concept);
  const phaseMatch = filters.phase === "all" || phaseOf(partner, config) === filters.phase;

  return queryMatch && countryMatch && conceptMatch && phaseMatch;
}

export function filteredPartners(data: CrmData, filters: PartnerFilters) {
  return data.partners.filter((partner) => partnerMatchesFilters(partner, data.config, filters));
}

export function dashboardAlerts(data: CrmData) {
  const verification = data.partners.flatMap((partner) =>
    verificationMissing(partner).map((conceptId) => ({
      partnerId: partner.id,
      partnerName: partner.name,
      conceptId,
    })),
  );

  const billing = data.partners.flatMap((partner) =>
    liveButNotInBilling(partner).map((conceptId) => ({
      partnerId: partner.id,
      partnerName: partner.name,
      conceptId,
    })),
  );

  return { verification, billing };
}

export function kpiSummary(data: CrmData, filters: PartnerFilters) {
  const partners = filteredPartners(data, filters);
  const livePartners = partners.filter((partner) => phaseOf(partner, data.config) === "live");
  const onboardingPartners = partners.filter((partner) => phaseOf(partner, data.config) === "prog");
  const missingVerification = partners.reduce(
    (total, partner) => total + verificationMissing(partner).length,
    0,
  );

  return {
    totalPartners: partners.length,
    livePartners: livePartners.length,
    onboardingPartners: onboardingPartners.length,
    missingVerification,
  };
}

export function formatConceptNames(conceptIds: string[], config: CrmConfig) {
  return conceptIds
    .map((conceptId) => config.concepts.find((concept) => concept.id === conceptId)?.name ?? conceptId)
    .join(", ");
}
