"use client"

import { useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "./ui/button";
import { useLocale, useTranslations } from "next-intl";

const LanguageChange = () => {
    const router = useRouter();
    const locale = useLocale();
    const otherLocale = locale === "ar" ? "en" : "ar";
    const t = useTranslations("common")

    const handleChngeLanguage = useCallback(() => {
        router.replace("/", { locale: otherLocale })
    }, [])

    return (
        <Button
            onClick={handleChngeLanguage}
            size="xs"
            variant="secondary"
        >
            {t("langToggle")}
        </Button>
    )
}

export default LanguageChange