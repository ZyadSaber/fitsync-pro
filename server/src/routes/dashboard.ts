import { Router } from "express";
import { ADMIN } from "@/constants/apiRoutes";
import { requireAuth, requireRole } from "../auth/middleware.js";
import { asyncHandler, ok } from "../lib/apiResult.js";
import { getAdminDashboardData } from "../db/repositories/dashboard.js";

export const dashboardRouter = Router();

// GET /api/admin/dashboard  (gym admins only)
dashboardRouter.get(
  ADMIN.dashboard,
  requireAuth,
  requireRole("gym"),
  asyncHandler(async (req, res) => {
    const gymId = req.user!.gymId ?? "";
    return ok(res, await getAdminDashboardData(gymId));
  })
);
