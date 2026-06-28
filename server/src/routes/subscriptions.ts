import { Router } from "express";
import { SUBSCRIPTION } from "@/constants/apiRoutes";
import type { TenantType } from "@/types/subscriptions";
import { requireAuth, requireSuperAdmin } from "../auth/middleware.js";
import { asyncHandler, badRequest, ok, queryParams } from "../lib/apiResult.js";
import * as repo from "../db/repositories/subscriptions.js";

export const subscriptionsRouter = Router();
subscriptionsRouter.use(requireAuth, requireSuperAdmin);

// ── Plans ────────────────────────────────────────────────────────────────────
// GET /api/subscriptions/plans
subscriptionsRouter.get(SUBSCRIPTION.plans, asyncHandler(async (_req, res) => ok(res, await repo.listPlanStats())));

// POST /api/subscriptions/plans
subscriptionsRouter.post(
  SUBSCRIPTION.plans,
  asyncHandler(async (req, res) => ok(res, { id: await repo.createPlan(req.body) }, 201))
);

// PUT /api/subscriptions/plans/:id
subscriptionsRouter.put(
  SUBSCRIPTION.planById(":id"),
  asyncHandler(async (req, res) =>
    ok(res, await repo.updatePlan(req.params.id, req.body))
  )
);

subscriptionsRouter.get(
  SUBSCRIPTION.planOptions,
  asyncHandler(async (_req, res) => ok(res, await repo.listActiveSubscriptionPlanOptions()))
);

// DELETE /api/subscriptions/plans/:id
subscriptionsRouter.delete(
  SUBSCRIPTION.planById(":id"),
  asyncHandler(async (req, res) => {
    await repo.deletePlan(req.params.id);
    return ok(res, { id: req.params.id });
  })
);

// ── Billing records ──────────────────────────────────────────────────────────
// GET /api/subscriptions/billing?status=&planType=
subscriptionsRouter.get(
  SUBSCRIPTION.billing,
  asyncHandler(async (req, res) => ok(res, await repo.listBillingRecords(queryParams(req, "status", "planType"))))
);

// GET /api/subscriptions/billing/counts
subscriptionsRouter.get(
  SUBSCRIPTION.billingCounts,
  asyncHandler(async (_req, res) => ok(res, await repo.getBillingStatusCounts()))
);

// POST /api/subscriptions/billing
subscriptionsRouter.post(
  SUBSCRIPTION.billing,
  asyncHandler(async (req, res) => ok(res, { id: await repo.createCustomBillingRecord(req.body) }, 201))
);

// PUT /api/subscriptions/billing/:id
subscriptionsRouter.put(
  SUBSCRIPTION.billingById(":id"),
  asyncHandler(async (req, res) => {
    await repo.updateBillingRecord(req.params.id, req.body);
    return ok(res, { id: req.params.id });
  })
);

// POST /api/subscriptions/billing/:id/mark-paid
subscriptionsRouter.post(
  SUBSCRIPTION.billingMarkPaid(":id"),
  asyncHandler(async (req, res) => {
    await repo.markBillingRecordPaid(req.params.id);
    return ok(res, { id: req.params.id });
  })
);

// DELETE /api/subscriptions/billing/:id
subscriptionsRouter.delete(
  SUBSCRIPTION.billingById(":id"),
  asyncHandler(async (req, res) => {
    await repo.deleteBillingRecord(req.params.id);
    return ok(res, { id: req.params.id });
  })
);

// ── Tenant assignment ────────────────────────────────────────────────────────
// GET /api/subscriptions/tenant/:type/:id/assignment-state
subscriptionsRouter.get(
  SUBSCRIPTION.assignmentState(":type", ":id"),
  asyncHandler(async (req, res) => {
    const type = req.params.type as TenantType;
    return ok(res, await repo.getTenantAssignmentState(type, req.params.id));
  })
);

// GET /api/subscriptions/coach-options
subscriptionsRouter.get(
  SUBSCRIPTION.coachOptions,
  asyncHandler(async (_req, res) => ok(res, await repo.listCoachSelectOptions()))
);

// GET /api/subscriptions/gym/:gymId/active  → { id } | null
subscriptionsRouter.get(
  SUBSCRIPTION.gymActive(":gymId"),
  asyncHandler(async (req, res) => ok(res, await repo.getActiveSubscriptionIdForGym(req.params.gymId)))
);

// POST /api/subscriptions/assign-plan   body: { data, installments }
subscriptionsRouter.post(
  SUBSCRIPTION.assignPlan,
  asyncHandler(async (req, res) => {
    const installments = req.body?.installments ?? [];
    if (!installments.length) throw badRequest("At least one payment installment is required");
    const result = await repo.assignPlanToTenant(req.body?.data, installments);
    if (!result.ok) throw badRequest(result.error);
    return ok(res, { id: result.id }, 201);
  })
);
