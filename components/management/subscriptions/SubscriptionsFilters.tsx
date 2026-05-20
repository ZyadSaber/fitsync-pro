"use client";

import { SelectField } from "@/components/ui/select";
import type { SelectOptions } from "@/types/ui";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import useFormManager from "@/hook/useFormManager";

interface Props {
  statusOptions: SelectOptions[];
}

const SubscriptionsFilters = ({ statusOptions }: Props) => {
  const t = useTranslations("management.subscriptions");

  const { handleToggle, formData } = useFormManager({
    initialData: { status: "" },
    searchFields: ["status"],
  });

  return (
    <SelectField
      name="status"
      label={t("invoices.status")}
      options={statusOptions}
      value={formData.status}
      onValueChange={handleToggle("status")}
      hideClear={false}
      containerClassName="w-[20%]"
    />
  );
};

export default SubscriptionsFilters;
