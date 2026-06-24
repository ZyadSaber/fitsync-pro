import { Router } from "express";
import { GYM } from "@/constants/apiRoutes";
import { billingStatusSchema } from "@/validations/gymSchema";
import { requireAuth, requireSuperAdmin } from "../auth/middleware.js";
import { asyncHandler, ok, parseBody, queryParams } from "../lib/apiResult.js";
import * as repo from "../db/repositories/gyms.js";

export const gymsRouter = Router();
gymsRouter.use(requireAuth, requireSuperAdmin);

// GET /api/gyms?search=&plan=&status=
gymsRouter.get(
  GYM.root,
  asyncHandler(async (req, res) =>
    ok(res, await repo.listGyms(queryParams(req, "search", "plan", "status")))
  )
);

// GET /api/gyms/plan-options
gymsRouter.get(
  GYM.planOptions,
  asyncHandler(async (_req, res) => ok(res, await repo.listActiveSubscriptionPlanOptions()))
);

// GET /api/gyms/owner-options
gymsRouter.get(
  GYM.ownerOptions,
  asyncHandler(async (_req, res) => ok(res, await repo.listGymOwnerOptions()))
);

// GET /api/gyms/:id/subscription
gymsRouter.get(
  GYM.subscription(":id"),
  asyncHandler(async (req, res) => ok(res, await repo.getGymSubscription(req.params.id)))
);

// GET /api/gyms/:id/billing
gymsRouter.get(
  GYM.billing(":id"),
  asyncHandler(async (req, res) => ok(res, await repo.getGymBillingHistory(req.params.id)))
);

// POST /api/gyms/:id/billing
gymsRouter.post(
  GYM.billing(":id"),
  asyncHandler(async (req, res) => {
    const record = await repo.createBillingRecord({ ...req.body, gym_id: req.params.id });
    return ok(res, record, 201);
  })
);

// PATCH /api/gyms/:id/billing/:recordId/status
gymsRouter.patch(
  GYM.billingStatus(":id", ":recordId"),
  asyncHandler(async (req, res) => {
    const { status, paidAt } = parseBody(billingStatusSchema, req.body);
    await repo.updateBillingRecordStatus(req.params.recordId, status, paidAt);
    return ok(res, { id: req.params.recordId });
  })
);
