"use client"

import { useTranslations } from "next-intl"
import { toast } from "sonner"
import useFormManager from "@/hook/useFormManager"
import { signInSchema, type SignInData } from "@/validations/signInSchema"
import { PROVIDERS } from "@/constants/authProviders"
import { signIn } from "@/services/auth/signIn"
import { Input } from "../ui/input"
import { Button } from "../ui/button"


interface SignInComponentProps {
    onSwitchToSignup: () => void
}

export default function SignInComponent({ onSwitchToSignup }: SignInComponentProps) {
    const t = useTranslations()

    const {
        formData,
        handleChange,
        errors,
        handleSubmit,
        loading,
    } = useFormManager<SignInData>({
        initialData: { email: "", password: "" },
        schema: signInSchema,
        onSubmit: async (data) => {
            const result = await signIn(data.email, data.password)
            if (result?.error) {
                toast.error(t(result.error))
                return
            }
            toast.success("Success")
        },
    })

    return (
        <div>
            <div className="flex justify-end mb-6 text-[13px] text-muted">
                {t("auth.login.newHere")}
                <button type="button" onClick={onSwitchToSignup}
                    className="ml-1.5 text-accent font-semibold bg-none border-none cursor-pointer text-[13px] p-0">
                    {t("auth.login.createAccount")}
                </button>
            </div>

            <h1 className="text-[32px] font-bold tracking-[-0.025em] m-0 leading-tight">
                {t("auth.login.title")}
            </h1>
            <p className="text-[14px] text-muted mt-2.5 mb-8 leading-relaxed">
                {t("auth.login.description")}
            </p>

            <div className="mb-1.5 flex flex-col gap-2">
                <Input
                    label={t("auth.login.emailLabel")}
                    className="fs-input w-full h-[50px] text-[14px] px-4 rounded-lg"
                    type="email"
                    name="email"
                    placeholder={t("auth.login.emailPlaceholder")}
                    value={formData.email}
                    onChange={handleChange}
                    error={t(errors.email)}
                />
                <Input
                    label={t("auth.login.passwordLabel")}
                    className="fs-input w-full h-[50px] text-[14px] px-4 rounded-lg"
                    type="password"
                    name="password"
                    placeholder={t("auth.login.passwordPlaceholder")}
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    error={t(errors.password)}
                />
            </div>

            <div className="flex justify-end mb-6">
                <Button
                    // onClick={handleSubmit}
                    // isLoading={loading}
                    variant="secondary"
                    className="text-[12px] text-muted m-0 p-0"
                >
                    {t("auth.login.forgotPassword")}
                </Button>
            </div>

            <Button
                onClick={handleSubmit}
                isLoading={loading}
                variant="accent"
                className="w-full p-5 mb-3"
            >
                {t("auth.login.signInBtn")}
            </Button>

            <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-hairline" />
                <span className="text-[10px] font-semibold text-muted2 uppercase tracking-[0.14em]">{t("auth.login.orWith")}</span>
                <div className="flex-1 h-px bg-hairline" />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-7">
                {PROVIDERS.map(({ id, label, icon }) => (
                    <button key={id} type="button"
                        className="h-14 rounded-lg border border-[#E5E7EB] bg-white flex flex-col items-center justify-center gap-1.5 text-[12px] font-semibold text-[var(--ink)] cursor-pointer transition-colors hover:border-[#2D5BFF] hover:bg-[#EAF0FF]"
                    >
                        {icon}
                        <span>{label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
