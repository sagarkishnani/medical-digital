import { useEffect, useRef, useState } from "react";
import type { AnimationEvent } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { PiEnvelopeSimpleLight, PiXLight } from "react-icons/pi";
import { FieldError, FormError, FormSuccess, HoneypotField, SENDING_LABEL, fieldA11yProps } from "./FormStatus";
import Turnstile from "./Turnstile";
import { useFormSubmission } from "../../hooks/useFormSubmission";

export interface QuoteProduct {
  name: string;
  whatsappUrl: string;
  productUrl: string;
}

export interface QuoteTexts {
  recipientNote?: string | null;
  consentLabel?: string | null;
  privacyLabel?: string | null;
  privacyUrl?: string | null;
  successTitle?: string | null;
  successText?: string | null;
  closeLabel?: string | null;
  errorText?: string | null;
}

interface Props {
  product: QuoteProduct | null;
  texts?: QuoteTexts | null;
  onClose: () => void;
}

const fieldBaseClass =
  "w-full rounded-lg border border-line bg-surface px-4 text-body-sm text-brand-secondary-dark placeholder:text-content-subtle focus:border-brand-secondary-dark focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 aria-[invalid=true]:border-semantics-error-dark";

const FIELDS = [
  { name: "name", label: "Nombre y apellido", type: "text", autoComplete: "name" },
  { name: "institution", label: "Institución", type: "text", autoComplete: "organization" },
  { name: "email", label: "Correo electrónico", type: "email", autoComplete: "email" },
  { name: "phone", label: "Teléfono", type: "tel", autoComplete: "tel" },
];

export default function QuoteModal({ product, texts, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState<QuoteProduct | null>(product);
  const [closing, setClosing] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const { formId, status, errors, handleSubmit, clearFieldError, reset, captcha } = useFormSubmission("cotizacion", {
    product: shown?.name ?? "",
    productUrl: shown?.productUrl ?? "",
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (product) {
      setShown(product);
      setClosing(false);
      setOpenCount((count) => count + 1);
      reset();
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      setClosing(true);
    }
  }, [product, reset]);

  const finishClosing = (event: AnimationEvent<HTMLDialogElement>) => {
    if (!closing || event.target !== dialogRef.current || event.pseudoElement) return;
    dialogRef.current.close();
    setClosing(false);
    setShown(null);
  };

  const fieldId = (name: string) => `${formId}-${name}`;
  const sending = status === "sending";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${formId}-title`}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onAnimationEnd={finishClosing}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      className={`w-[calc(100%-2rem)] max-w-[560px] rounded-2xl bg-surface p-0 text-brand-secondary-dark backdrop:bg-brand-secondary-darkest/55 backdrop:backdrop-blur-sm ${closing ? "animate-modal-out backdrop:animate-fade-out" : "open:animate-modal-in backdrop:animate-fade-in"}`}
    >
      {shown && status === "success" && (
        <div className="p-6 md:p-9">
          <h2 id={`${formId}-title`} className="sr-only">
            {shown.name}
          </h2>
          <FormSuccess title={texts?.successTitle || "¡Solicitud enviada!"} text={texts?.successText || undefined} className="py-5">
            <button type="button" onClick={onClose} className="btn mt-2 border-brand-secondary-dark bg-surface px-7 text-brand-secondary-dark hover:bg-greyscale-lightest">
              {texts?.closeLabel || "Cerrar"}
            </button>
          </FormSuccess>
        </div>
      )}

      {shown && status !== "success" && (
        <form
          key={openCount}
          className="relative flex flex-col gap-5 p-6 md:p-9"
          onSubmit={handleSubmit}
          onInput={clearFieldError}
          noValidate
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="text-body-sm text-content-subtle">Solicitar cotización</p>
              <h2 id={`${formId}-title`} className="text-heading-h3">
                {shown.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-greyscale-lightest transition-colors hover:bg-greyscale-light"
            >
              <PiXLight aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <HoneypotField />

          <div className="grid gap-3.5 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label htmlFor={fieldId(field.name)} className="sr-only">
                  {field.label} (obligatorio)
                </label>
                <input
                  id={fieldId(field.name)}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  required
                  placeholder={`${field.label}*`}
                  className={`${fieldBaseClass} h-[50px]`}
                  {...fieldA11yProps(formId, field.name, errors[field.name])}
                />
                <FieldError formId={formId} name={field.name} message={errors[field.name]} />
              </div>
            ))}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor={fieldId("message")} className="sr-only">
                Cantidad, plazo o consulta adicional
              </label>
              <textarea
                id={fieldId("message")}
                name="message"
                rows={3}
                placeholder="Cantidad, plazo o consulta adicional"
                className={`${fieldBaseClass} h-24 resize-none py-3.5`}
                {...fieldA11yProps(formId, "message", errors.message)}
              />
              <FieldError formId={formId} name="message" message={errors.message} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex cursor-pointer items-start gap-2.5 text-body-sm text-content-muted">
              <input
                type="checkbox"
                name="consent"
                required
                className="mt-px h-5 w-5 shrink-0 accent-brand-secondary-dark"
                {...fieldA11yProps(formId, "consent", errors.consent)}
              />
              <span>
                {texts?.consentLabel || "Acepto la"}{" "}
                {texts?.privacyUrl ? (
                  <a href={texts.privacyUrl} className="text-brand-tertiary-dark underline" target="_blank" rel="noopener noreferrer">
                    {texts.privacyLabel || "política de datos personales"}
                  </a>
                ) : (
                  <span>{texts?.privacyLabel || "política de datos personales"}</span>
                )}
              </span>
            </label>
            <FieldError formId={formId} name="consent" message={errors.consent} />
          </div>

          {texts?.recipientNote && (
            <p className="flex items-center gap-2 text-caption text-content-subtle">
              <PiEnvelopeSimpleLight aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
              {texts.recipientNote}
            </p>
          )}

          <Turnstile {...captcha} />
          <FieldError formId={formId} name="captcha" message={errors.captcha} />

          {status === "error" && <FormError message={texts?.errorText || "No pudimos enviar tu solicitud. Inténtalo de nuevo."} />}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" aria-disabled={sending || undefined} className="btn-primary sm:flex-1">
              {sending ? SENDING_LABEL : "Enviar solicitud"}
            </button>
            {shown.whatsappUrl && (
              <a
                href={shown.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn border-semantics-success bg-surface px-5 text-semantics-success-dark hover:bg-semantics-success-lightest"
              >
                <FaWhatsapp aria-hidden="true" className="h-5 w-5" />
                Hablar con un asesor
              </a>
            )}
          </div>
        </form>
      )}
    </dialog>
  );
}
