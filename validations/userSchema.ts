import { z } from "zod";

// The non-super-admin account kinds that live in `user_credentials.user_type`.
export const USER_TYPES = ["member", "gym", "coach", "client"] as const;

const phone = z
  .string()
  .regex(/^[+\d\s()-]{0,20}$/, "Invalid phone number")
  .optional()
  .or(z.literal(""));

// Shared base for create/update. Email + password are optional because the
// platform also holds login-less users (members linked to a gym, etc.).
const baseUser = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  user_type: z.enum(USER_TYPES),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone,
  gym_id: z.string().uuid("Invalid gym").nullable().optional(),
  avatar_url: z.string().optional(),
  is_super_admin: z.boolean().optional(),
});

// On create, a password is required whenever an email (i.e. a login) is given.
export const createUserSchema = baseUser
  .extend({ password: z.string().min(8, "Password must be at least 8 characters").optional() })
  .refine((v) => !v.email || !!v.password, {
    message: "Password is required for users with an email",
    path: ["password"],
  });

// On update, password is optional (omitted = leave the existing hash untouched).
export const updateUserSchema = baseUser.extend({
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
