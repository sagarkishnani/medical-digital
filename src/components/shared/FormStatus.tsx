import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { PiCheckLight, PiWarningCircleLight } from "react-icons/pi";

export function fieldErrorId(formId: string, name: string): string {
  return `${formId}-${name}-error`;
}

export function fieldA11yProps(formId: string, name: string, error?: string, describedBy?: string) {
  const ids = [describedBy, error ? fieldErrorId(formId, name) : undefined].filter(Boolean).join(" ");
  return {
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": ids || undefined,
  };
}

export function FieldError({ formId, name, message }: { formId: string; name: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={fieldErrorId(formId, name)} className="flex items-start gap-1.5 text-body-sm text-semantics-error-dark">
      <PiWarningCircleLight aria-hidden="true" className="mt-px h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}

export function FormError({ message, whatsappUrl }: { message: string; whatsappUrl?: string }) {
  return (
    <div role="alert" className="flex flex-col gap-2 rounded-lg bg-semantics-error-lightest px-4 py-3 text-body-sm text-semantics-error-dark">
      <p className="flex items-start gap-2">
        <PiWarningCircleLight aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
        {message}
      </p>
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 self-start font-medium underline"
        >
          <FaWhatsapp aria-hidden="true" className="h-5 w-5" />
          Escríbenos por WhatsApp
        </a>
      )}
    </div>
  );
}

interface SuccessProps {
  title: string;
  text?: string;
  className?: string;
  children?: ReactNode;
}

export function FormSuccess({ title, text, className = "", children }: SuccessProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => containerRef.current?.focus(), []);

  return (
    <div ref={containerRef} tabIndex={-1} role="status" className={`flex flex-col items-center gap-3.5 text-center outline-none ${className}`}>
      <span className="flex h-18 w-18 items-center justify-center rounded-pill bg-semantics-success-lightest">
        <PiCheckLight aria-hidden="true" className="h-[38px] w-[38px] text-semantics-success-dark" />
      </span>
      <p className="text-heading-h3 text-brand-secondary-dark">{title}</p>
      {text && <p className="max-w-[380px] text-body-md text-content-subtle">{text}</p>}
      {children}
    </div>
  );
}

export const SENDING_LABEL = "Enviando…";

export function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        No completes este campo
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
