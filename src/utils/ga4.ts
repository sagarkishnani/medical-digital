const GA4_ID_PATTERN = /^G-[A-Z0-9]{6,}$/;
const warnedIds = new Set<string>();

export function resolveGa4Id(raw: string | null | undefined): string {
  const id = raw?.trim() ?? "";
  if (!id || GA4_ID_PATTERN.test(id)) return id;
  if (!warnedIds.has(id)) {
    warnedIds.add(id);
    console.warn(`[analytics] El ID de GA4 "${id}" no tiene el formato G-XXXXXXXXXX. No se carga Google Analytics.`);
  }
  return "";
}
