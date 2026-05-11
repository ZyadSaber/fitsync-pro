import { z } from "zod"

export const signUpSchema = z.object({
    email: z.string().email("auth.errors.invalidEmail"),
    name: z.string().min(1, "auth.errors.nameRequired"),
    password: z.string().min(8, "auth.errors.weakPassword"),
})

export type SignUpData = z.infer<typeof signUpSchema>
