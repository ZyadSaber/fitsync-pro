"use client";

import { SelectField } from "@/components/ui/select";
import { RadioGroupField } from "@/components/ui/radio-group";
import type { SelectOptions } from "@/types/ui";
import { useTranslations } from "next-intl";
import useFormManager from "@/hook/useFormManager";

interface Props {
  planOptions: SelectOptions[];
}

const CoachesFilters = ({ planOptions }: Props) => {
  const t = useTranslations("management.coaches");

  const { handleToggle, formData } = useFormManager({
    initialData: { active: "", plan: "" },
    searchFields: ["active", "plan"],
  });

  const activeOptions = [
    { value: "true", label: t("filters.active") },
    { value: "false", label: t("filters.inactive") },
    { value: "", label: t("filters.all") },
  ];

  return (
    <div className="flex items-end gap-6 w-full">
      <SelectField
        name="plan"
        label={t("table.plan")}
        options={planOptions}
        value={formData.plan}
        onValueChange={handleToggle("plan")}
        hideClear={false}
        containerClassName="w-[20%]"
      />
      <RadioGroupField
        label={t("filters.billingStatus")}
        options={activeOptions}
        value={formData.active}
        onValueChange={handleToggle("active")}
      />
    </div>
  );
};

export default CoachesFilters;
