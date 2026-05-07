import { z } from "zod"

export const signUpSchema = z.object({
    role: z.enum(["admin", "coach", "member"]),
    email: z.string().email("auth.errors.invalidEmail"),
    name: z.string().min(1, "auth.errors.nameRequired"),
    password: z.string().min(8, "auth.errors.weakPassword"),
})

export type SignUpData = z.infer<typeof signUpSchema>
export type Role = "admin" | "coach" | "member"
