import { Router } from "express";
import { INVITATION } from "@/constants/apiRoutes";
import { invitationSchema } from "@/validations/invitationSchema";
import { requireAuth, requireSuperAdmin } from "../auth/middleware.js";
import { asyncHandler, notFound, ok, parseBody, queryParams } from "../lib/apiResult.js";
import * as repo from "../db/repositories/invitations.js";

export const invitationsRouter = Router();
invitationsRouter.use(requireAuth, requireSuperAdmin);

// GET /api/invitations?type=&gym=&status=
invitationsRouter.get(
  INVITATION.root,
  asyncHandler(async (req, res) =>
    ok(res, await repo.listInvitations(queryParams(req, "type", "gym", "status")))
  )
);

// POST /api/invitations
invitationsRouter.post(
  INVITATION.root,
  asyncHandler(async (req, res) => {
    const data = parseBody(invitationSchema, req.body);
    const invitation = await repo.createInvitation(data);
    return ok(res, invitation, 201);
  })
);

// POST /api/invitations/:id/resend
invitationsRouter.post(
  INVITATION.resend(":id"),
  asyncHandler(async (req, res) => {
    const invitation = await repo.resendInvitation(req.params.id);
    if (!invitation) throw notFound("No pending invitation to resend");
    return ok(res, invitation);
  })
);

// DELETE /api/invitations/:id
invitationsRouter.delete(
  INVITATION.byId(":id"),
  asyncHandler(async (req, res) => {
    await repo.deleteInvitation(req.params.id);
    return ok(res, { id: req.params.id });
  })
);
