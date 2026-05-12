"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { SelectField } from "@/components/ui/select";
import type { SelectOptions } from "@/types/ui";

interface Props {
  statusLabel: string;
  planLabel: string;
  cityLabel: string;
  statusOptions: SelectOptions[];
  planOptions: SelectOptions[];
  cityOptions: SelectOptions[];
}

export default function GymsFilters({ statusLabel, planLabel, cityLabel, statusOptions, planOptions, cityOptions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <SelectField
        name="status"
        label={statusLabel}
        options={statusOptions}
        value={searchParams.get("status") ?? ""}
        onValueChange={(v) => update("status", v)}
        hideClear={false}
        className="min-w-[130px]"
      />
      <SelectField
        name="plan"
        label={planLabel}
        options={planOptions}
        value={searchParams.get("plan") ?? ""}
        onValueChange={(v) => update("plan", v)}
        hideClear={false}
        className="min-w-[130px]"
      />
      <SelectField
        name="city"
        label={cityLabel}
        options={cityOptions}
        value={searchParams.get("city") ?? ""}
        onValueChange={(v) => update("city", v)}
        hideClear={false}
        className="min-w-[130px]"
      />
    </>
  );
}
