"use client"

import { useTransition } from "react"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import useFormManager from "@/hook/useFormManager"
import { signInSchema, type SignInData } from "@/validations/signInSchema"
import { PROVIDERS } from "@/constants/authProviders"
import { signIn } from "@/services/auth/signIn"


interface SignInComponentProps {
    onSwitchToSignup: () => void
}

export default function SignInComponent({ onSwitchToSignup }: SignInComponentProps) {
    const t = useTranslations()
    const locale = useLocale()
    const [isPending, startTransition] = useTransition()

    const {
        formData,
        handleChange,
        validate,
        errors
    } = useFormManager<SignInData>({
        initialData: { email: "", password: "" },
        schema: signInSchema,
    })

    const handleSubmit = () => {
        if (!validate()) return

        startTransition(async () => {
            const toastId = toast.loading(t("auth.login.signingIn"))
            const result = await signIn(formData.email, formData.password)
            if (result?.error) {
                toast.dismiss(toastId)
                toast.error(t(result.error as Parameters<typeof t>[0]))
            }
        })
    }

    return (
        <div>
            <div className="flex justify-end mb-12 text-[13px] text-[#6B7280]">
                {t("auth.login.newHere")}{" "}
                <button type="button" onClick={onSwitchToSignup}
                    className="ml-1.5 text-[#2D5BFF] font-semibold bg-none border-none cursor-pointer text-[13px] p-0">
                    {t("auth.login.createAccount")}
                </button>
            </div>

            <div className="fs-eyebrow text-[#2D5BFF] mb-2.5">{t("auth.login.eyebrow")}</div>
            <h1 className="text-[32px] font-bold tracking-[-0.025em] m-0 leading-tight">
                {t("auth.login.title")}
            </h1>
            <p className="text-[14px] text-[#6B7280] mt-2.5 mb-8 leading-relaxed">
                {t("auth.login.description")}
            </p>

            <div className="mb-3.5 flex flex-col gap-2">
                <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.06em] mb-1.5">
                        {t("auth.login.emailLabel")}
                    </label>
                    <input
                        className="fs-input w-full h-[50px] text-[14px] px-4 rounded-lg"
                        type="email"
                        name="email"
                        placeholder={t("auth.login.emailPlaceholder")}
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <p className="text-red-500 text-[11px] mt-1">{t(errors.email as Parameters<typeof t>[0])}</p>}
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.06em] mb-1.5">
                        {t("auth.login.passwordLabel")}
                    </label>
                    <input
                        className="fs-input w-full h-[50px] text-[14px] px-4 rounded-lg"
                        type="password"
                        name="password"
                        placeholder={t("auth.login.passwordPlaceholder")}
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && <p className="text-red-500 text-[11px] mt-1">{t(errors.password as Parameters<typeof t>[0])}</p>}
                </div>
            </div>

            <div className="flex justify-end mb-6">
                <button type="button" className="text-[12px] text-[#6B7280] bg-none border-none cursor-pointer p-0">
                    {t("auth.login.forgotPassword")}
                </button>
            </div>

            <button
                className="fs-btn accent w-full h-12 text-[14px] mb-5 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={isPending}
            >
                {t("auth.login.signInBtn")}
            </button>

            <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="text-[10px] font-semibold text-[#9AA1AE] uppercase tracking-[0.14em]">{t("auth.login.orWith")}</span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            <div className="grid grid-cols-4 gap-2 mb-7">
                {PROVIDERS.map(({ id, label, icon }) => (
                    <button key={id} type="button"
                        className="h-14 rounded-lg border border-[#E5E7EB] bg-white flex flex-col items-center justify-center gap-1.5 text-[12px] font-semibold text-[var(--ink)] cursor-pointer transition-colors hover:border-[#2D5BFF] hover:bg-[#EAF0FF]"
                    >
                        {icon}
                        <span>{label}</span>
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-white border border-[#E5E7EB]">
                <div className="w-8 h-8 rounded-lg bg-[#FAFAF7] flex items-center justify-center shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0B0F1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
                <p className="flex-1 text-[12px] text-[#6B7280] leading-relaxed m-0">
                    {locale === "ar" ? (
                        <>هل أنت <strong className="text-[var(--ink)]">{t("auth.login.roleAdmin")}</strong> أو <strong className="text-[var(--ink)]">{t("auth.login.roleCoach")}</strong>؟ {t("auth.login.roleHintSuffix")}</>
                    ) : (
                        <>Are you a <strong className="text-[var(--ink)]">{t("auth.login.roleAdmin")}</strong> or <strong className="text-[var(--ink)]">{t("auth.login.roleCoach")}</strong>? {t("auth.login.roleHintSuffix")}</>
                    )}
                </p>
            </div>

            <p className="text-center text-[11px] text-[#9AA1AE] leading-relaxed mt-8">
                {t("auth.login.legalPrefix")}{" "}
                <span className="text-[var(--ink)] font-medium underline cursor-pointer">{t("auth.login.terms")}</span>{" "}
                {t("auth.login.legalAnd")}{" "}
                <span className="text-[var(--ink)] font-medium underline cursor-pointer">{t("auth.login.privacyPolicy")}</span>.
            </p>
        </div>
    )
}
