import { useEffect, useId, useRef } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { PiXLight } from "react-icons/pi";

export interface QuoteProduct {
  name: string;
  whatsappUrl: string;
}

interface Props {
  product: QuoteProduct | null;
  onClose: () => void;
}

const fieldClass =
  "h-[50px] w-full rounded-lg border border-line bg-surface px-4 text-body-sm text-brand-secondary-dark placeholder:text-content-subtle focus:border-brand-secondary-dark focus:outline-none";

const FIELDS = [
  { name: "name", label: "Nombre y apellido", type: "text", autoComplete: "name" },
  { name: "institution", label: "Institución", type: "text", autoComplete: "organization" },
  { name: "email", label: "Correo electrónico", type: "email", autoComplete: "email" },
  { name: "phone", label: "Teléfono", type: "tel", autoComplete: "tel" },
];

export default function QuoteModal({ product, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (product && !dialog.open) dialog.showModal();
    if (!product && dialog.open) dialog.close();
  }, [product]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      className="w-[calc(100%-2rem)] max-w-[560px] rounded-2xl bg-surface p-0 text-brand-secondary-dark backdrop:bg-brand-secondary-darkest/55 backdrop:backdrop-blur-sm"
    >
      {product && (
        <form className="flex flex-col gap-5 p-6 md:p-9" onSubmit={(event) => event.preventDefault()} noValidate>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="text-body-sm text-content-subtle">Solicitar cotización</p>
              <h2 id={`${id}-title`} className="text-heading-h3">
                {product.name}
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

          <div className="grid gap-3.5 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.name}>
                <label htmlFor={`${id}-${field.name}`} className="sr-only">
                  {field.label} (obligatorio)
                </label>
                <input
                  id={`${id}-${field.name}`}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  required
                  placeholder={`${field.label}*`}
                  className={fieldClass}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label htmlFor={`${id}-message`} className="sr-only">
                Cantidad, plazo o consulta adicional
              </label>
              <textarea
                id={`${id}-message`}
                name="message"
                rows={3}
                placeholder="Cantidad, plazo o consulta adicional"
                className={`${fieldClass} h-24 resize-none py-3.5`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" className="btn-primary flex-1">
              Enviar solicitud
            </button>
            {product.whatsappUrl && (
              <a
                href={product.whatsappUrl}
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
