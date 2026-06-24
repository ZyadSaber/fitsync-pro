import { Router } from "express";
import { GYM_MUTATIONS } from "@/constants/apiRoutes";
import { gymSchema } from "@/validations/gymSchema";
import { requireAuth, requireSuperAdmin } from "../auth/middleware.js";
import { asyncHandler, ok, parseBody } from "../lib/apiResult.js";
import * as repo from "../db/repositories/gyms.js";

// Gym write endpoints, mounted at /api/gyms_mutations (separate from the
// read/list routes on /api/gyms).
export const gymsMutationsRouter = Router();
gymsMutationsRouter.use(requireAuth, requireSuperAdmin);

// POST /api/gyms_mutations
gymsMutationsRouter.post(
  GYM_MUTATIONS.root,
  asyncHandler(async (req, res) => {
    const data = parseBody(gymSchema, req.body);
    const id = await repo.createGym(data);
    return ok(res, { id }, 201);
  })
);

// PUT /api/gyms_mutations/:id
gymsMutationsRouter.put(
  GYM_MUTATIONS.byId(":id"),
  asyncHandler(async (req, res) => {
    const data = parseBody(gymSchema, req.body);
    await repo.updateGym(req.params.id, data);
    return ok(res, { id: req.params.id });
  })
);

// DELETE /api/gyms_mutations/:id
gymsMutationsRouter.delete(
  GYM_MUTATIONS.byId(":id"),
  asyncHandler(async (req, res) => {
    await repo.deleteGym(req.params.id);
    return ok(res, { id: req.params.id });
  })
);
