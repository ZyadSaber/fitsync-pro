import { z } from "zod";

export const coachFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[+\d\s()-]{0,20}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(500, "Bio must be 500 characters or less")
    .optional()
    .or(z.literal("")),
  specialties: z.array(z.string()).default([]),
});

export type CoachFormData = z.infer<typeof coachFormSchema>;

export const createCoachSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[+\d\s()-]{0,20}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(500, "Bio must be 500 characters or less")
    .optional()
    .or(z.literal("")),
  specialties: z.array(z.string()).default([]),
});

export type CreateCoachFormData = z.infer<typeof createCoachSchema>;
