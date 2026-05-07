"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "@/i18n/navigation"
import { getLocale } from "next-intl/server"

type SignInResult = { error: string } | never

export async function signIn(email: string, password: string): Promise<SignInResult> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        if (error.message.toLowerCase().includes("invalid")) {
            return { error: "auth.errors.invalidCredentials" }
        }
        return { error: "auth.errors.generic" }
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, gym_id")
        .eq("id", data.user.id)
        .single()

    const locale = await getLocale()

    const userType = profile?.user_type ?? "member"
    const gymId = profile?.gym_id

    if (userType === "gym") {
        redirect({ href: "/admin", locale })
    } else if (userType === "coach") {
        redirect({ href: "/coach", locale })
    } else if (gymId) {
        redirect({ href: "/member", locale })
    } else {
        redirect({ href: "/client", locale })
    }
}
