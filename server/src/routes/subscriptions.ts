import { Router } from "express";
import { SUBSCRIPTION } from "@/constants/apiRoutes";
import {
  planFormSchema,
  invoiceFormSchema,
  assignPlanSchema,
  installmentRowSchema,
} from "@/validations/subscriptionSchema";
import type { TenantType } from "@/types/subscriptions";
import { requireAuth, requireSuperAdmin } from "../auth/middleware.js";
import { asyncHandler, badRequest, ok, parseBody } from "../lib/apiResult.js";
import * as repo from "../db/repositories/subscriptions.js";

export const subscriptionsRouter = Router();
subscriptionsRouter.use(requireAuth, requireSuperAdmin);

// ── Plans ────────────────────────────────────────────────────────────────────
subscriptionsRouter.get(SUBSCRIPTION.plans, asyncHandler(async (_req, res) => ok(res, await repo.listPlanStats())));

subscriptionsRouter.post(
  SUBSCRIPTION.plans,
  asyncHandler(async (req, res) => {
    const data = parseBody(planFormSchema, req.body);
    return ok(res, { id: await repo.createPlan(data) }, 201);
  })
);

subscriptionsRouter.put(
  SUBSCRIPTION.planById(":id"),
  asyncHandler(async (req, res) => {
    const data = parseBody(planFormSchema, req.body);
    await repo.updatePlan(req.params.id, data);
    return ok(res, { id: req.params.id });
  })
);

subscriptionsRouter.delete(
  SUBSCRIPTION.planById(":id"),
  asyncHandler(async (req, res) => {
    await repo.deletePlan(req.params.id);
    return ok(res, { id: req.params.id });
  })
);

// ── Billing records ──────────────────────────────────────────────────────────
subscriptionsRouter.get(
  SUBSCRIPTION.billing,
  asyncHandler(async (req, res) =>
    ok(res, await repo.listBillingRecords({
      status: req.query.status as string | undefined,
      planType: req.query.planType as string | undefined,
    }))
  )
);

subscriptionsRouter.get(
  SUBSCRIPTION.billingCounts,
  asyncHandler(async (_req, res) => ok(res, await repo.getBillingStatusCounts()))
);

subscriptionsRouter.post(
  SUBSCRIPTION.billing,
  asyncHandler(async (req, res) => {
    const data = parseBody(invoiceFormSchema, req.body);
    return ok(res, { id: await repo.createCustomBillingRecord(data) }, 201);
  })
);

subscriptionsRouter.put(
  SUBSCRIPTION.billingById(":id"),
  asyncHandler(async (req, res) => {
    const data = parseBody(invoiceFormSchema, req.body);
    await repo.updateBillingRecord(req.params.id, data);
    return ok(res, { id: req.params.id });
  })
);

subscriptionsRouter.post(
  SUBSCRIPTION.billingMarkPaid(":id"),
  asyncHandler(async (req, res) => {
    await repo.markBillingRecordPaid(req.params.id);
    return ok(res, { id: req.params.id });
  })
);

subscriptionsRouter.delete(
  SUBSCRIPTION.billingById(":id"),
  asyncHandler(async (req, res) => {
    await repo.deleteBillingRecord(req.params.id);
    return ok(res, { id: req.params.id });
  })
);

// ── Tenant assignment ────────────────────────────────────────────────────────
subscriptionsRouter.get(
  SUBSCRIPTION.assignmentState(":type", ":id"),
  asyncHandler(async (req, res) => {
    const type = req.params.type as TenantType;
    return ok(res, await repo.getTenantAssignmentState(type, req.params.id));
  })
);

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
    const data = parseBody(assignPlanSchema, req.body?.data);
    const installments = (req.body?.installments ?? []) as unknown[];
    if (!installments.length) throw badRequest("At least one payment installment is required");
    const parsedInstallments = installments.map((row) => parseBody(installmentRowSchema, row));
    const result = await repo.assignPlanToTenant(data, parsedInstallments);
    if (!result.ok) throw badRequest(result.error);
    return ok(res, { id: result.id }, 201);
  })
);
