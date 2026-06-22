"use client";

import { SelectField } from "@/components/ui/select";
import type { SelectOptions } from "@/types/ui";
import { useTranslation } from "react-i18next";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import useFormManager from "@/hooks/useFormManager";

interface Props {
  gymOptions: SelectOptions[];
  coachOptions: SelectOptions[];
  eventOptions: SelectOptions[];
}

const fieldLabel =
  "px-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]";

const ActivityFilters = ({ gymOptions, coachOptions, eventOptions }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: "management.activity" });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { handleToggle, formData } = useFormManager({
    initialData: { gym: "", coach: "", event: "" },
    searchFields: ["gym", "coach", "event"],
  });

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  const setDate = (key: "from" | "to") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) params.set(key, e.target.value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-end gap-3 flex-wrap">
      <SelectField
        name="gym"
        label={t("filters.gym")}
        options={gymOptions}
        value={formData.gym}
        onValueChange={handleToggle("gym")}
        hideClear={false}
        showSearch
        searchPlaceholder={t("filters.searchGyms")}
        containerClassName="w-[220px]"
      />
      <SelectField
        name="coach"
        label={t("filters.coach")}
        options={coachOptions}
        value={formData.coach}
        onValueChange={handleToggle("coach")}
        hideClear={false}
        showSearch
        searchPlaceholder={t("filters.searchCoaches")}
        containerClassName="w-[220px]"
      />
      <SelectField
        name="event"
        label={t("filters.event")}
        options={eventOptions}
        value={formData.event}
        onValueChange={handleToggle("event")}
        hideClear={false}
        containerClassName="w-[200px]"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="from" className={fieldLabel}>{t("filters.from")}</label>
        <input
          id="from"
          type="date"
          value={from}
          max={to || undefined}
          onChange={setDate("from")}
          className="fs-input h-9 w-[150px]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="to" className={fieldLabel}>{t("filters.to")}</label>
        <input
          id="to"
          type="date"
          value={to}
          min={from || undefined}
          onChange={setDate("to")}
          className="fs-input h-9 w-[150px]"
        />
      </div>
    </div>
  );
};

export default ActivityFilters;
