import { useState, useEffect, useCallback, useRef } from "react";
import { tinaField, useTina } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type {
  CookieConsentQuery,
  CookieConsentQueryVariables,
} from "../../../tina/__generated__/types";
import { lockScroll, unlockScroll } from "../../utils/scrollLock";

interface Props {
  query: string;
  variables: CookieConsentQueryVariables;
  data: CookieConsentQuery;
}

interface Category {
  key?: string | null;
  name?: string | null;
  description?: string | null;
  alwaysActive?: boolean | null;
}

type View = "hidden" | "banner" | "settings";

const STORAGE_KEY = "medical-digital-cookie-consent:v1";

function readConsent(): Record<string, boolean> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeConsent(prefs: Record<string, boolean>) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...prefs, ts: Date.now() })
    );
  } catch {
    /* localStorage unavailable — consent just isn't persisted */
  }
}

/* Small on/off switch */
function Toggle({
  on,
  disabled,
  onChange,
  label,
}: {
  on: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        on ? "bg-accent" : "bg-greyscale-medium/35"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-surface shadow transition-transform ${
          on ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

export default function CookieConsentReact({
  query,
  variables,
  data: initialData,
}: Props) {
  const { data } = useTina<CookieConsentQuery>({
    query,
    variables,
    data: initialData,
  });
  const cc = (data?.cookieConsent as any) || (initialData?.cookieConsent as any);

  const categories: Category[] = (cc?.categories || []).filter(Boolean);
  const bannerText =
    cc?.bannerText || "Usamos cookies para que la web funcione y, con tu permiso, para entender cómo la usas.";
  const btnConfigure = cc?.btnConfigure || "Configurar";
  const title = cc?.title || "Personalizar las preferencias de consentimiento";
  const intro = cc?.intro;
  const showMoreText = cc?.showMoreText || "Mostrar más";
  const showMoreUrl = cc?.showMoreUrl || "#";
  const btnReject = cc?.btnReject || "Rechazar todo";
  const btnSave = cc?.btnSave || "Guardar mis preferencias";
  const btnAccept = cc?.btnAccept || "Aceptar todo";
  const alwaysActiveLabel = cc?.alwaysActiveLabel || "Siempre activa";

  const [view, setView] = useState<View>("hidden");
  const [consented, setConsented] = useState(true);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  /* Build the default prefs (alwaysActive forced ON, rest from saved or false) */
  const buildPrefs = useCallback(
    (saved: Record<string, boolean> | null) => {
      const next: Record<string, boolean> = {};
      for (const c of categories) {
        if (!c.key) continue;
        next[c.key] = c.alwaysActive ? true : !!saved?.[c.key];
      }
      return next;
    },
    [categories]
  );

  /* Decide visibility after mount (no localStorage during SSR) */
  useEffect(() => {
    const saved = readConsent();
    setPrefs(buildPrefs(saved));
    setConsented(!!saved);
    if (!saved) setView("banner");

    const openSettings = () => {
      setPrefs(buildPrefs(readConsent()));
      setView("settings");
    };
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.(
        'a[href="#preferencias-cookies"]'
      );
      if (target) {
        e.preventDefault();
        openSettings();
      }
    };
    window.addEventListener("open-cookie-consent", openSettings);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("open-cookie-consent", openSettings);
      document.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (view === "settings") {
      if (!dialog.open) dialog.showModal();
      lockScroll();
      return unlockScroll;
    }
    if (dialog.open) dialog.close();
  }, [view]);

  const openSettings = () => {
    setPrefs(buildPrefs(readConsent()));
    setView("settings");
  };
  const closeSettings = () => setView(readConsent() ? "hidden" : "banner");

  const persistAndClose = (next: Record<string, boolean>) => {
    writeConsent(next);
    setConsented(true);
    setView("hidden");
  };

  const acceptAll = () => {
    const next: Record<string, boolean> = {};
    categories.forEach((c) => c.key && (next[c.key] = true));
    persistAndClose(next);
  };
  const rejectAll = () => {
    const next: Record<string, boolean> = {};
    categories.forEach((c) => c.key && (next[c.key] = !!c.alwaysActive));
    persistAndClose(next);
  };
  const savePrefs = () => {
    const next: Record<string, boolean> = { ...prefs };
    categories.forEach((c) => c.key && c.alwaysActive && (next[c.key] = true));
    persistAndClose(next);
  };

  const showBanner = view === "banner" || (view === "settings" && !consented);

  return (
    <>
      {showBanner && (
        <div
          role="region"
          aria-label="Aviso de cookies"
          className="fixed inset-x-4 bottom-[calc(88px_+_max(16px,env(safe-area-inset-bottom)))] z-[100] animate-sheet-in rounded-xl border border-line bg-surface p-5 shadow-lg md:bottom-6 md:left-6 md:right-auto md:w-[440px] max-lg:[body:has([data-mobile-bottom-bar])_&]:bottom-[calc(88px_+_max(16px,env(safe-area-inset-bottom)))]"
        >
          <p className="text-body-sm text-content-muted" data-tina-field={tinaField(cc, "bannerText")}>
            {bannerText}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={openSettings}
              className="btn-link self-start text-body-sm font-medium sm:mr-auto sm:self-auto"
              data-tina-field={tinaField(cc, "btnConfigure")}
            >
              {btnConfigure}
            </button>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button type="button" onClick={rejectAll} className="btn-secondary btn-md px-3 sm:px-5">
                {btnReject}
              </button>
              <button type="button" onClick={acceptAll} className="btn-primary btn-md px-3 sm:px-5">
                {btnAccept}
              </button>
            </div>
          </div>
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-label={title}
        onClose={closeSettings}
        onClick={(event) => event.target === dialogRef.current && closeSettings()}
        className="max-h-[88vh] w-[calc(100%-2rem)] max-w-[480px] overflow-y-auto rounded-2xl bg-surface p-0 text-content shadow-2xl backdrop:bg-brand-secondary-darkest/55 open:animate-modal-in backdrop:animate-fade-in"
      >
        <div className="p-5 md:p-7">
          <div className="mb-3 flex items-start justify-between gap-4">
            <h2 className="text-subtitle text-content">{title}</h2>
            <button
              type="button"
              onClick={closeSettings}
              aria-label="Cerrar"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-content-subtle transition-colors hover:bg-surface-raised"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="prose prose-sm mb-1 max-w-none prose-p:text-body-sm prose-p:text-content-muted">
            {intro && <TinaMarkdown content={intro} />}
          </div>
          <a href={showMoreUrl} className="text-body-sm font-medium text-accent hover:underline">
            {showMoreText}
          </a>

          <div className="mt-4 divide-y divide-line border-t border-line">
            {categories.map((c, i) => {
              const id = c.key || String(i);
              const isOpen = expanded === id;
              return (
                <div key={id}>
                  <div className="flex items-center justify-between gap-3 py-3">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : id)}
                      aria-expanded={isOpen}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <svg
                        className={`h-3.5 w-3.5 shrink-0 text-content-subtle transition-transform duration-200 ${
                          isOpen ? "rotate-90" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="truncate text-body-sm font-semibold text-content">{c.name}</span>
                    </button>
                    {c.alwaysActive ? (
                      <span className="shrink-0 text-overline uppercase tracking-wider text-accent">
                        {alwaysActiveLabel}
                      </span>
                    ) : (
                      <Toggle
                        on={!!(c.key && prefs[c.key])}
                        label={c.name || ""}
                        onChange={(v) =>
                          c.key && setPrefs((p) => ({ ...p, [c.key!]: v }))
                        }
                      />
                    )}
                  </div>
                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-4 pl-[22px] pr-1 text-caption text-content-muted">{c.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button type="button" onClick={savePrefs} className="btn-secondary btn-md col-span-2 px-3">
              {btnSave}
            </button>
            <button type="button" onClick={rejectAll} className="btn-secondary btn-md px-3">
              {btnReject}
            </button>
            <button type="button" onClick={acceptAll} className="btn-primary btn-md px-3">
              {btnAccept}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
