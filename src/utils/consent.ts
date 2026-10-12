export const CONSENT_KEY = "medical-digital-cookie-consent:v1";
export const CONSENT_EVENT = "cookie-consent-change";

export function readConsent(): Record<string, boolean> | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function hasConsent(category: "funcional" | "analitica"): boolean {
  return readConsent()?.[category] === true;
}
