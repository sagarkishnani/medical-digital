/**
 * i18n helpers. All BASE_URL-aware, so they keep working under a subpath deploy.
 *
 * - getLocale(url): derives the locale from the path (/en → 'en', otherwise 'es').
 * - localizedPath(pathname, locale): the same route in the other language.
 * - tField(obj, key, locale): reads `key_<locale>` with fallback to `key` (the default language).
 *
 * The CMS convention behind tField: every translatable field has an optional
 * sibling named `<field>_<locale>` (e.g. `title` + `title_en`). An empty sibling
 * means "not translated yet" and falls back to the default language, per field.
 */
import { DEFAULT_LOCALE, type Locale } from "../i18n/config";

const BASE = import.meta.env.BASE_URL || "/";

/** Normalized base with leading and trailing slash: "/" or "/subpath/". */
function normBase(): string {
  let b = BASE;
  if (!b.startsWith("/")) b = "/" + b;
  if (!b.endsWith("/")) b = b + "/";
  return b;
}

/** Path relative to base, no edge slashes: "/sub/en/about/" → "en/about". */
export function stripBase(pathname: string): string {
  const b = normBase();
  let p = pathname.startsWith(b) ? pathname.slice(b.length) : pathname.replace(/^\//, "");
  return p.replace(/^\/+|\/+$/g, "");
}

export function getLocale(url: URL | string): Locale {
  const pathname = typeof url === "string" ? url : url.pathname;
  const rel = stripBase(pathname);
  // The cast keeps this file valid in single-locale projects, where the second
  // locale is not part of the Locale union.
  return rel === "en" || rel.startsWith("en/")
    ? ("en" as Locale)
    : DEFAULT_LOCALE;
}

export function localizedPath(pathname: string, locale: Locale): string {
  const b = normBase();
  const hadTrailing = pathname.endsWith("/");
  let rel = stripBase(pathname);

  // Strip the existing language prefix to get the default-language route.
  if (rel === "en") rel = "";
  else if (rel.startsWith("en/")) rel = rel.slice("en/".length);

  const localized =
    locale === DEFAULT_LOCALE ? rel : rel ? `${locale}/${rel}` : locale;
  let out = `${b}${localized}`.replace(/\/{2,}/g, "/");
  if (hadTrailing && !out.endsWith("/")) out += "/";
  return out;
}

/**
 * Localizes an internal href to the active locale: prefixes internal routes with
 * the language segment, and leaves external links, anchors, mailto/tel and links
 * flagged as external untouched. In the default language the href is unchanged.
 */
export function localizeHref(
  url: string | null | undefined,
  locale: Locale,
  external?: boolean | null
): string {
  const u = url || "";
  if (!u || locale === DEFAULT_LOCALE || external) return u;
  // External (protocol or //), pure anchors, mailto/tel: untouched.
  if (/^([a-z]+:)?\/\//i.test(u) || /^(#|mailto:|tel:)/i.test(u)) return u;
  // Only absolute internal routes ("/something").
  if (!u.startsWith("/")) return u;
  return localizedPath(u, locale);
}

export function tField(
  obj: Record<string, any> | null | undefined,
  key: string,
  locale: Locale
): string {
  if (!obj) return "";
  if (locale !== DEFAULT_LOCALE) {
    const translated = obj[`${key}_${locale}`];
    if (translated != null && translated !== "") return translated;
  }
  return obj[key] ?? "";
}

/**
 * true when a rich-text node (Tina's AST) carries non-empty text.
 * Tina returns an EMPTY rich-text object (truthy but textless) even when the
 * translated field is absent, so a truthiness check would render a blank block.
 */
export function richHasContent(node: any): boolean {
  const walk = (n: any): string => {
    if (!n) return "";
    if (typeof n.text === "string") return n.text;
    if (Array.isArray(n?.children)) return n.children.map(walk).join("");
    if (Array.isArray(n)) return n.map(walk).join("");
    return "";
  };
  return walk(node?.children ?? node).trim().length > 0;
}

/** Picks the translated rich-text only when it has content; otherwise the default one. */
export function richField(obj: any, key: string, locale: Locale): any {
  if (!obj) return null;
  if (locale !== DEFAULT_LOCALE && richHasContent(obj[`${key}_${locale}`])) {
    return obj[`${key}_${locale}`];
  }
  return obj[key];
}
