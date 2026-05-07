import { z } from "zod"

export const signInSchema = z.object({
    email: z.string().email("auth.errors.invalidEmail"),
    password: z.string().min(8, "auth.errors.weakPassword"),
})

export type SignInData = z.infer<typeof signInSchema>
