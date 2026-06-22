import { useTranslation } from "react-i18next";

const getTranslations = (prefix: string) => {
    const { t } = useTranslation(undefined, { keyPrefix: prefix });

    return t;
}

export default getTranslations;