import { Router } from "express";
import { coachFormSchema, createCoachSchema } from "@/validations/coachSchema";
import { requireAuth, requireSuperAdmin } from "../auth/middleware.js";
import { asyncHandler, badRequest, ok, parseBody } from "../lib/apiResult.js";
import * as repo from "../db/repositories/coaches.js";

export const coachesRouter = Router();
coachesRouter.use(requireAuth, requireSuperAdmin);

// GET /api/coaches
coachesRouter.get("/", asyncHandler(async (_req, res) => ok(res, await repo.listCoaches())));

// GET /api/coaches/plan-options
coachesRouter.get(
  "/plan-options",
  asyncHandler(async (_req, res) => ok(res, await repo.listActiveCoachPlanOptions()))
);

// GET /api/coaches/non-coaches
coachesRouter.get(
  "/non-coaches",
  asyncHandler(async (_req, res) => ok(res, await repo.listNonCoachUsers()))
);

// GET /api/coaches/:coachId/subscription
coachesRouter.get(
  "/:coachId/subscription",
  asyncHandler(async (req, res) => ok(res, await repo.getCoachSubscription(req.params.coachId)))
);

// GET /api/coaches/:coachId/billing
coachesRouter.get(
  "/:coachId/billing",
  asyncHandler(async (req, res) => ok(res, await repo.getCoachBilling(req.params.coachId)))
);

// POST /api/coaches  (create a brand-new online coach)
coachesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = parseBody(createCoachSchema, req.body);
    if (await repo.emailExists(data.email)) throw badRequest("Email already registered");
    const id = await repo.createCoach({
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      bio: data.bio,
      specialties: data.specialties,
    });
    return ok(res, { id }, 201);
  })
);

// POST /api/coaches/:profileId/promote
coachesRouter.post(
  "/:profileId/promote",
  asyncHandler(async (req, res) => {
    await repo.promoteToCoach(req.params.profileId);
    return ok(res, { id: req.params.profileId });
  })
);

// PUT /api/coaches/:coachId   body: { profile_id, ...coachForm }
coachesRouter.put(
  "/:coachId",
  asyncHandler(async (req, res) => {
    const profileId = req.body?.profile_id as string | undefined;
    if (!profileId) throw badRequest("profile_id is required");
    const data = parseBody(coachFormSchema, req.body);
    await repo.updateCoach(req.params.coachId, profileId, data);
    return ok(res, { id: req.params.coachId });
  })
);

// DELETE /api/coaches/:coachId
coachesRouter.delete(
  "/:coachId",
  asyncHandler(async (req, res) => {
    await repo.deleteCoach(req.params.coachId);
    return ok(res, { id: req.params.coachId });
  })
);
