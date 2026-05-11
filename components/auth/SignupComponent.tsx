"use client"

import { useTranslations } from "next-intl"
import useFormManager from "@/hook/useFormManager"
import { signUpSchema, type SignUpData } from "@/validations/signUpSchema"
import { PROVIDERS } from "@/constants/authProviders"
import { createClient } from "@/lib/supabase/client"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { toast } from "sonner"

interface SignupComponentProps {
    onSwitchToSignIn: () => void
}

export default function SignupComponent({ onSwitchToSignIn }: SignupComponentProps) {
    const t = useTranslations()
    const supabase = createClient()

    const { formData, handleChange, errors, handleSubmit, loading } = useFormManager<SignUpData>({
        initialData: { email: "", name: "", password: "" },
        schema: signUpSchema,
        onSubmit: async (data) => {
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: { data: { full_name: data.name } },
            })

            if (error) {
                toast.error(error.message)
                return
            }

            if (authData.user) {
                await supabase
                    .from("profiles")
                    .update({ full_name: data.name })
                    .eq("id", authData.user.id)
            }
        },
    })

    return (
        <div>
            <div className="flex justify-between items-center mb-10">
                <span className="text-[13px] text-[#6B7280]">
                    {t("auth.signup.alreadyMember")}{" "}
                    <button type="button" onClick={onSwitchToSignIn}
                        className="text-[#2D5BFF] font-semibold bg-none border-none cursor-pointer text-[13px] p-0">
                        {t("auth.signup.signIn")}
                    </button>
                </span>
            </div>

            <div className="fs-eyebrow text-[#2D5BFF] mb-2.5">{t("auth.signup.eyebrow")}</div>
            <h1 className="text-[30px] font-bold tracking-[-0.02em] m-0 leading-tight">{t("auth.signup.title")}</h1>
            <p className="text-[13px] text-[#6B7280] mt-2 mb-6 leading-relaxed">{t("auth.signup.description")}</p>

            <Input
                value={formData.name}
                onChange={handleChange}
                name="name"
                label={t("auth.signup.nameLabel")}
                className="fs-input w-full h-[46px] text-[14px] rounded-lg px-4"
                containerClassName="mb-2"
                error={t(errors.name)}
                placeholder={t("auth.signup.namePlaceholder")}
            />

            <Input
                value={formData.email}
                onChange={handleChange}
                name="email"
                label={t("auth.signup.emailLabel")}
                className="fs-input w-full h-[46px] text-[14px] rounded-lg px-4"
                containerClassName="mb-2"
                error={t(errors.email)}
                placeholder={t("auth.signup.emailPlaceholder")}
                type="email"
            />

            <Input
                value={formData.password}
                onChange={handleChange}
                name="password"
                label={t("auth.signup.passwordLabel")}
                className="fs-input w-full h-[46px] text-[14px] rounded-lg px-4"
                containerClassName="mb-2"
                error={t(errors.password)}
                placeholder={t("auth.signup.passwordPlaceholder")}
                type="password"
            />

            <Button
                onClick={handleSubmit}
                isLoading={loading}
                variant="accent"
                className="w-full p-5 mb-3"
            >
                {t("auth.signup.continueBtn")}
            </Button>

            <div className="flex items-center gap-3 mb-3.5">
                <div className="flex-1 h-px bg-hairline" />
                <span className="text-[10px] font-semibold text-muted2 uppercase tracking-[0.14em]">
                    {t("auth.signup.or")}
                </span>
                <div className="flex-1 h-px bg-hairline" />
            </div>

            <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.map(({ id, label, icon }) => (
                    <button key={id} type="button"
                        className="h-11 rounded-lg border border-[#E5E7EB] bg-white flex items-center justify-center gap-2.5 text-[13px] font-semibold text-[var(--ink)] cursor-pointer transition-colors hover:border-[#2D5BFF] hover:bg-[#EAF0FF]">
                        {icon}{label}
                    </button>
                ))}
            </div>
        </div>
    )
}
