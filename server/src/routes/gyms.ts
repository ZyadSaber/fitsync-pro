import { Router } from "express";
import { gymSchema, billingStatusSchema } from "@/validations/gymSchema";
import { requireAuth, requireSuperAdmin } from "../auth/middleware.js";
import { asyncHandler, ok, parseBody } from "../lib/apiResult.js";
import * as repo from "../db/repositories/gyms.js";

export const gymsRouter = Router();
gymsRouter.use(requireAuth, requireSuperAdmin);

// GET /api/gyms
gymsRouter.get("/", asyncHandler(async (_req, res) => ok(res, await repo.listGyms())));

// GET /api/gyms/plan-options
gymsRouter.get(
  "/plan-options",
  asyncHandler(async (_req, res) => ok(res, await repo.listActiveSubscriptionPlanOptions()))
);

// GET /api/gyms/owner-options
gymsRouter.get(
  "/owner-options",
  asyncHandler(async (_req, res) => ok(res, await repo.listGymOwnerOptions()))
);

// POST /api/gyms
gymsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = parseBody(gymSchema, req.body);
    const id = await repo.createGym(data, req.user!.id);
    return ok(res, { id }, 201);
  })
);

// PUT /api/gyms/:id
gymsRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = parseBody(gymSchema, req.body);
    await repo.updateGym(req.params.id, data);
    return ok(res, { id: req.params.id });
  })
);

// DELETE /api/gyms/:id
gymsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await repo.deleteGym(req.params.id);
    return ok(res, { id: req.params.id });
  })
);

// GET /api/gyms/:id/subscription
gymsRouter.get(
  "/:id/subscription",
  asyncHandler(async (req, res) => ok(res, await repo.getGymSubscription(req.params.id)))
);

// GET /api/gyms/:id/billing
gymsRouter.get(
  "/:id/billing",
  asyncHandler(async (req, res) => ok(res, await repo.getGymBillingHistory(req.params.id)))
);

// POST /api/gyms/:id/billing
gymsRouter.post(
  "/:id/billing",
  asyncHandler(async (req, res) => {
    const record = await repo.createBillingRecord({ ...req.body, gym_id: req.params.id });
    return ok(res, record, 201);
  })
);

// PATCH /api/gyms/:id/billing/:recordId/status
gymsRouter.patch(
  "/:id/billing/:recordId/status",
  asyncHandler(async (req, res) => {
    const { status, paidAt } = parseBody(billingStatusSchema, req.body);
    await repo.updateBillingRecordStatus(req.params.recordId, status, paidAt);
    return ok(res, { id: req.params.recordId });
  })
);
