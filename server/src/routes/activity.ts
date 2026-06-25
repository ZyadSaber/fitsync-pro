import { Router } from "express";
import { ACTIVITY } from "@/constants/apiRoutes";
import { requireAuth, requireSuperAdmin } from "../auth/middleware.js";
import { asyncHandler, ok, queryParams } from "../lib/apiResult.js";
import * as repo from "../db/repositories/activity.js";

export const activityRouter = Router();
activityRouter.use(requireAuth, requireSuperAdmin);

// GET /api/activity?gym=&coach=&event=&from=&to=&search=
activityRouter.get(
  ACTIVITY.root,
  asyncHandler(async (req, res) =>
    ok(res, await repo.getActivityPageData(queryParams(req, "gym", "coach", "event", "from", "to", "search")))
  )
);
