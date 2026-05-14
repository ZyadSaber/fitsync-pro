"use client";

import { SelectField } from "@/components/ui/select";
import type { SelectOptions } from "@/types/ui";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import useFormManager from "@/hook/useFormManager";

interface Props {
  planOptions: SelectOptions[];
}

const GymsFilters = ({ planOptions }: Props) => {
  const t = useTranslations("management.gyms");

  const { handleToggle, formData } = useFormManager({
    initialData: { status: "", plan: "" },
    searchFields: ["status", "plan"],
  });

  const statusOptions = useMemo(() => [
    { key: "active", label: t("filters.active") },
    { key: "suspended", label: t("filters.suspended") },
    { key: "cancelled", label: t("filters.cancelled") },
  ], []);

  return (
    <>
      <SelectField
        name="status"
        label={t("filters.status")}
        options={statusOptions}
        value={formData.status}
        onValueChange={handleToggle("status")}
        hideClear={false}
        containerClassName="w-[20%]"
      />
      <SelectField
        name="plan"
        label={t("table.plan")}
        options={planOptions}
        value={formData.plan}
        onValueChange={handleToggle("plan")}
        hideClear={false}
        containerClassName="w-[20%]"
      />
    </>
  );
};

export default GymsFilters;
