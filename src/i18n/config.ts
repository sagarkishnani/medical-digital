/**
 * Locale configuration. The default locale lives at the root of the site; every
 * other locale lives under its own path prefix (/en/...).
 */
export const LOCALES = [
  "es",
] as const;

export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
