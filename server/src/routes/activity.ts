import { Router } from "express";
import { ACTIVITY } from "@/constants/apiRoutes";
import { activityFiltersSchema } from "@/validations/activitySchema";
import { requireAuth, requireSuperAdmin } from "../auth/middleware.js";
import { asyncHandler, ok, parseBody } from "../lib/apiResult.js";
import * as repo from "../db/repositories/activity.js";

export const activityRouter = Router();
activityRouter.use(requireAuth, requireSuperAdmin);

// GET /api/activity?gym=&coach=&event=&from=&to=&search=
activityRouter.get(
  ACTIVITY.root,
  asyncHandler(async (req, res) => {
    const filters = parseBody(activityFiltersSchema, req.query);
    return ok(res, await repo.getActivityPageData(filters));
  })
);
