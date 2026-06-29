import { describe, expect, test, vi } from "vitest";

// Mock Supabase so tests never make real network calls.
vi.mock("../src/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({}),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
  },
}));

vi.mock("../src/lib/supabase/loader", () => ({
  loadAllData: vi.fn().mockResolvedValue(null),
}));

import { useCrmStore } from "../src/lib/crm-store";
import { createInitialData } from "../src/lib/mock-data";

describe("crm store", () => {
  test("resetting demo data restores seed data without logging the user out", () => {
    const initialData = createInitialData();

    useCrmStore.setState({
      data: {
        ...initialData,
        currentUserId: "u3",
        loggedIn: true,
        partners: [],
      },
      ui: {
        view: "team",
        filters: {
          query: "Berlin",
          country: "DE",
          concept: "tasty",
          phase: "new",
        },
        selectedPartnerId: "P006",
        selectedRelationId: "R001",
        adminTab: "instellingen",
        modal: { type: "task" },
        toast: {
          id: "toast-1",
          message: "oude melding",
        },
        userMenuOpen: true,
        mobileNavOpen: true,
      },
      loginError: "Onjuist wachtwoord.",
    });

    useCrmStore.getState().resetDemoData();

    const nextState = useCrmStore.getState();

    expect(nextState.data.loggedIn).toBe(true);
    expect(nextState.data.currentUserId).toBe("u3");
    expect(nextState.data.partners).toHaveLength(initialData.partners.length);
    expect(nextState.loginError).toBeNull();
    expect(nextState.ui).toEqual({
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
    });
  });
});
