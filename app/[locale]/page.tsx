import LanguageChange from "@/components/LanguageChange";
import Logo from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import Ring from "@/components/ui/Ring";
import { getTranslations } from "next-intl/server";
import AuthScreen from "@/components/auth/AuthScreen"

// ── Page ──────────────────────────────────────────────────────────────────────
const AuthPage = async () => {
  const t = await getTranslations("auth");

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAF7] text-[var(--ink)] font-sans">

      <div className="hidden lg:flex flex-col flex-[0_0_52%] min-h-screen bg-[var(--ink)] text-white relative overflow-hidden px-14 py-10">
        <div className="pointer-events-none absolute -top-28 -right-24 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#2D5BFF40,transparent_65%)]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-[380px] h-[380px] bg-[repeating-linear-gradient(135deg,transparent_0_10px,rgba(255,255,255,0.04)_10px_11px)]" />

        <Logo inverted className="relative" />

        <div className="relative my-auto max-w-[540px]">
          <div className="fs-eyebrow text-accent mb-4">{t("hero.eyebrow")}</div>
          <h2 className="text-[52px] font-bold tracking-[-0.03em] leading-[1.02] mb-4">
            {t("hero.headline1")}<br />{t("hero.headline2")}
          </h2>
          <p className="text-[15px] text-[var(--muted2)] leading-relaxed max-w-[440px]">
            {t("hero.description")}
          </p>

          <div className="relative mt-14 h-44">
            <div className="absolute left-0 top-0 w-44 px-3.5 py-3 rounded-lg border border-white/10 bg-white/[0.06] backdrop-blur-sm">
              <div className="text-[10px] font-semibold text-[var(--muted2)] uppercase tracking-widest">{t("hero.metricMembers")}</div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="fs-num text-[22px] font-bold text-white">847</span>
                <span className="text-[11px] font-semibold text-green-600">↑ 24</span>
              </div>
            </div>
            <div className="absolute left-48 top-10 w-44 px-3.5 py-3 rounded-lg border border-white/10 bg-white/[0.06] backdrop-blur-sm">
              <div className="text-[10px] font-semibold text-[var(--muted2)] uppercase tracking-widest">{t("hero.metricCompliance")}</div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="fs-num text-[22px] font-bold text-white">86%</span>
                <span className="text-[11px] font-semibold text-green-600">↑ 5%</span>
              </div>
            </div>
            <div className="absolute left-0 top-[110px] w-60 flex items-center gap-2.5 px-3 py-3 rounded-lg border border-white/10 bg-white/[0.06] backdrop-blur-sm">
              <Avatar>
                <AvatarFallback>AH</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">Ahmed Hassan</div>
                <div className="text-[10px] text-[var(--muted2)] mt-0.5">{t("hero.clientPlan")}</div>
              </div>
              <Ring value={86} />
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-between text-[11px] text-[var(--muted)]">
          <span>{t("hero.copyright")}</span>
          <div className="flex gap-4">
            <Button size="xs" variant="secondary">{t("hero.privacy")}</Button>
            <Button size="xs" variant="secondary">{t("hero.terms")}</Button>
            <LanguageChange />
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <AuthScreen />
    </div>
  );
}

export default AuthPage