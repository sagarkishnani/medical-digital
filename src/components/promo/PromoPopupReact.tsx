import { useEffect, useRef, useState } from "react";
import { tinaField, useTina } from "tinacms/dist/react";
import { PiXLight } from "react-icons/pi";
import type { PromoPopupQuery, PromoPopupQueryVariables } from "../../../tina/__generated__/types";
import { lockScroll, unlockScroll } from "../../utils/scrollLock";
import { mediaUrl } from "../../utils/mediaUrl";

interface Props {
  query: string;
  variables: PromoPopupQueryVariables;
  data: PromoPopupQuery;
}

const DISMISSED_KEY = "medical-digital-promo-dismissed";
const DEFAULT_DELAY_SECONDS = 5;

function readDismissed(): string | null {
  try {
    return localStorage.getItem(DISMISSED_KEY);
  } catch {
    return null;
  }
}

function writeDismissed(campaign: string) {
  try {
    localStorage.setItem(DISMISSED_KEY, campaign);
  } catch {}
}

export default function PromoPopupReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina<PromoPopupQuery>({ query, variables, data: initialData });
  const promo = data.promoPopup;
  const campaign = promo.campaign || promo.title || "promo";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Dentro del editor de Tina el popup se muestra siempre, para poder editarlo.
    const inEditor = window.self !== window.top;
    if (!inEditor && readDismissed() === campaign) return;
    const delay = inEditor ? 0 : (promo.delaySeconds ?? DEFAULT_DELAY_SECONDS) * 1000;
    const timer = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(timer);
  }, [campaign, promo.delaySeconds]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    if (!dialog.open) dialog.showModal();
    lockScroll();
    return unlockScroll;
  }, [open]);

  const close = () => {
    writeDismissed(campaign);
    dialogRef.current?.close();
    setOpen(false);
  };

  if (!promo.enabled || !open) return null;

  const image = mediaUrl(promo.image);
  const titleId = "promo-popup-title";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={promo.title ? titleId : undefined}
      aria-label={promo.title ? undefined : "Promoción"}
      onClose={close}
      onClick={(event) => event.target === dialogRef.current && close()}
      className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[520px] overflow-y-auto rounded-2xl bg-surface p-0 text-content shadow-2xl backdrop:bg-brand-secondary-darkest/55 backdrop:backdrop-blur-sm open:animate-modal-in backdrop:animate-fade-in"
    >
      <button
        type="button"
        onClick={close}
        aria-label="Cerrar"
        className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-pill bg-surface/90 text-brand-secondary-dark shadow transition-colors hover:bg-greyscale-lightest"
      >
        <PiXLight aria-hidden="true" className="h-5 w-5" />
      </button>

      {image && (
        <img
          src={image}
          alt={promo.imageAlt || ""}
          className="max-h-[50vh] w-full object-cover"
          data-tina-field={tinaField(promo, "image")}
        />
      )}

      <div className="flex flex-col gap-3 p-6 md:p-8">
        {promo.title && (
          <h2 id={titleId} className="pr-10 text-heading-h3 text-brand-secondary-dark" data-tina-field={tinaField(promo, "title")}>
            {promo.title}
          </h2>
        )}
        {promo.text && (
          <p className="whitespace-pre-line text-body-md text-content-muted" data-tina-field={tinaField(promo, "text")}>
            {promo.text}
          </p>
        )}
        {promo.buttonLabel && promo.buttonUrl && (
          <a
            href={promo.buttonUrl}
            onClick={close}
            className="btn-primary mt-2 self-start px-8"
            data-tina-field={tinaField(promo, "buttonLabel")}
          >
            {promo.buttonLabel}
          </a>
        )}
      </div>
    </dialog>
  );
}
