export interface LocalizedString {
  en: string;
  ar: string;
  [key: string]: string;
}

export type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string };