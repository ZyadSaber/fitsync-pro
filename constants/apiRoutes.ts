/**
 * Single source of truth for REST endpoint paths, shared by the Express server
 * and the dashboard client. Rename a route here once and both sides follow.
 *
 * - The server mounts routers at `API_BASE.*` and registers the relative
 *   patterns below (passing express tokens like ":id").
 * - The client uses the `API` object, which joins `API_BASE` + the relative
 *   pattern into a full path (the api client prepends `API_PREFIX`).
 *
 * Parameterized segments are builder functions that interpolate whatever token
 * is passed, so the SAME definition serves the express pattern (pass ":id") and
 * client interpolation (pass the real value).
 */

// ── Prefix + resource mounts ──────────────────────────────────────────────────
export const API_PREFIX = "/api";

export const API_BASE = {
  auth: "/auth",
  gyms: "/gyms",
  gymsMutations: "/gyms_mutations",
  coaches: "/coaches",
  subscriptions: "/subscriptions",
  admin: "/admin",
  activity: "/activity",
} as const;

// ── Relative-to-mount route patterns (registered by the Express routers) ───────
export const AUTH = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  refresh: "/refresh",
  revalidate: "/revalidate",
  signOut: "/sign-out",
  me: "/me",
} as const;

export const GYM = {
  root: "/",
  planOptions: "/plan-options",
  ownerOptions: "/owner-options",
  subscription: (id: string) => `/${id}/subscription`,
  billing: (id: string) => `/${id}/billing`,
  billingStatus: (id: string, recordId: string) => `/${id}/billing/${recordId}/status`,
} as const;

// Gym write endpoints live under their own mount (`/gyms_mutations`), separate
// from the read/list routes on `/gyms`.
export const GYM_MUTATIONS = {
  root: "/",
  byId: (id: string) => `/${id}`,
} as const;

export const COACH = {
  root: "/",
  planOptions: "/plan-options",
  nonCoaches: "/non-coaches",
  subscription: (id: string) => `/${id}/subscription`,
  billing: (id: string) => `/${id}/billing`,
  promote: (id: string) => `/${id}/promote`,
  byId: (id: string) => `/${id}`,
} as const;

export const SUBSCRIPTION = {
  plans: "/plans",
  planById: (id: string) => `/plans/${id}`,
  billing: "/billing",
  billingCounts: "/billing/counts",
  billingById: (id: string) => `/billing/${id}`,
  billingMarkPaid: (id: string) => `/billing/${id}/mark-paid`,
  assignmentState: (type: string, id: string) => `/tenant/${type}/${id}/assignment-state`,
  coachOptions: "/coach-options",
  gymActive: (gymId: string) => `/gym/${gymId}/active`,
  assignPlan: "/assign-plan",
} as const;

export const ADMIN = { dashboard: "/dashboard" } as const;
export const ACTIVITY = { root: "/" } as const;

// ── Client-facing FULL paths (relative to /api, prepended by lib/api.ts) ───────
export const API = {
  auth: {
    signIn: API_BASE.auth + AUTH.signIn,
    signUp: API_BASE.auth + AUTH.signUp,
    refresh: API_BASE.auth + AUTH.refresh,
    revalidate: API_BASE.auth + AUTH.revalidate,
    signOut: API_BASE.auth + AUTH.signOut,
    me: API_BASE.auth + AUTH.me,
  },
  gyms: {
    list: (filters?: { search?: string; plan?: string; status?: string }) => {
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.plan) params.set("plan", filters.plan);
      if (filters?.status) params.set("status", filters.status);
      const qs = params.toString();
      return qs ? `${API_BASE.gyms}?${qs}` : API_BASE.gyms;
    },
    create: API_BASE.gymsMutations + GYM_MUTATIONS.root,
    planOptions: API_BASE.gyms + GYM.planOptions,
    ownerOptions: API_BASE.gyms + GYM.ownerOptions,
    byId: (id: string) => API_BASE.gymsMutations + GYM_MUTATIONS.byId(id),
    subscription: (id: string) => API_BASE.gyms + GYM.subscription(id),
    billing: (id: string) => API_BASE.gyms + GYM.billing(id),
    billingStatus: (id: string, recordId: string) =>
      API_BASE.gyms + GYM.billingStatus(id, recordId),
  },
  coaches: {
    list: (filters?: { search?: string; plan?: string; active?: string }) => {
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.plan) params.set("plan", filters.plan);
      if (filters?.active) params.set("active", filters.active);
      const qs = params.toString();
      return qs ? `${API_BASE.coaches}?${qs}` : API_BASE.coaches;
    },
    planOptions: API_BASE.coaches + COACH.planOptions,
    nonCoaches: API_BASE.coaches + COACH.nonCoaches,
    subscription: (id: string) => API_BASE.coaches + COACH.subscription(id),
    billing: (id: string) => API_BASE.coaches + COACH.billing(id),
    promote: (id: string) => API_BASE.coaches + COACH.promote(id),
    byId: (id: string) => API_BASE.coaches + COACH.byId(id),
  },
  subscriptions: {
    plans: API_BASE.subscriptions + SUBSCRIPTION.plans,
    planById: (id: string) => API_BASE.subscriptions + SUBSCRIPTION.planById(id),
    billing: API_BASE.subscriptions + SUBSCRIPTION.billing,
    billingCounts: API_BASE.subscriptions + SUBSCRIPTION.billingCounts,
    billingById: (id: string) => API_BASE.subscriptions + SUBSCRIPTION.billingById(id),
    billingMarkPaid: (id: string) => API_BASE.subscriptions + SUBSCRIPTION.billingMarkPaid(id),
    assignmentState: (type: string, id: string) =>
      API_BASE.subscriptions + SUBSCRIPTION.assignmentState(type, id),
    coachOptions: API_BASE.subscriptions + SUBSCRIPTION.coachOptions,
    gymActive: (gymId: string) => API_BASE.subscriptions + SUBSCRIPTION.gymActive(gymId),
    assignPlan: API_BASE.subscriptions + SUBSCRIPTION.assignPlan,
  },
  admin: { dashboard: API_BASE.admin + ADMIN.dashboard },
  activity: { root: API_BASE.activity },
} as const;
