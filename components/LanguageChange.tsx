"use client"

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

const LanguageChange = () => {
    const { t, i18n } = useTranslation(undefined, { keyPrefix: "common" });
    const otherLocale = i18n.language === "ar" ? "en" : "ar";

    const handleChangeLanguage = useCallback(() => {
        void i18n.changeLanguage(otherLocale);
    }, [i18n, otherLocale])

    return (
        <Button
            onClick={handleChangeLanguage}
            size="xs"
            variant="link"
        >
            {t("langToggle")}
        </Button>
    )
}

export default LanguageChange