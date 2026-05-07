"use client"

import { useTranslations } from "next-intl"
import useFormManager from "@/hook/useFormManager"
import { signUpSchema, type SignUpData, type Role } from "@/validations/signUpSchema"
import { PROVIDERS } from "@/constants/authProviders"

const ROLES = [
    { id: "admin" as const, titleKey: "auth.signup.adminTitle" as const, subKey: "auth.signup.adminSub" as const },
    { id: "coach" as const, titleKey: "auth.signup.coachTitle" as const, subKey: "auth.signup.coachSub" as const },
    { id: "member" as const, titleKey: "auth.signup.memberTitle" as const, subKey: "auth.signup.memberSub" as const },
]


interface SignupComponentProps {
    onSwitchToSignIn: () => void
}

export default function SignupComponent({ onSwitchToSignIn }: SignupComponentProps) {
    const t = useTranslations()

    const { formData, handleChange, handleFieldChange, validate, errors } = useFormManager<SignUpData>({
        initialData: { role: "member", email: "", name: "", password: "" },
        schema: signUpSchema,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        // TODO: wire up Supabase auth
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="flex justify-between items-center mb-10">
                <span className="text-[13px] text-[#6B7280]">
                    {t("auth.signup.alreadyMember")}{" "}
                    <button type="button" onClick={onSwitchToSignIn}
                        className="text-[#2D5BFF] font-semibold bg-none border-none cursor-pointer text-[13px] p-0">
                        {t("auth.signup.signIn")}
                    </button>
                </span>
                <span className="text-[12px] text-[#6B7280]">{t("auth.signup.step")}</span>
            </div>

            <div className="fs-eyebrow text-[#2D5BFF] mb-2.5">{t("auth.signup.eyebrow")}</div>
            <h1 className="text-[30px] font-bold tracking-[-0.02em] m-0 leading-tight">{t("auth.signup.title")}</h1>
            <p className="text-[13px] text-[#6B7280] mt-2 mb-6 leading-relaxed">{t("auth.signup.description")}</p>

            <div className="flex flex-col gap-2 mb-5">
                {ROLES.map(({ id, titleKey, subKey }) => {
                    const active = formData.role === id
                    return (
                        <button key={id} type="button" onClick={() => handleFieldChange({ name: "role", value: id as Role })}
                            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl border text-left w-full cursor-pointer transition-all ${active ? "bg-[var(--ink)] text-white border-[#0B0F1A]" : "bg-white text-[var(--ink)] border-[#E5E7EB]"}`}>
                            <div className={`w-[38px] h-[38px] rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-[#2D5BFF]" : "bg-[#FAFAF7]"}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke={active ? "#fff" : "#0B0F1A"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {id === "admin" && <><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>}
                                    {id === "coach" && <path d="M6 4v16M18 4v16M4 8h4M16 8h4M4 16h4M16 16h4M8 12h8" />}
                                    {id === "member" && <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>}
                                </svg>
                            </div>
                            <div className="flex-1 text-start">
                                <div className="text-[14px] font-bold">{t(titleKey)}</div>
                                <div className={`text-[12px] mt-0.5 ${active ? "text-[#9AA1AE]" : "text-[#6B7280]"}`}>{t(subKey)}</div>
                            </div>
                            <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${active ? "bg-[#2D5BFF] border-[#2D5BFF]" : "bg-transparent border-[#E5E7EB]"}`}>
                                {active && (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>

            <div className="mb-3">
                <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.06em] mb-1.5">
                    {t("auth.signup.nameLabel")}
                </label>
                <input className="fs-input w-full h-[46px] text-[14px] rounded-lg px-4"
                    type="text" name="name" placeholder={t("auth.signup.namePlaceholder")}
                    value={formData.name} onChange={handleChange} />
                {errors.name && <p className="text-red-500 text-[11px] mt-1">{t(errors.name as Parameters<typeof t>[0])}</p>}
            </div>

            <div className="mb-4">
                <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.06em] mb-1.5">
                    {t("auth.signup.emailLabel")}
                </label>
                <input className="fs-input w-full h-[46px] text-[14px] rounded-lg px-4"
                    type="email" name="email" placeholder={t("auth.signup.emailPlaceholder")}
                    value={formData.email} onChange={handleChange} />
                {errors.email && <p className="text-red-500 text-[11px] mt-1">{t(errors.email as Parameters<typeof t>[0])}</p>}
            </div>

            <div className="mb-5">
                <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.06em] mb-1.5">
                    {t("auth.signup.passwordLabel")}
                </label>
                <input className="fs-input w-full h-[46px] text-[14px] rounded-lg px-4"
                    type="password" name="password" placeholder={t("auth.signup.passwordPlaceholder")}
                    value={formData.password} onChange={handleChange} />
                {errors.password && <p className="text-red-500 text-[11px] mt-1">{t(errors.password as Parameters<typeof t>[0])}</p>}
            </div>

            <button type="submit" className="fs-btn accent w-full h-12 text-[14px] mb-4 rounded-lg">
                {t("auth.signup.continueBtn")}
            </button>

            <div className="flex items-center gap-3 mb-3.5">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="text-[10px] font-semibold text-[#9AA1AE] uppercase tracking-[0.14em]">{t("auth.signup.or")}</span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.map(({ id, label, icon }) => (
                    <button key={id} type="button"
                        className="h-11 rounded-lg border border-[#E5E7EB] bg-white flex items-center justify-center gap-2.5 text-[13px] font-semibold text-[var(--ink)] cursor-pointer transition-colors hover:border-[#2D5BFF] hover:bg-[#EAF0FF]">
                        {icon}{label}
                    </button>
                ))}
            </div>
        </form>
    )
}
