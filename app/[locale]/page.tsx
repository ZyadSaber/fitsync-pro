"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/input";

// ── Compliance ring ───────────────────────────────────────────────────────────
function Ring({ value }: { value: number }) {
  const r = 13, circ = 2 * Math.PI * r, filled = (value / 100) * circ;
  return (
    <svg width="32" height="32" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx="16" cy="16" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
      <circle cx="16" cy="16" r={r} fill="none" stroke="#2D5BFF" strokeWidth="3"
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [view, setView] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"admin" | "coach" | "member">("admin");

  const otherLocale = locale === "ar" ? "en" : "ar";

  const PROVIDERS = [
    {
      id: "google", label: t("providers.google"), icon: (
        <svg width="16" height="16" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.71v2.26h2.9C16.65 14.07 17.64 11.76 17.64 9.2z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
        </svg>
      )
    },
    {
      id: "apple", label: t("providers.apple"), icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      )
    },
    {
      id: "phone", label: t("providers.phone"), icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
    {
      id: "whatsapp", label: t("providers.whatsapp"), icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.131.558 4.128 1.528 5.857L.057 23.429l5.733-1.503A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.001-1.368l-.359-.213-3.403.893.908-3.312-.234-.38A9.787 9.787 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
        </svg>
      )
    },
  ] as const;

  const ROLES = [
    { id: "admin", title: t("signup.adminTitle"), sub: t("signup.adminSub") },
    { id: "coach", title: t("signup.coachTitle"), sub: t("signup.coachSub") },
    { id: "member", title: t("signup.memberTitle"), sub: t("signup.memberSub") },
  ] as const;

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAF7] text-[#0B0F1A] font-sans">

      {/* LEFT — dark hero */}
      <div className="hidden lg:flex flex-col flex-[0_0_52%] min-h-screen bg-[#0B0F1A] text-white relative overflow-hidden px-14 py-10">
        {/* Glow / hatching */}
        <div className="pointer-events-none absolute -top-28 -right-24 w-[520px] h-[520px] rounded-full"
          style={{ background: "radial-gradient(circle at 30% 30%, #2D5BFF40, transparent 65%)" }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-[380px] h-[380px]"
          style={{ background: "repeating-linear-gradient(135deg, transparent 0 10px, rgba(255,255,255,0.04) 10px 11px)" }} />

        {/* Wordmark */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2D5BFF] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <div className="text-[17px] font-bold tracking-tight leading-none">{tc("appName")}</div>
            <div className="text-[11px] text-[#9AA1AE] mt-1">{tc("gymName")}</div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative my-auto max-w-[540px]">
          <div className="fs-eyebrow text-[#2D5BFF] mb-4">{t("hero.eyebrow")}</div>
          <h2 className="text-[52px] font-bold tracking-[-0.03em] leading-[1.02] mb-4">
            {t("hero.headline1")}<br />{t("hero.headline2")}
          </h2>
          <p className="text-[15px] text-[#9AA1AE] leading-relaxed max-w-[440px]">
            {t("hero.description")}
          </p>

          {/* Floating mini cards */}
          <div className="relative mt-14 h-44">
            <div className="absolute left-0 top-0 w-44 px-[14px] py-3 rounded-lg border border-white/10"
              style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)" }}>
              <div className="text-[10px] font-semibold text-[#9AA1AE] uppercase tracking-widest">{t("hero.metricMembers")}</div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="fs-num text-[22px] font-bold text-white">847</span>
                <span className="text-[11px] font-semibold text-[#16A34A]">↑ 24</span>
              </div>
            </div>
            <div className="absolute left-48 top-10 w-44 px-[14px] py-3 rounded-lg border border-white/10"
              style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)" }}>
              <div className="text-[10px] font-semibold text-[#9AA1AE] uppercase tracking-widest">{t("hero.metricCompliance")}</div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="fs-num text-[22px] font-bold text-white">86%</span>
                <span className="text-[11px] font-semibold text-[#16A34A]">↑ 5%</span>
              </div>
            </div>
            <div className="absolute left-0 top-[110px] w-60 flex items-center gap-2.5 px-3 py-3 rounded-lg border border-white/10"
              style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)" }}>
              <Avatar>
                <AvatarFallback>AH</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-white">Ahmed Hassan</div>
                <div className="text-[10px] text-[#9AA1AE] mt-0.5">{t("hero.clientPlan")}</div>
              </div>
              <Ring value={86} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-between text-[11px] text-[#6B7280]">
          <span>{t("hero.copyright")}</span>
          <div className="flex gap-4">
            <span className="cursor-pointer">{t("hero.privacy")}</span>
            <span className="cursor-pointer">{t("hero.terms")}</span>
            <button
              onClick={() => router.replace("/", { locale: otherLocale })}
              className="cursor-pointer bg-none border-none text-[#9AA1AE] hover:text-white transition-colors text-[11px] p-0"
            >
              {t("hero.langToggle")}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex flex-1 items-center justify-center p-10 overflow-auto">
        <div className="w-full max-w-[440px]">

          {view === "login" ? (
            <>
              <div className="flex justify-end mb-12 text-[13px] text-[#6B7280]">
                {t("login.newHere")}{" "}
                <button onClick={() => setView("signup")}
                  className="ml-1.5 text-[#2D5BFF] font-semibold bg-none border-none cursor-pointer text-[13px] p-0">
                  {t("login.createAccount")}
                </button>
              </div>

              <div className="fs-eyebrow text-[#2D5BFF] mb-2.5">{t("login.eyebrow")}</div>
              <h1 className="text-[32px] font-bold tracking-[-0.025em] m-0 leading-tight">
                {t("login.title")}
              </h1>
              <p className="text-[14px] text-[#6B7280] mt-2.5 mb-8 leading-relaxed">
                {t("login.description")}
              </p>

              <div className="mb-3.5">
                <Input
                  className="fs-input w-full h-[50px] text-[14px] ps-4 pe-32 rounded-lg w-4/5"
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  label={t("login.emailLabel")}
                />
                <button className="fs-btn accent h-[38px] px-4 text-[13px] rounded-md">
                  {t("login.continueBtn")}
                </button>
              </div>

              <div className="flex justify-end mb-6">
                <button className="text-[12px] text-[#6B7280] bg-none border-none cursor-pointer p-0">
                  {t("login.forgotPassword")}
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="text-[10px] font-semibold text-[#9AA1AE] uppercase tracking-[0.14em]">{t("login.orWith")}</span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
              </div>

              <div className="grid grid-cols-4 gap-2 mb-7">
                {PROVIDERS.map(({ id, label, icon }) => (
                  <button key={id}
                    className="h-14 rounded-lg border border-[#E5E7EB] bg-white flex flex-col items-center justify-center gap-1.5 text-[12px] font-semibold text-[#0B0F1A] cursor-pointer transition-colors hover:border-[#2D5BFF] hover:bg-[#EAF0FF]">
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
                  {/* Role hint: "Are you a gym admin or coach? We'll route you automatically..." */}
                  {locale === "ar" ? (
                    <>هل أنت <strong className="text-[#0B0F1A]">{t("login.roleAdmin")}</strong> أو <strong className="text-[#0B0F1A]">{t("login.roleCoach")}</strong>؟ {t("login.roleHintSuffix")}</>
                  ) : (
                    <>Are you a <strong className="text-[#0B0F1A]">{t("login.roleAdmin")}</strong> or <strong className="text-[#0B0F1A]">{t("login.roleCoach")}</strong>? {t("login.roleHintSuffix")}</>
                  )}
                </p>
              </div>

              <p className="text-center text-[11px] text-[#9AA1AE] leading-relaxed mt-8">
                {t("login.legalPrefix")}{" "}
                <span className="text-[#0B0F1A] font-medium underline cursor-pointer">{t("login.terms")}</span>{" "}
                {t("login.legalAnd")}{" "}
                <span className="text-[#0B0F1A] font-medium underline cursor-pointer">{t("login.privacyPolicy")}</span>.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-10">
                <span className="text-[13px] text-[#6B7280]">
                  {t("signup.alreadyMember")}{" "}
                  <button onClick={() => setView("login")}
                    className="text-[#2D5BFF] font-semibold bg-none border-none cursor-pointer text-[13px] p-0">
                    {t("signup.signIn")}
                  </button>
                </span>
                <span className="text-[12px] text-[#6B7280]">{t("signup.step")}</span>
              </div>

              <div className="fs-eyebrow text-[#2D5BFF] mb-2.5">{t("signup.eyebrow")}</div>
              <h1 className="text-[30px] font-bold tracking-[-0.02em] m-0 leading-tight">{t("signup.title")}</h1>
              <p className="text-[13px] text-[#6B7280] mt-2 mb-6 leading-relaxed">{t("signup.description")}</p>

              <div className="flex flex-col gap-2 mb-5">
                {ROLES.map(({ id, title, sub }) => {
                  const active = role === id;
                  return (
                    <button key={id} onClick={() => setRole(id as typeof role)}
                      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl border text-left w-full cursor-pointer transition-all ${active ? "bg-[#0B0F1A] text-white border-[#0B0F1A]" : "bg-white text-[#0B0F1A] border-[#E5E7EB]"
                        }`}>
                      <div className={`w-[38px] h-[38px] rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-[#2D5BFF]" : "bg-[#FAFAF7]"}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke={active ? "#fff" : "#0B0F1A"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {id === "admin" && <><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>}
                          {id === "coach" && <path d="M6 4v16M18 4v16M4 8h4M16 8h4M4 16h4M16 16h4M8 12h8" />}
                          {id === "member" && <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>}
                        </svg>
                      </div>
                      <div className="flex-1 text-start">
                        <div className="text-[14px] font-bold">{title}</div>
                        <div className={`text-[12px] mt-0.5 ${active ? "text-[#9AA1AE]" : "text-[#6B7280]"}`}>{sub}</div>
                      </div>
                      <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${active ? "bg-[#2D5BFF] border-[#2D5BFF]" : "bg-transparent border-[#E5E7EB]"}`}>
                        {active && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.06em] mb-2">
                  {t("signup.emailLabel")}
                </label>
                <input className="fs-input w-full h-[46px] text-[14px] rounded-lg"
                  type="email" placeholder={t("signup.emailPlaceholder")} />
              </div>

              <button className="fs-btn accent w-full h-12 text-[14px] mb-4 rounded-lg">
                {t("signup.continueBtn")}
              </button>

              <div className="flex items-center gap-3 mb-3.5">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="text-[10px] font-semibold text-[#9AA1AE] uppercase tracking-[0.14em]">{t("signup.or")}</span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.map(({ id, label, icon }) => (
                  <button key={id}
                    className="h-11 rounded-lg border border-[#E5E7EB] bg-white flex items-center justify-center gap-2.5 text-[13px] font-semibold text-[#0B0F1A] cursor-pointer transition-colors hover:border-[#2D5BFF] hover:bg-[#EAF0FF]">
                    {icon}{label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
