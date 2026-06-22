"use client"

import { useTranslation } from "react-i18next"
import { useRouter, usePathname } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
    const { i18n } = useTranslation()
    const locale = i18n.language
    const router = useRouter()
    const pathname = usePathname()

    const toggleLocale = () => {
        const nextLocale = locale === "en" ? "ar" : "en"
        router.replace(pathname, { locale: nextLocale })
    }

    return (
        <Button variant="ghost" size="sm" onClick={toggleLocale}>
            {locale === "en" ? "العربية" : "English"}
        </Button>
    )
}
