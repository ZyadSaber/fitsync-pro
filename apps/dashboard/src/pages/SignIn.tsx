import { useState } from "react";
import type { ZodSchema } from "zod";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import LanguageChange from "@/components/LanguageChange";
import Logo from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Ring from "@/components/ui/Ring";
import useFormManager from "@/hooks/useFormManager";
import { cn } from "@/lib/utils";
import { signInSchema } from "@/validations/signInSchema";
import { signUpSchema, type SignUpData } from "@/validations/signUpSchema";
import { PROVIDERS } from "@/constants/authProviders";
import { useAuth } from "../auth/AuthProvider";
import { ApiError } from "../lib/api";

/** Frosted hero metric tile (the floating stat cards on the dark panel). */
function HeroMetric({ label, value, delta, className }: { label: string; value: string; delta: string; className?: string }) {
  return (
    <div className={cn("px-3.5 py-3 rounded-lg border border-white/10 bg-white/[0.06] backdrop-blur-sm", className)}>
      <div className="text-[10px] font-semibold text-[var(--muted2)] uppercase tracking-widest">{label}</div>
      <div className="flex items-baseline gap-1.5 mt-1.5">
        <span className="fs-num text-[22px] font-bold text-white">{value}</span>
        <span className="text-[11px] font-semibold text-green-400">{delta}</span>
      </div>
    </div>
  );
}

/** Frosted hero client tile with a progress ring. */
function HeroClient({ plan, className }: { plan: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5 px-3 py-3 rounded-lg border border-white/10 bg-white/[0.06] backdrop-blur-sm", className)}>
      <Avatar>
        <AvatarFallback>AH</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white whitespace-nowrap">Ahmed Hassan</div>
        <div className="text-[10px] text-[var(--muted2)] mt-0.5">{plan}</div>
      </div>
      <Ring value={86} />
    </div>
  );
}

// ── Auth screen — single form that toggles between sign-in and sign-up ─────────
function AuthScreen() {
  const { t } = useTranslation();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [screen, setScreen] = useState<"signin" | "signup">("signin");
  const isSignup = screen === "signup";

  const { formData, handleChange, errors, handleSubmit, loading } = useFormManager<SignUpData>({
    initialData: { email: "", name: "", password: "" },
    schema: (isSignup ? signUpSchema : signInSchema) as unknown as ZodSchema<SignUpData>,
    onSubmit: async (data) => {
      try {
        const { home } = isSignup
          ? await signUp(data.email, data.name, data.password)
          : await signIn(data.email, data.password);
        navigate(home, { replace: true });
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : t("auth.errors.generic"));
      }
    },
  });

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="m-auto w-full max-w-[440px] px-6 py-10 md:px-10">
        <div className={cn("text-[13px] text-muted", isSignup ? "mb-10" : "flex justify-end mb-6")}>
          {isSignup ? t("auth.signup.alreadyMember") : t("auth.login.newHere")}{" "}
          <button
            type="button"
            onClick={() => setScreen(isSignup ? "signin" : "signup")}
            className="text-accent font-semibold cursor-pointer p-0"
          >
            {isSignup ? t("auth.signup.signIn") : t("auth.login.createAccount")}
          </button>
        </div>

        {isSignup && <div className="fs-eyebrow text-accent mb-2.5">{t("auth.signup.eyebrow")}</div>}
        <h1 className="text-[30px] font-bold tracking-[-0.02em] m-0 leading-tight">
          {isSignup ? t("auth.signup.title") : t("auth.login.title")}
        </h1>
        <p className="text-[13px] text-muted mt-2 mb-6 leading-relaxed">
          {isSignup ? t("auth.signup.description") : t("auth.login.description")}
        </p>

        <div className="flex flex-col gap-2">
          {isSignup && (
            <Input
              value={formData.name}
              onChange={handleChange}
              name="name"
              label={t("auth.signup.nameLabel")}
              className="fs-input w-full h-[46px] text-[14px] rounded-lg px-4"
              error={t(errors?.name || "")}
              placeholder={t("auth.signup.namePlaceholder")}
            />
          )}

          <Input
            value={formData.email}
            onChange={handleChange}
            name="email"
            type="email"
            label={t(isSignup ? "auth.signup.emailLabel" : "auth.login.emailLabel")}
            className="fs-input w-full h-[46px] text-[14px] rounded-lg px-4"
            error={t(errors?.email || "")}
            placeholder={t(isSignup ? "auth.signup.emailPlaceholder" : "auth.login.emailPlaceholder")}
          />

          <Input
            value={formData.password}
            onChange={handleChange}
            name="password"
            type="password"
            label={t(isSignup ? "auth.signup.passwordLabel" : "auth.login.passwordLabel")}
            className="fs-input w-full h-[46px] text-[14px] rounded-lg px-4"
            error={t(errors?.password || "")}
            placeholder={t(isSignup ? "auth.signup.passwordPlaceholder" : "auth.login.passwordPlaceholder")}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {!isSignup && (
          <div className="flex justify-end mb-6">
            <Button variant="link" className="text-[12px] text-muted px-0 h-auto">
              {t("auth.login.forgotPassword")}
            </Button>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          isLoading={loading}
          variant="accent"
          className={cn("w-full p-3 mb-3 text-[15px]", isSignup && "mt-3")}
        >
          {isSignup ? t("auth.signup.continueBtn") : t("auth.login.signInBtn")}
        </Button>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function SignIn() {
  const { t } = useTranslation(undefined, { keyPrefix: "auth" });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-[#FAFAF7] text-[var(--ink)] font-sans overflow-x-hidden">

      {/* Mobile hero banner — logo + tagline, shown only on small screens */}
      <div className="flex lg:hidden flex-col bg-[var(--ink)] text-white relative overflow-hidden px-6 py-8">
        <div className="pointer-events-none absolute -top-12 -right-10 w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#2D5BFF40,transparent_65%)]" />

        <div className="relative flex items-center justify-between mb-6">
          <Logo inverted />
          <LanguageChange />
        </div>

        <div className="relative">
          <div className="fs-eyebrow text-accent mb-2">{t("hero.eyebrow")}</div>
          <h2 className="text-[28px] font-bold tracking-[-0.03em] leading-[1.1] mb-2">
            {t("hero.headline1")} {t("hero.headline2")}
          </h2>
          <p className="text-[13px] text-[var(--muted2)] leading-relaxed">
            {t("hero.description")}
          </p>
        </div>

        {/* Mini metrics row */}
        <div className="relative mt-6 flex gap-3 overflow-x-auto pb-1">
          <HeroMetric className="shrink-0" label={t("hero.metricMembers")} value="847" delta="↑ 24" />
          <HeroMetric className="shrink-0" label={t("hero.metricCompliance")} value="86%" delta="↑ 5%" />
          <HeroClient className="shrink-0" plan={t("hero.clientPlan")} />
        </div>
      </div>

      {/* Desktop hero panel — left column, hidden on mobile */}
      <div className="hidden lg:flex flex-col flex-[0_0_52%] h-screen bg-[var(--ink)] text-white relative overflow-hidden px-14 py-10">
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
            <HeroMetric className="absolute left-0 top-0 w-44" label={t("hero.metricMembers")} value="847" delta="↑ 24" />
            <HeroMetric className="absolute left-48 top-10 w-44" label={t("hero.metricCompliance")} value="86%" delta="↑ 5%" />
            <HeroClient className="absolute left-0 top-[110px] w-60" plan={t("hero.clientPlan")} />
          </div>
        </div>

        <div className="relative flex items-center justify-between text-[11px] text-[var(--muted)]">
          <span>{t("hero.copyright")}</span>
          <div className="flex gap-4">
            <Button size="xs" variant="link" className="text-[var(--muted)] px-0">{t("hero.privacy")}</Button>
            <Button size="xs" variant="link" className="text-[var(--muted)] px-0">{t("hero.terms")}</Button>
            <LanguageChange />
          </div>
        </div>
      </div>

      {/* Auth form — full width on mobile, fills remaining space on desktop */}
      <AuthScreen />
    </div>
  );
}
