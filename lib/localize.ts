import type { LocalizedString } from "@/types/common";

export type { LocalizedString };

export function getLocalizedValue(
  data: LocalizedString | undefined | null,
  locale: string,
): string {
  if (!data) return "";

  // Return requested locale or fallback to English, then any available string
  return data[locale] || data.en || Object.values(data)[0] || "";
}
