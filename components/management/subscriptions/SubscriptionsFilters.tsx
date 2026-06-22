"use client";

import { SelectField } from "@/components/ui/select";
import type { SelectOptions } from "@/types/ui";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import useFormManager from "@/hooks/useFormManager";

interface Props {
  statusOptions: SelectOptions[];
}

const SubscriptionsFilters = ({ statusOptions }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: "management.subscriptions" });

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
      containerClassName="w-36"
    />
  );
};

export default SubscriptionsFilters;
