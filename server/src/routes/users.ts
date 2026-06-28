import { Router } from "express";
import { USER } from "@/constants/apiRoutes";
import { createUserSchema, updateUserSchema } from "@/validations/userSchema";
import { requireAuth, requireSuperAdmin } from "../auth/middleware.js";
import { asyncHandler, badRequest, notFound, ok, parseBody, queryParams } from "../lib/apiResult.js";
import * as repo from "../db/repositories/users.js";

export const usersRouter = Router();
usersRouter.use(requireAuth, requireSuperAdmin);

// GET /api/users?search=&type=&gym=
usersRouter.get(
  USER.root,
  asyncHandler(async (req, res) =>
    ok(res, await repo.listUsers(queryParams(req, "search", "type", "gym")))
  )
);

// GET /api/users/:id
usersRouter.get(
  USER.byId(":id"),
  asyncHandler(async (req, res) => {
    const user = await repo.getUser(req.params.id);
    if (!user) throw notFound("User not found");
    return ok(res, user);
  })
);

// POST /api/users
usersRouter.post(
  USER.root,
  asyncHandler(async (req, res) => {
    const data = parseBody(createUserSchema, req.body);
    if (data.email && (await repo.emailExists(data.email))) {
      throw badRequest("A user with this email already exists");
    }
    const id = await repo.createUser(data);
    return ok(res, { id }, 201);
  })
);

// PUT /api/users/:id
usersRouter.put(
  USER.byId(":id"),
  asyncHandler(async (req, res) => {
    const data = parseBody(updateUserSchema, req.body);
    if (!(await repo.getUser(req.params.id))) throw notFound("User not found");
    if (data.email && (await repo.emailExists(data.email, req.params.id))) {
      throw badRequest("A user with this email already exists");
    }
    await repo.updateUser(req.params.id, data);
    return ok(res, { id: req.params.id });
  })
);

// DELETE /api/users/:id
usersRouter.delete(
  USER.byId(":id"),
  asyncHandler(async (req, res) => {
    await repo.deleteUser(req.params.id);
    return ok(res, { id: req.params.id });
  })
);
