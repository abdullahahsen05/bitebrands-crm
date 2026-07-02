"use client";

import { create } from "zustand";

import { supabase } from "./supabase/client";
import { loadAllData } from "./supabase/loader";
import { mapChatMessage, mapTask } from "./supabase/mappers";
import type { DbChatMessage, DbTask } from "./supabase/db-types";
import { syncConceptLiveState } from "./calculations";
import { canAccessView, getDefaultViewForRole } from "./permissions";
import { createInitialData } from "./mock-data";
import type {
  AppModal,
  CrmConfig,
  CrmData,
  CrmView,
  Partner,
  PartnerInput,
  RelationInput,
  TaskInput,
  UiState,
  User,
} from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

type CrmStore = {
  data: CrmData;
  ui: UiState;
  initialized: boolean;
  loading: boolean;
  loginError: string | null;

  // Auth
  initAuth: () => Promise<void>;
  login: (userId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadData: (supabaseUserId: string) => Promise<void>;
  // Switches the displayed user without changing the Supabase auth session.
  // TODO (security hardening): replace with full signIn for each user in production.
  switchUser: (userId: string) => void;

  // UI
  setView: (view: CrmView) => void;
  setFilters: (filters: Partial<UiState["filters"]>) => void;
  setAdminTab: (adminTab: string) => void;
  setPartnerDrawerTab: (tab: string) => void;
  openPartner: (partnerId: string) => void;
  closePartner: () => void;
  openRelation: (relationId: string) => void;
  closeRelation: () => void;
  openModal: (modal: AppModal) => void;
  closeModal: () => void;
  toggleUserMenu: () => void;
  closeUserMenu: () => void;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;

  // Data mutations
  resetDemoData: () => void;
  updateConfig: (recipe: (config: CrmConfig) => void) => void;
  updateUsers: (recipe: (users: User[]) => void) => void;
  createPartner: (input: PartnerInput) => void;
  updatePartner: (partnerId: string, recipe: (partner: Partner) => void) => void;
  togglePartnerConcept: (partnerId: string, conceptId: string) => void;
  toggleGeneralStep: (partnerId: string, stepId: string) => void;
  toggleConceptStep: (partnerId: string, conceptId: string, stepId: string) => void;
  updatePartnerPlatform: (
    partnerId: string,
    platformId: string,
    recipe: (platform: Partner["platforms"][string]) => void,
  ) => void;
  togglePartnerBillingFlag: (
    partnerId: string,
    conceptId: string,
    field: "invoiced" | "live" | "verifDone",
  ) => void;
  setPartnerVerificationCode: (partnerId: string, conceptId: string, verif: string) => void;
  addPartnerEvent: (partnerId: string, type: string, text: string) => void;
  createRelation: (input: RelationInput) => void;
  updateRelation: (relationId: string, recipe: (relation: CrmData["relations"][number]) => void) => void;
  addRelationEvent: (relationId: string, type: string, text: string) => void;
  sendChatMessage: (text: string) => void;
  createTask: (input: TaskInput) => void;
  toggleTaskStatus: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COUNTRY_FILTER_KEY = "crm_country_filter";
const UI_STATE_KEY = "crm-ui-state";

type PersistedUiState = {
  view: string;
  filters: { query: string; country: string; concept: string; phase: string };
  selectedPartnerId: string | null;
  adminTab: string;
  partnerDrawerTab: string;
};

function saveUiState(ui: UiState): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedUiState = {
      view: ui.view,
      filters: ui.filters,
      selectedPartnerId: ui.selectedPartnerId,
      adminTab: ui.adminTab,
      partnerDrawerTab: ui.partnerDrawerTab,
    };
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(payload));
  } catch { /* storage full or unavailable */ }
}

function loadPersistedUiState(): Partial<PersistedUiState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(UI_STATE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedUiState>) : {};
  } catch { return {}; }
}

function clearPersistedUiState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(UI_STATE_KEY);
  localStorage.removeItem(COUNTRY_FILTER_KEY);
}

// Blank state — used on logout and demo reset (never reads localStorage).
function createFreshUiState(): UiState {
  return {
    view: "list",
    filters: { query: "", country: "all", concept: "all", phase: "all" },
    selectedPartnerId: null,
    selectedRelationId: null,
    adminTab: "landen",
    partnerDrawerTab: "profiel",
    modal: { type: null },
    toast: null,
    userMenuOpen: false,
    mobileNavOpen: false,
  };
}

// Startup state — restores from localStorage when available.
function createUiState(): UiState {
  const saved = loadPersistedUiState();
  const savedCountry =
    saved.filters?.country ??
    (typeof window !== "undefined" ? (localStorage.getItem(COUNTRY_FILTER_KEY) ?? "all") : "all");
  return {
    view: (saved.view as CrmView | undefined) ?? "list",
    filters: {
      query: saved.filters?.query ?? "",
      country: savedCountry,
      concept: saved.filters?.concept ?? "all",
      phase: (saved.filters?.phase ?? "all") as UiState["filters"]["phase"],
    },
    selectedPartnerId: saved.selectedPartnerId ?? null,
    selectedRelationId: null,
    adminTab: saved.adminTab ?? "landen",
    partnerDrawerTab: saved.partnerDrawerTab ?? "profiel",
    modal: { type: null },
    toast: null,
    userMenuOpen: false,
    mobileNavOpen: false,
  };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function stampData(data: CrmData) {
  data.savedAt = new Date().toISOString();
}

function currentUser(data: CrmData) {
  return data.users.find((user) => user.id === data.currentUserId) ?? data.users[0];
}

function nextId(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function defaultBillingState() {
  return { invoiced: false, live: false, verifDone: false, verif: "" };
}

// Show toast on Supabase error; does not revert local state (optimistic UI).
function onSyncError(showToast: (m: string) => void) {
  return (error: unknown) => {
    if (!error) return;
    console.error("[Supabase sync]", error);
    showToast("Synchronisatie mislukt. Ververs de pagina als dit aanhoudt.");
  };
}

// ─── Config sync ─────────────────────────────────────────────────────────────

async function syncConfigDiff(
  old: CrmConfig,
  next: CrmConfig,
  showToast: (m: string) => void,
) {
  const err = onSyncError(showToast);

  // Countries
  const oldCodes = new Set(old.countries.map((c) => c.code));
  const newCodes = new Set(next.countries.map((c) => c.code));
  const addedOrUpdatedCountries = next.countries.filter(
    (c) => !oldCodes.has(c.code) || old.countries.find((o) => o.code === c.code && (o.name !== c.name || o.flag !== c.flag)),
  );
  const removedCodes = [...oldCodes].filter((c) => !newCodes.has(c));

  if (addedOrUpdatedCountries.length > 0) {
    const { error } = await supabase.from("countries").upsert(
      addedOrUpdatedCountries.map((c) => ({ code: c.code, name: c.name, flag: c.flag })),
    );
    err(error);
  }
  for (const code of removedCodes) {
    const { error } = await supabase.from("countries").delete().eq("code", code);
    err(error);
  }

  // Concepts
  const oldConceptIds = new Set(old.concepts.map((c) => c.id));
  const newConceptIds = new Set(next.concepts.map((c) => c.id));
  const addedOrUpdatedConcepts = next.concepts.filter(
    (c) =>
      !oldConceptIds.has(c.id) ||
      old.concepts.find((o) => o.id === c.id && (o.name !== c.name || o.color !== c.color)),
  );
  const removedConceptIds = [...oldConceptIds].filter((id) => !newConceptIds.has(id));

  if (addedOrUpdatedConcepts.length > 0) {
    const { error } = await supabase.from("concepts").upsert(
      addedOrUpdatedConcepts.map((c, i) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        logo_url: c.logoUrl ?? null,
        sort_order: i,
      })),
    );
    err(error);
  }
  for (const id of removedConceptIds) {
    const { error } = await supabase.from("concepts").delete().eq("id", id);
    err(error);
  }

  // Onboarding steps
  const oldStepIds = new Set(old.steps.map((s) => s.id));
  const newStepIds = new Set(next.steps.map((s) => s.id));
  const addedOrUpdatedSteps = next.steps.filter((s) => !oldStepIds.has(s.id) || true); // always sync
  const removedStepIds = [...oldStepIds].filter((id) => !newStepIds.has(id));

  if (addedOrUpdatedSteps.length > 0) {
    const { error } = await supabase.from("onboarding_steps").upsert(
      addedOrUpdatedSteps.map((s, i) => ({
        id: s.id,
        name: s.name,
        sub: s.sub ?? null,
        optional: s.optional ?? false,
        general: s.general ?? false,
        sort_order: i,
      })),
    );
    err(error);
  }
  for (const id of removedStepIds) {
    const { error } = await supabase.from("onboarding_steps").delete().eq("id", id);
    err(error);
  }

  // Custom fields
  const oldFieldIds = new Set(old.fields.map((f) => f.id));
  const newFieldIds = new Set(next.fields.map((f) => f.id));
  const addedOrUpdatedFields = next.fields.filter((f) => !oldFieldIds.has(f.id) || true);
  const removedFieldIds = [...oldFieldIds].filter((id) => !newFieldIds.has(id));

  if (addedOrUpdatedFields.length > 0) {
    const { error } = await supabase.from("custom_fields").upsert(
      addedOrUpdatedFields.map((f, i) => ({ id: f.id, label: f.label, type: f.type, sort_order: i })),
    );
    err(error);
  }
  for (const id of removedFieldIds) {
    const { error } = await supabase.from("custom_fields").delete().eq("id", id);
    err(error);
  }

  // Platforms
  const oldPlatformIds = new Set(old.platforms.map((p) => p.id));
  const newPlatformIds = new Set(next.platforms.map((p) => p.id));
  const addedOrUpdatedPlatforms = next.platforms.filter((p) => !oldPlatformIds.has(p.id) || true);
  const removedPlatformIds = [...oldPlatformIds].filter((id) => !newPlatformIds.has(id));

  if (addedOrUpdatedPlatforms.length > 0) {
    const { error } = await supabase.from("platforms").upsert(
      addedOrUpdatedPlatforms.map((p, i) => ({ id: p.id, name: p.name, kind: p.kind, sort_order: i })),
    );
    err(error);
  }
  for (const id of removedPlatformIds) {
    const { error } = await supabase.from("platforms").delete().eq("id", id);
    err(error);
  }

  // Relation categories
  const oldCats = new Set(old.relationCategories);
  const newCats = new Set(next.relationCategories);
  const addedCats = next.relationCategories.filter((c) => !oldCats.has(c));
  const removedCats = [...oldCats].filter((c) => !newCats.has(c));

  if (addedCats.length > 0) {
    const { error } = await supabase
      .from("relation_categories")
      .upsert(addedCats.map((name, i) => ({ name, sort_order: i })), { onConflict: "name" });
    err(error);
  }
  for (const name of removedCats) {
    const { error } = await supabase.from("relation_categories").delete().eq("name", name);
    err(error);
  }

  // Templates — diff by country code
  for (const [code, templates] of Object.entries(next.templates)) {
    const { error } = await supabase.from("message_templates").upsert(
      templates.map((t) => ({
        id: t.id,
        country_code: code,
        channel: t.channel,
        title: t.title,
        subject: t.subject ?? null,
        body: t.body,
      })),
    );
    err(error);
  }
  for (const code of removedCodes) {
    const { error } = await supabase.from("message_templates").delete().eq("country_code", code);
    err(error);
  }

  // Portal settings
  const portals = next.portals;
  const settingRows = [
    { key: "portal_onboarding", value: { url: portals.onboarding?.url ?? "" } },
    { key: "portal_facturatie", value: { url: portals.facturatie?.url ?? "" } },
    { key: "portal_review",    value: { url: portals.review?.url ?? "" } },
  ];
  const { error: settingsErr } = await supabase.from("settings").upsert(settingRows);
  err(settingsErr);
}

// ─── Realtime ─────────────────────────────────────────────────────────────────
// Module-level channel refs so they can be cleaned up on logout.

let _chatChannel: ReturnType<typeof supabase.channel> | null = null;
let _taskChannel: ReturnType<typeof supabase.channel> | null = null;

function setupRealtimeChannels(
  set: (recipe: (state: { data: CrmData }) => Partial<{ data: CrmData }>) => void,
) {
  _chatChannel?.unsubscribe();
  _taskChannel?.unsubscribe();

  _chatChannel = supabase
    .channel("realtime-chat")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
      const msg = mapChatMessage(payload.new as DbChatMessage);
      set((state) => {
        if (state.data.chat.some((m) => m.id === msg.id)) return {};
        return { data: { ...state.data, chat: [...state.data.chat, msg] } };
      });
    })
    .subscribe();

  _taskChannel = supabase
    .channel("realtime-tasks")
    .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (payload) => {
      if (payload.eventType === "INSERT") {
        const task = mapTask(payload.new as DbTask);
        set((state) => {
          if (state.data.tasks.some((t) => t.id === task.id)) return {};
          return { data: { ...state.data, tasks: [task, ...state.data.tasks] } };
        });
      } else if (payload.eventType === "UPDATE") {
        const task = mapTask(payload.new as DbTask);
        set((state) => ({
          data: { ...state.data, tasks: state.data.tasks.map((t) => (t.id === task.id ? task : t)) },
        }));
      } else if (payload.eventType === "DELETE") {
        const deletedId = (payload.old as { id: string }).id;
        set((state) => ({
          data: { ...state.data, tasks: state.data.tasks.filter((t) => t.id !== deletedId) },
        }));
      }
    })
    .subscribe();
}

function teardownRealtimeChannels() {
  _chatChannel?.unsubscribe();
  _taskChannel?.unsubscribe();
  _chatChannel = null;
  _taskChannel = null;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCrmStore = create<CrmStore>()((set, get) => ({
  data: createInitialData(),
  ui: createUiState(),
  initialized: false,
  loading: false,
  loginError: null,

  // ── Auth ──────────────────────────────────────────────────────────────────

  initAuth: async () => {
    // Check for an existing session on app load (after page refresh).
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      set({ loading: true });
      try {
        const data = await loadAllData(session.user.id);
        const user = data.users.find((u) => u.id === data.currentUserId);
        const savedUi = get().ui; // already has localStorage values from createUiState()

        // Validate view access for restored role
        const view = canAccessView(user?.role, savedUi.view)
          ? savedUi.view
          : getDefaultViewForRole(user?.role);

        // Validate selectedPartnerId still exists in freshly loaded data
        const selectedPartnerId =
          savedUi.selectedPartnerId &&
          data.partners.some((p) => p.id === savedUi.selectedPartnerId)
            ? savedUi.selectedPartnerId
            : null;

        set((state) => ({
          data,
          loading: false,
          initialized: true,
          ui: { ...state.ui, view, selectedPartnerId },
        }));
        setupRealtimeChannels(set as Parameters<typeof setupRealtimeChannels>[0]);
      } catch (err) {
        console.error("Failed to load data after session restore:", err);
        set({ loading: false, initialized: true });
      }
    } else {
      set({ initialized: true });
    }

    // Listen for future auth state changes (login / logout).
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // alreadyLoggedIn distinguishes a silent token refresh (tab return) from
        // a fresh login click. On token refresh we preserve the current UI context.
        const alreadyLoggedIn = get().data.loggedIn;
        set({ loading: true });
        try {
          const data = await loadAllData(session.user.id);
          const user = data.users.find((u) => u.id === data.currentUserId);
          if (alreadyLoggedIn) {
            // Token refresh / silent re-auth — keep whatever the user was doing
            const currentView = get().ui.view;
            const view = canAccessView(user?.role, currentView)
              ? currentView
              : getDefaultViewForRole(user?.role);
            set((state) => ({ data, loading: false, ui: { ...state.ui, view } }));
          } else {
            // Explicit fresh login — go to role default
            const view = getDefaultViewForRole(user?.role);
            set({ data, loading: false, ui: { ...createFreshUiState(), view } });
          }
          setupRealtimeChannels(set as Parameters<typeof setupRealtimeChannels>[0]);
        } catch (err) {
          console.error("Failed to load data after sign in:", err);
          set({ loading: false });
        }
      }

      if (event === "SIGNED_OUT") {
        teardownRealtimeChannels();
        clearPersistedUiState();
        set({
          data: { ...createInitialData(), loggedIn: false },
          ui: { ...createFreshUiState(), userMenuOpen: false },
          loginError: null,
        });
      }
    });
  },

  login: async (userId, password) => {
    // Map legacy demo user IDs to Supabase emails.
    const DEMO_EMAILS: Record<string, string> = {
      u1: "huib@bitebrands.demo",
      u2: "sanne@bitebrands.demo",
      u3: "kerem@bitebrands.demo",
      u4: "noor@bitebrands.demo",
      u5: "lotte@bitebrands.demo",
    };

    const email = DEMO_EMAILS[userId];
    if (!email) {
      set({ loginError: "Onbekende gebruiker." });
      return false;
    }

    set({ loading: true, loginError: null });

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      set({ loading: false, loginError: "Onjuist wachtwoord." });
      return false;
    }

    // Data load is handled by the onAuthStateChange listener in initAuth.
    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
    clearPersistedUiState();
    set({
      data: { ...createInitialData(), loggedIn: false },
      ui: { ...createFreshUiState(), userMenuOpen: false },
      loginError: null,
    });
  },

  loadData: async (supabaseUserId) => {
    set({ loading: true });
    try {
      const data = await loadAllData(supabaseUserId);
      set({ data, loading: false });
    } catch (err) {
      console.error("loadData failed:", err);
      set({ loading: false });
    }
  },

  // ── UI ────────────────────────────────────────────────────────────────────

  setView: (view) => {
    const user = currentUser(get().data);
    if (!canAccessView(user?.role, view)) {
      const fallback = getDefaultViewForRole(user?.role);
      set((state) => ({
        ui: {
          ...state.ui,
          view: fallback,
          mobileNavOpen: false,
          toast: { id: nextId("toast-"), message: "Geen toegang tot deze sectie voor jouw rol." },
        },
      }));
      return;
    }
    set((state) => ({ ui: { ...state.ui, view, mobileNavOpen: false } }));
  },

  setFilters: (filters) => {
    if (filters.country !== undefined) {
      localStorage.setItem(COUNTRY_FILTER_KEY, filters.country);
    }
    set((state) => ({ ui: { ...state.ui, filters: { ...state.ui.filters, ...filters } } }));
  },

  setAdminTab: (adminTab) =>
    set((state) => ({ ui: { ...state.ui, adminTab } })),

  setPartnerDrawerTab: (partnerDrawerTab) =>
    set((state) => ({ ui: { ...state.ui, partnerDrawerTab } })),

  openPartner: (partnerId) =>
    set((state) => ({ ui: { ...state.ui, selectedPartnerId: partnerId, selectedRelationId: null } })),

  closePartner: () =>
    set((state) => ({ ui: { ...state.ui, selectedPartnerId: null } })),

  openRelation: (relationId) =>
    set((state) => ({ ui: { ...state.ui, selectedRelationId: relationId, selectedPartnerId: null } })),

  closeRelation: () =>
    set((state) => ({ ui: { ...state.ui, selectedRelationId: null } })),

  openModal: (modal) =>
    set((state) => ({ ui: { ...state.ui, modal } })),

  closeModal: () =>
    set((state) => ({ ui: { ...state.ui, modal: { type: null } } })),

  toggleUserMenu: () =>
    set((state) => ({ ui: { ...state.ui, userMenuOpen: !state.ui.userMenuOpen } })),

  closeUserMenu: () =>
    set((state) => ({ ui: { ...state.ui, userMenuOpen: false } })),

  switchUser: (userId) =>
    set((state) => {
      const newUser = state.data.users.find((u) => u.id === userId);
      const currentView = state.ui.view;
      const view = canAccessView(newUser?.role, currentView)
        ? currentView
        : getDefaultViewForRole(newUser?.role);
      return {
        data: { ...state.data, currentUserId: userId },
        ui: { ...state.ui, userMenuOpen: false, view },
      };
    }),

  toggleMobileNav: () =>
    set((state) => ({ ui: { ...state.ui, mobileNavOpen: !state.ui.mobileNavOpen } })),

  closeMobileNav: () =>
    set((state) => ({ ui: { ...state.ui, mobileNavOpen: false } })),

  showToast: (message) =>
    set((state) => ({
      ui: { ...state.ui, toast: { id: nextId("toast-"), message } },
    })),

  clearToast: () =>
    set((state) => ({ ui: { ...state.ui, toast: null } })),

  // ── Data mutations ────────────────────────────────────────────────────────

  resetDemoData: () => {
    // Synchronously restore mock data while preserving the active login session.
    // Use the "Herladen" button in AppShell to reload live data from Supabase.
    clearPersistedUiState();
    set((state) => {
      const nextData = createInitialData();
      const hasCurrentUser = nextData.users.some((u) => u.id === state.data.currentUserId);
      nextData.loggedIn = state.data.loggedIn;
      nextData.currentUserId = hasCurrentUser ? state.data.currentUserId : nextData.currentUserId;
      return { data: nextData, ui: createFreshUiState(), loginError: null };
    });
  },

  updateConfig: (recipe) => {
    const oldConfig = clone(get().data.config);

    set((state) => {
      const data = clone(state.data);
      recipe(data.config);
      stampData(data);
      return { data };
    });

    const newConfig = get().data.config;
    syncConfigDiff(oldConfig, newConfig, get().showToast);
  },

  updateUsers: (recipe) => {
    set((state) => {
      const data = clone(state.data);
      recipe(data.users);
      stampData(data);
      return { data };
    });

    // Sync profile updates to Supabase (role/name changes only; adding users via admin
    // creates a profile row but requires a separate Supabase Auth invite for login).
    // TODO (security hardening): handle auth user creation/deletion from admin panel.
    const users = get().data.users;
    const err = onSyncError(get().showToast);
    supabase
      .from("profiles")
      .upsert(users.map((u) => ({ id: u.id, name: u.name, role: u.role, color: u.color })))
      .then(({ error }) => err(error));
  },

  createPartner: (input) => {
    const data0 = get().data;
    const partnerId = nextId("P");
    const general = Object.fromEntries(
      data0.config.steps.filter((step) => step.general).map((step) => [step.id, false]),
    );
    const steps = Object.fromEntries(
      input.concepts.map((conceptId) => [
        conceptId,
        Object.fromEntries(
          data0.config.steps.filter((step) => !step.general).map((step) => [step.id, false]),
        ),
      ]),
    );
    const billing = Object.fromEntries(
      input.concepts.map((conceptId) => [conceptId, defaultBillingState()]),
    );
    const platforms = Object.fromEntries(
      data0.config.platforms.map((platform) => [
        platform.id,
        platform.kind === "web"
          ? { active: false, url: "" }
          : { active: false, login: "", pass: "demo123", partnerId: "" }, // TODO: secure vault
      ]),
    );
    const newPartner: Partner = {
      id: partnerId,
      name: input.name,
      contact: input.contact || "—",
      city: input.city || "—",
      country: input.country,
      phone: input.phone,
      email: input.email,
      concepts: input.concepts,
      general,
      steps,
      custom: {},
      fee: 0,
      platforms,
      billing,
      events: [
        {
          id: nextId("evt-"),
          kind: "system",
          type: "system",
          text: "Partner aangemaakt",
          at: new Date().toISOString(),
          by: currentUser(data0).name,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      data: { ...state.data, partners: [newPartner, ...state.data.partners], savedAt: new Date().toISOString() },
      ui: { ...state.ui, modal: { type: null }, selectedPartnerId: partnerId },
    }));

    // Persist to Supabase
    const err = onSyncError(get().showToast);
    const currentUserId = get().data.currentUserId;

    (async () => {
      // partners row
      const { error: pe } = await supabase.from("partners").insert({
        id: partnerId,
        name: newPartner.name,
        contact: newPartner.contact,
        city: newPartner.city,
        country_code: newPartner.country,
        phone: newPartner.phone,
        email: newPartner.email,
        fee: newPartner.fee,
        created_at: newPartner.createdAt,
        created_by: currentUserId,
      });
      err(pe);

      // partner_concepts
      if (input.concepts.length > 0) {
        const { error: ce } = await supabase.from("partner_concepts").insert(
          input.concepts.map((cid) => ({ partner_id: partnerId, concept_id: cid })),
        );
        err(ce);
      }

      // partner_general_steps
      const generalStepRows = Object.entries(general).map(([step_id, done]) => ({
        partner_id: partnerId, step_id, done,
      }));
      if (generalStepRows.length > 0) {
        const { error: gse } = await supabase.from("partner_general_steps").insert(generalStepRows);
        err(gse);
      }

      // partner_concept_steps
      const conceptStepRows = input.concepts.flatMap((cid) =>
        Object.entries(steps[cid] ?? {}).map(([step_id, done]) => ({
          partner_id: partnerId, concept_id: cid, step_id, done,
        })),
      );
      if (conceptStepRows.length > 0) {
        const { error: cse } = await supabase.from("partner_concept_steps").insert(conceptStepRows);
        err(cse);
      }

      // partner_platforms
      const platformRows = Object.entries(platforms).map(([pid, pdata]) => ({
        partner_id: partnerId,
        platform_id: pid,
        active: pdata.active,
        login: pdata.login ?? null,
        pass: pdata.pass ?? null,
        partner_external_id: pdata.partnerId ?? null,
        url: pdata.url ?? null,
      }));
      if (platformRows.length > 0) {
        const { error: ple } = await supabase.from("partner_platforms").insert(platformRows);
        err(ple);
      }

      // partner_billing
      const billingRows = input.concepts.map((cid) => ({
        partner_id: partnerId, concept_id: cid, invoiced: false, live: false, verif_done: false, verif_code: null,
      }));
      if (billingRows.length > 0) {
        const { error: ble } = await supabase.from("partner_billing").insert(billingRows);
        err(ble);
      }

      // Initial system event
      if (newPartner.events.length > 0) {
        const ev = newPartner.events[0];
        const { error: eve } = await supabase.from("events").insert({
          id: ev.id, partner_id: partnerId, kind: ev.kind, type: ev.type, text: ev.text, by_name: ev.by, created_at: ev.at,
        });
        err(eve);
      }
    })();
  },

  updatePartner: (partnerId, recipe) => {
    set((state) => {
      const data = clone(state.data);
      const partner = data.partners.find((entry) => entry.id === partnerId);
      if (!partner) return {};
      recipe(partner);
      stampData(data);
      return { data };
    });

    // Sync updated partner fields + custom fields to Supabase
    const partner = get().data.partners.find((p) => p.id === partnerId);
    if (!partner) return;
    const err = onSyncError(get().showToast);

    (async () => {
      const { error: pe } = await supabase.from("partners").update({
        name: partner.name,
        contact: partner.contact,
        city: partner.city,
        country_code: partner.country,
        phone: partner.phone,
        email: partner.email,
        fee: partner.fee,
        updated_at: new Date().toISOString(),
      }).eq("id", partnerId);
      err(pe);

      // Sync all custom fields
      if (Object.keys(partner.custom).length > 0) {
        const customRows = Object.entries(partner.custom).map(([field_id, value]) => ({
          partner_id: partnerId, field_id, value,
        }));
        const { error: ce } = await supabase.from("partner_custom").upsert(customRows);
        err(ce);
      }
    })();
  },

  togglePartnerConcept: (partnerId, conceptId) => {
    const partner = get().data.partners.find((p) => p.id === partnerId);
    if (!partner) return;
    const exists = partner.concepts.includes(conceptId);
    const config = get().data.config;

    set((state) => {
      const data = clone(state.data);
      const p = data.partners.find((entry) => entry.id === partnerId);
      if (!p) return {};

      if (exists) {
        p.concepts = p.concepts.filter((entry) => entry !== conceptId);
        delete p.steps[conceptId];
        delete p.billing[conceptId];
      } else {
        p.concepts.push(conceptId);
        p.steps[conceptId] = Object.fromEntries(
          config.steps.filter((step) => !step.general).map((step) => [step.id, false]),
        );
        p.billing[conceptId] = defaultBillingState();
      }
      stampData(data);
      return { data };
    });

    const err = onSyncError(get().showToast);
    (async () => {
      if (exists) {
        await supabase.from("partner_concepts").delete().eq("partner_id", partnerId).eq("concept_id", conceptId);
        await supabase.from("partner_concept_steps").delete().eq("partner_id", partnerId).eq("concept_id", conceptId);
        await supabase.from("partner_billing").delete().eq("partner_id", partnerId).eq("concept_id", conceptId);
      } else {
        const { error: ce } = await supabase.from("partner_concepts").insert({ partner_id: partnerId, concept_id: conceptId });
        err(ce);

        const conceptStepRows = config.steps
          .filter((s) => !s.general)
          .map((s) => ({ partner_id: partnerId, concept_id: conceptId, step_id: s.id, done: false }));
        if (conceptStepRows.length > 0) {
          const { error: cse } = await supabase.from("partner_concept_steps").insert(conceptStepRows);
          err(cse);
        }

        const { error: ble } = await supabase.from("partner_billing").insert({
          partner_id: partnerId, concept_id: conceptId, invoiced: false, live: false, verif_done: false,
        });
        err(ble);
      }
    })();
  },

  toggleGeneralStep: (partnerId, stepId) => {
    const partner = get().data.partners.find((p) => p.id === partnerId);
    if (!partner) return;
    const newValue = !partner.general[stepId];

    set((state) => {
      const data = clone(state.data);
      const p = data.partners.find((entry) => entry.id === partnerId);
      if (!p) return {};
      p.general[stepId] = newValue;
      stampData(data);
      return { data };
    });

    const err = onSyncError(get().showToast);
    supabase
      .from("partner_general_steps")
      .upsert({ partner_id: partnerId, step_id: stepId, done: newValue, updated_at: new Date().toISOString() })
      .then(({ error }) => err(error));
  },

  toggleConceptStep: (partnerId, conceptId, stepId) => {
    const partner = get().data.partners.find((p) => p.id === partnerId);
    if (!partner) return;
    const current = partner.steps[conceptId]?.[stepId];
    const isLive = !current;

    set((state) => {
      const data = clone(state.data);
      const idx = data.partners.findIndex((p) => p.id === partnerId);
      if (idx === -1) return {};
      const p = data.partners[idx];
      p.steps[conceptId] = p.steps[conceptId] ?? {};
      p.steps[conceptId][stepId] = isLive;
      if (stepId === "live") {
        data.partners[idx] = syncConceptLiveState(p, conceptId, isLive);
      }
      stampData(data);
      return { data };
    });

    const err = onSyncError(get().showToast);
    (async () => {
      const { error: ste } = await supabase
        .from("partner_concept_steps")
        .upsert({ partner_id: partnerId, concept_id: conceptId, step_id: stepId, done: isLive, updated_at: new Date().toISOString() });
      err(ste);

      if (stepId === "live") {
        const { error: ble } = await supabase
          .from("partner_billing")
          .upsert({ partner_id: partnerId, concept_id: conceptId, live: isLive, updated_at: new Date().toISOString() });
        err(ble);
      }
    })();
  },

  updatePartnerPlatform: (partnerId, platformId, recipe) => {
    set((state) => {
      const data = clone(state.data);
      const partner = data.partners.find((entry) => entry.id === partnerId);
      if (!partner) return {};
      const platform = partner.platforms[platformId];
      if (!platform) return {};
      recipe(platform);
      stampData(data);
      return { data };
    });

    const partner = get().data.partners.find((p) => p.id === partnerId);
    const platform = partner?.platforms[platformId];
    if (!platform) return;
    const err = onSyncError(get().showToast);

    supabase
      .from("partner_platforms")
      .upsert({
        partner_id: partnerId,
        platform_id: platformId,
        active: platform.active,
        login: platform.login ?? null,
        pass: platform.pass ?? null,
        partner_external_id: platform.partnerId ?? null,
        url: platform.url ?? null,
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => err(error));
  },

  togglePartnerBillingFlag: (partnerId, conceptId, field) => {
    const partner = get().data.partners.find((p) => p.id === partnerId);
    if (!partner) return;
    const current = partner.billing[conceptId] ?? defaultBillingState();
    const newValue = !current[field];

    set((state) => {
      const data = clone(state.data);
      const p = data.partners.find((entry) => entry.id === partnerId);
      if (!p) return {};
      p.billing[conceptId] = p.billing[conceptId] ?? defaultBillingState();
      p.billing[conceptId][field] = newValue;
      stampData(data);
      return { data };
    });

    const dbField = field === "invoiced" ? "invoiced" : field === "live" ? "live" : "verif_done";
    const err = onSyncError(get().showToast);
    supabase
      .from("partner_billing")
      .upsert({ partner_id: partnerId, concept_id: conceptId, [dbField]: newValue, updated_at: new Date().toISOString() })
      .then(({ error }) => err(error));
  },

  setPartnerVerificationCode: (partnerId, conceptId, verif) => {
    set((state) => {
      const data = clone(state.data);
      const partner = data.partners.find((entry) => entry.id === partnerId);
      if (!partner) return {};
      partner.billing[conceptId] = partner.billing[conceptId] ?? defaultBillingState();
      partner.billing[conceptId].verif = verif;
      stampData(data);
      return { data };
    });

    const err = onSyncError(get().showToast);
    supabase
      .from("partner_billing")
      .upsert({ partner_id: partnerId, concept_id: conceptId, verif_code: verif, updated_at: new Date().toISOString() })
      .then(({ error }) => err(error));
  },

  addPartnerEvent: (partnerId, type, text) => {
    if (!text.trim()) return;
    const user = currentUser(get().data);
    const event = {
      id: nextId("evt-"),
      kind: "contact" as const,
      type,
      text,
      at: new Date().toISOString(),
      by: user.name,
    };

    set((state) => {
      const data = clone(state.data);
      const partner = data.partners.find((entry) => entry.id === partnerId);
      if (!partner) return {};
      partner.events.unshift(event);
      stampData(data);
      return { data };
    });

    const err = onSyncError(get().showToast);
    supabase
      .from("events")
      .insert({ id: event.id, partner_id: partnerId, kind: event.kind, type: event.type, text: event.text, by_name: event.by, created_at: event.at })
      .then(({ error }) => err(error));
  },

  createRelation: (input) => {
    const relationId = nextId("R");
    const user = currentUser(get().data);
    const event = {
      id: nextId("evt-"),
      kind: "system" as const,
      type: "system",
      text: "Relatie aangemaakt",
      at: new Date().toISOString(),
      by: user.name,
    };
    const newRelation = {
      id: relationId,
      name: input.name,
      category: input.category,
      contact: input.contact,
      phone: input.phone,
      email: input.email,
      website: input.website,
      notes: input.notes,
      events: [event],
    };

    set((state) => ({
      data: { ...state.data, relations: [newRelation, ...state.data.relations], savedAt: new Date().toISOString() },
      ui: { ...state.ui, modal: { type: null }, selectedRelationId: relationId },
    }));

    const err = onSyncError(get().showToast);
    (async () => {
      const { error: re } = await supabase.from("relations").insert({
        id: relationId,
        name: input.name,
        category_name: input.category,
        contact: input.contact || null,
        phone: input.phone || null,
        email: input.email || null,
        website: input.website || null,
        notes: input.notes || null,
        created_at: new Date().toISOString(),
      });
      err(re);

      const { error: eve } = await supabase.from("events").insert({
        id: event.id, relation_id: relationId, kind: event.kind, type: event.type, text: event.text, by_name: event.by, created_at: event.at,
      });
      err(eve);
    })();
  },

  updateRelation: (relationId, recipe) => {
    set((state) => {
      const data = clone(state.data);
      const relation = data.relations.find((entry) => entry.id === relationId);
      if (!relation) return {};
      recipe(relation);
      stampData(data);
      return { data };
    });

    const relation = get().data.relations.find((r) => r.id === relationId);
    if (!relation) return;
    const err = onSyncError(get().showToast);

    supabase
      .from("relations")
      .update({
        name: relation.name,
        category_name: relation.category,
        contact: relation.contact ?? null,
        phone: relation.phone ?? null,
        email: relation.email ?? null,
        website: relation.website ?? null,
        notes: relation.notes ?? null,
      })
      .eq("id", relationId)
      .then(({ error }) => err(error));
  },

  addRelationEvent: (relationId, type, text) => {
    if (!text.trim()) return;
    const user = currentUser(get().data);
    const event = {
      id: nextId("evt-"),
      kind: "contact" as const,
      type,
      text,
      at: new Date().toISOString(),
      by: user.name,
    };

    set((state) => {
      const data = clone(state.data);
      const relation = data.relations.find((entry) => entry.id === relationId);
      if (!relation) return {};
      relation.events.unshift(event);
      stampData(data);
      return { data };
    });

    const err = onSyncError(get().showToast);
    supabase
      .from("events")
      .insert({ id: event.id, relation_id: relationId, kind: event.kind, type: event.type, text: event.text, by_name: event.by, created_at: event.at })
      .then(({ error }) => err(error));
  },

  sendChatMessage: (text) => {
    if (!text.trim()) return;
    const user = currentUser(get().data);
    const msg = {
      id: nextId("msg-"),
      byId: user.id,
      text: text.trim(),
      at: new Date().toISOString(),
    };

    set((state) => {
      const data = clone(state.data);
      data.chat.push(msg);
      stampData(data);
      return { data };
    });

    const err = onSyncError(get().showToast);
    supabase
      .from("chat_messages")
      .insert({ id: msg.id, by_user_id: user.id, by_user_name: user.name, text: msg.text, created_at: msg.at })
      .then(({ error }) => err(error));
  },

  createTask: (input) => {
    const user = currentUser(get().data);
    const task = {
      id: nextId("task-"),
      title: input.title.trim(),
      desc: input.desc?.trim() ?? "",
      assigneeId: input.assigneeId,
      byId: user.id,
      partnerId: input.partnerId ?? null,
      status: "open" as const,
      at: new Date().toISOString(),
    };

    set((state) => ({
      data: { ...state.data, tasks: [task, ...state.data.tasks], savedAt: new Date().toISOString() },
      ui: { ...state.ui, modal: { type: null } },
    }));

    const err = onSyncError(get().showToast);
    supabase
      .from("tasks")
      .insert({
        id: task.id,
        title: task.title,
        description: task.desc || null,
        assignee_id: input.assigneeId || null,
        created_by_id: user.id || null,
        partner_id: input.partnerId ?? null,
        status: "open",
        created_at: task.at,
      })
      .then(({ error }) => err(error));
  },

  toggleTaskStatus: (taskId) => {
    const task = get().data.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newStatus = task.status === "open" ? "done" : "open";
    const doneAt = newStatus === "done" ? new Date().toISOString() : undefined;

    set((state) => {
      const data = clone(state.data);
      const t = data.tasks.find((entry) => entry.id === taskId);
      if (!t) return {};
      t.status = newStatus;
      t.doneAt = doneAt;
      stampData(data);
      return { data };
    });

    const err = onSyncError(get().showToast);
    supabase
      .from("tasks")
      .update({ status: newStatus, done_at: doneAt ?? null })
      .eq("id", taskId)
      .then(({ error }) => err(error));
  },

  deleteTask: (taskId) => {
    set((state) => {
      const data = clone(state.data);
      data.tasks = data.tasks.filter((t) => t.id !== taskId);
      stampData(data);
      return { data };
    });

    const err = onSyncError(get().showToast);
    supabase.from("tasks").delete().eq("id", taskId).then(({ error }) => err(error));
  },
}));

// Auto-persist UI state to localStorage whenever it changes (while logged in).
// Only saves navigational fields — never saves sensitive data or tokens.
if (typeof window !== "undefined") {
  useCrmStore.subscribe((state, prev) => {
    if (state.ui !== prev.ui && state.data.loggedIn) {
      saveUiState(state.ui);
    }
  });
}
