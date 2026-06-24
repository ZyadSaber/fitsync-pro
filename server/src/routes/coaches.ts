import { Router } from "express";
import { COACH } from "@/constants/apiRoutes";
import { coachFormSchema, createCoachSchema } from "@/validations/coachSchema";
import { requireAuth, requireSuperAdmin } from "../auth/middleware.js";
import { asyncHandler, badRequest, ok, parseBody, queryParams } from "../lib/apiResult.js";
import * as repo from "../db/repositories/coaches.js";

export const coachesRouter = Router();
coachesRouter.use(requireAuth, requireSuperAdmin);

// GET /api/coaches?search=&plan=&active=
coachesRouter.get(
  COACH.root,
  asyncHandler(async (req, res) =>
    ok(res, await repo.listCoaches(queryParams(req, "search", "plan", "active")))
  )
);

// GET /api/coaches/plan-options
coachesRouter.get(
  COACH.planOptions,
  asyncHandler(async (_req, res) => ok(res, await repo.listActiveCoachPlanOptions()))
);

// GET /api/coaches/non-coaches
coachesRouter.get(
  COACH.nonCoaches,
  asyncHandler(async (_req, res) => ok(res, await repo.listNonCoachUsers()))
);

// GET /api/coaches/:coachId/subscription
coachesRouter.get(
  COACH.subscription(":coachId"),
  asyncHandler(async (req, res) => ok(res, await repo.getCoachSubscription(req.params.coachId)))
);

// GET /api/coaches/:coachId/billing
coachesRouter.get(
  COACH.billing(":coachId"),
  asyncHandler(async (req, res) => ok(res, await repo.getCoachBilling(req.params.coachId)))
);

// POST /api/coaches  (create a brand-new online coach)
coachesRouter.post(
  COACH.root,
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
  COACH.promote(":profileId"),
  asyncHandler(async (req, res) => {
    await repo.promoteToCoach(req.params.profileId);
    return ok(res, { id: req.params.profileId });
  })
);

// PUT /api/coaches/:coachId   body: { profile_id, ...coachForm }
coachesRouter.put(
  COACH.byId(":coachId"),
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
  COACH.byId(":coachId"),
  asyncHandler(async (req, res) => {
    await repo.deleteCoach(req.params.coachId);
    return ok(res, { id: req.params.coachId });
  })
);
