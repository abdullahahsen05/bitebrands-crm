"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEY } from "./constants";
import { syncConceptLiveState } from "./calculations";
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

type CrmStore = {
  data: CrmData;
  ui: UiState;
  loginError: string | null;
  login: (userId: string, password: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  setView: (view: CrmView) => void;
  setFilters: (filters: Partial<UiState["filters"]>) => void;
  setAdminTab: (adminTab: string) => void;
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

const initialData = createInitialData();

function createUiState(): UiState {
  return {
    view: "list",
    filters: {
      query: "",
      country: "all",
      concept: "all",
      phase: "all",
    },
    selectedPartnerId: null,
    selectedRelationId: null,
    adminTab: "landen",
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
  return `${prefix}${Math.random().toString(36).slice(2, 8)}`;
}

function defaultBillingState() {
  return {
    invoiced: false,
    live: false,
    verifDone: false,
    verif: "",
  };
}

function createResetData(currentData: CrmData) {
  const nextData = createInitialData();
  const hasCurrentUser = nextData.users.some((user) => user.id === currentData.currentUserId);

  nextData.loggedIn = currentData.loggedIn;
  nextData.currentUserId = hasCurrentUser ? currentData.currentUserId : nextData.currentUserId;

  return nextData;
}

export const useCrmStore = create<CrmStore>()(
  persist(
    (set) => ({
      data: initialData,
      ui: createUiState(),
      loginError: null,
      login: (userId, password) => {
        let isValid = false;

        set((state) => {
          const user = state.data.users.find((entry) => entry.id === userId);
          if (!user || user.pw !== password) {
            return { loginError: "Onjuist wachtwoord." };
          }

          isValid = true;
          return {
            loginError: null,
            data: {
              ...state.data,
              currentUserId: userId,
              loggedIn: true,
            },
          };
        });

        return isValid;
      },
      logout: () =>
        set((state) => ({
          data: {
            ...state.data,
            loggedIn: false,
          },
          ui: {
            ...state.ui,
            userMenuOpen: false,
          },
        })),
      switchUser: (userId) =>
        set((state) => ({
          data: {
            ...state.data,
            currentUserId: userId,
          },
          ui: {
            ...state.ui,
            userMenuOpen: false,
          },
        })),
      setView: (view) =>
        set((state) => ({
          ui: {
            ...state.ui,
            view,
            mobileNavOpen: false,
          },
        })),
      setFilters: (filters) =>
        set((state) => ({
          ui: {
            ...state.ui,
            filters: {
              ...state.ui.filters,
              ...filters,
            },
          },
        })),
      setAdminTab: (adminTab) =>
        set((state) => ({
          ui: {
            ...state.ui,
            adminTab,
          },
        })),
      openPartner: (partnerId) =>
        set((state) => ({
          ui: {
            ...state.ui,
            selectedPartnerId: partnerId,
            selectedRelationId: null,
          },
        })),
      closePartner: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            selectedPartnerId: null,
          },
        })),
      openRelation: (relationId) =>
        set((state) => ({
          ui: {
            ...state.ui,
            selectedRelationId: relationId,
            selectedPartnerId: null,
          },
        })),
      closeRelation: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            selectedRelationId: null,
          },
        })),
      openModal: (modal) =>
        set((state) => ({
          ui: {
            ...state.ui,
            modal,
          },
        })),
      closeModal: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            modal: { type: null },
          },
        })),
      toggleUserMenu: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            userMenuOpen: !state.ui.userMenuOpen,
          },
        })),
      closeUserMenu: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            userMenuOpen: false,
          },
        })),
      toggleMobileNav: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            mobileNavOpen: !state.ui.mobileNavOpen,
          },
        })),
      closeMobileNav: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            mobileNavOpen: false,
          },
        })),
      showToast: (message) =>
        set((state) => ({
          ui: {
            ...state.ui,
            toast: {
              id: nextId("toast-"),
              message,
            },
          },
        })),
      clearToast: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            toast: null,
          },
        })),
      resetDemoData: () =>
        set((state) => ({
          data: createResetData(state.data),
          ui: createUiState(),
          loginError: null,
        })),
      updateConfig: (recipe) =>
        set((state) => {
          const data = clone(state.data);
          recipe(data.config);
          stampData(data);
          return { data };
        }),
      updateUsers: (recipe) =>
        set((state) => {
          const data = clone(state.data);
          recipe(data.users);
          stampData(data);
          return { data };
        }),
      createPartner: (input) =>
        set((state) => {
          const data = clone(state.data);
          const partnerId = `P${String(data.partners.length + 1).padStart(3, "0")}`;
          const general = Object.fromEntries(
            data.config.steps.filter((step) => step.general).map((step) => [step.id, false]),
          );
          const steps = Object.fromEntries(
            input.concepts.map((conceptId) => [
              conceptId,
              Object.fromEntries(
                data.config.steps.filter((step) => !step.general).map((step) => [step.id, false]),
              ),
            ]),
          );
          const billing = Object.fromEntries(
            input.concepts.map((conceptId) => [conceptId, defaultBillingState()]),
          );
          const platforms = Object.fromEntries(
            data.config.platforms.map((platform) => [
              platform.id,
              platform.kind === "web"
                ? { active: false, url: "" }
                : {
                    active: false,
                    login: "",
                    pass: "demo123", // TODO: replace demo credentials with secure storage in the backend phase.
                    partnerId: "",
                  },
            ]),
          );

          data.partners.unshift({
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
                by: currentUser(data).name,
              },
            ],
            createdAt: new Date().toISOString(),
          });
          stampData(data);

          return {
            data,
            ui: {
              ...state.ui,
              modal: { type: null },
              selectedPartnerId: partnerId,
            },
          };
        }),
      updatePartner: (partnerId, recipe) =>
        set((state) => {
          const data = clone(state.data);
          const partner = data.partners.find((entry) => entry.id === partnerId);
          if (!partner) {
            return {};
          }
          recipe(partner);
          stampData(data);
          return { data };
        }),
      togglePartnerConcept: (partnerId, conceptId) =>
        set((state) => {
          const data = clone(state.data);
          const partner = data.partners.find((entry) => entry.id === partnerId);
          if (!partner) {
            return {};
          }

          const exists = partner.concepts.includes(conceptId);
          if (exists) {
            partner.concepts = partner.concepts.filter((entry) => entry !== conceptId);
            delete partner.steps[conceptId];
            delete partner.billing[conceptId];
          } else {
            partner.concepts.push(conceptId);
            partner.steps[conceptId] = Object.fromEntries(
              data.config.steps.filter((step) => !step.general).map((step) => [step.id, false]),
            );
            partner.billing[conceptId] = defaultBillingState();
          }

          stampData(data);
          return { data };
        }),
      toggleGeneralStep: (partnerId, stepId) =>
        set((state) => {
          const data = clone(state.data);
          const partner = data.partners.find((entry) => entry.id === partnerId);
          if (!partner) {
            return {};
          }
          partner.general[stepId] = !partner.general[stepId];
          stampData(data);
          return { data };
        }),
      toggleConceptStep: (partnerId, conceptId, stepId) =>
        set((state) => {
          const data = clone(state.data);
          const partnerIndex = data.partners.findIndex((entry) => entry.id === partnerId);
          if (partnerIndex === -1) {
            return {};
          }

          const partner = data.partners[partnerIndex];
          partner.steps[conceptId] = partner.steps[conceptId] ?? {};
          const isLive = !partner.steps[conceptId][stepId];
          partner.steps[conceptId][stepId] = isLive;

          if (stepId === "live") {
            data.partners[partnerIndex] = syncConceptLiveState(partner, conceptId, isLive);
          }

          stampData(data);
          return { data };
        }),
      updatePartnerPlatform: (partnerId, platformId, recipe) =>
        set((state) => {
          const data = clone(state.data);
          const partner = data.partners.find((entry) => entry.id === partnerId);
          if (!partner) {
            return {};
          }
          const platform = partner.platforms[platformId];
          if (!platform) {
            return {};
          }
          recipe(platform);
          stampData(data);
          return { data };
        }),
      togglePartnerBillingFlag: (partnerId, conceptId, field) =>
        set((state) => {
          const data = clone(state.data);
          const partner = data.partners.find((entry) => entry.id === partnerId);
          if (!partner) {
            return {};
          }
          partner.billing[conceptId] = partner.billing[conceptId] ?? defaultBillingState();
          partner.billing[conceptId][field] = !partner.billing[conceptId][field];
          stampData(data);
          return { data };
        }),
      setPartnerVerificationCode: (partnerId, conceptId, verif) =>
        set((state) => {
          const data = clone(state.data);
          const partner = data.partners.find((entry) => entry.id === partnerId);
          if (!partner) {
            return {};
          }
          partner.billing[conceptId] = partner.billing[conceptId] ?? defaultBillingState();
          partner.billing[conceptId].verif = verif;
          stampData(data);
          return { data };
        }),
      addPartnerEvent: (partnerId, type, text) =>
        set((state) => {
          const data = clone(state.data);
          const partner = data.partners.find((entry) => entry.id === partnerId);
          if (!partner || !text.trim()) {
            return {};
          }
          partner.events.unshift({
            id: nextId("evt-"),
            kind: "contact",
            type,
            text,
            at: new Date().toISOString(),
            by: currentUser(data).name,
          });
          stampData(data);
          return { data };
        }),
      createRelation: (input) =>
        set((state) => {
          const data = clone(state.data);
          const relationId = `R${String(data.relations.length + 1).padStart(3, "0")}`;
          data.relations.unshift({
            id: relationId,
            name: input.name,
            category: input.category,
            contact: input.contact,
            phone: input.phone,
            email: input.email,
            website: input.website,
            notes: input.notes,
            events: [
              {
                id: nextId("evt-"),
                kind: "system",
                type: "system",
                text: "Relatie aangemaakt",
                at: new Date().toISOString(),
                by: currentUser(data).name,
              },
            ],
          });
          stampData(data);
          return {
            data,
            ui: {
              ...state.ui,
              modal: { type: null },
              selectedRelationId: relationId,
            },
          };
        }),
      updateRelation: (relationId, recipe) =>
        set((state) => {
          const data = clone(state.data);
          const relation = data.relations.find((entry) => entry.id === relationId);
          if (!relation) {
            return {};
          }
          recipe(relation);
          stampData(data);
          return { data };
        }),
      addRelationEvent: (relationId, type, text) =>
        set((state) => {
          const data = clone(state.data);
          const relation = data.relations.find((entry) => entry.id === relationId);
          if (!relation || !text.trim()) {
            return {};
          }
          relation.events.unshift({
            id: nextId("evt-"),
            kind: "contact",
            type,
            text,
            at: new Date().toISOString(),
            by: currentUser(data).name,
          });
          stampData(data);
          return { data };
        }),
      sendChatMessage: (text) =>
        set((state) => {
          const data = clone(state.data);
          if (!text.trim()) {
            return {};
          }
          data.chat.push({
            id: nextId("msg-"),
            byId: currentUser(data).id,
            text: text.trim(),
            at: new Date().toISOString(),
          });
          stampData(data);
          return { data };
        }),
      createTask: (input) =>
        set((state) => {
          const data = clone(state.data);
          data.tasks.unshift({
            id: nextId("task-"),
            title: input.title.trim(),
            desc: input.desc?.trim() ?? "",
            assigneeId: input.assigneeId,
            byId: currentUser(data).id,
            partnerId: input.partnerId ?? null,
            status: "open",
            at: new Date().toISOString(),
          });
          stampData(data);
          return {
            data,
            ui: {
              ...state.ui,
              modal: { type: null },
            },
          };
        }),
      toggleTaskStatus: (taskId) =>
        set((state) => {
          const data = clone(state.data);
          const task = data.tasks.find((entry) => entry.id === taskId);
          if (!task) {
            return {};
          }
          task.status = task.status === "open" ? "done" : "open";
          task.doneAt = task.status === "done" ? new Date().toISOString() : undefined;
          stampData(data);
          return { data };
        }),
      deleteTask: (taskId) =>
        set((state) => {
          const data = clone(state.data);
          data.tasks = data.tasks.filter((task) => task.id !== taskId);
          stampData(data);
          return { data };
        }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        data: state.data,
      }),
    },
  ),
);
