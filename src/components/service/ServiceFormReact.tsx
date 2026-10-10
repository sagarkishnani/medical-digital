import { useTina, tinaField } from "tinacms/dist/react";
import { FieldError, FormError, FormSuccess, HoneypotField, SENDING_LABEL, fieldA11yProps } from "../shared/FormStatus";
import Turnstile from "../shared/Turnstile";
import { useFormSubmission } from "../../hooks/useFormSubmission";

interface Props {
  query: string;
  variables: object;
  data: any;
  whatsappUrl: string;
}

const labelClass = "flex flex-col gap-1.5 text-body-sm text-content-muted md:gap-2";
const controlClass =
  "w-full rounded-xl border border-line bg-surface-raised px-3.5 text-body-md text-brand-secondary-dark focus:border-brand-secondary-dark focus:bg-surface focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 aria-[invalid=true]:border-semantics-error-dark md:px-4";
const inputClass = `${controlClass} h-[50px] md:h-[52px]`;
const cardClass = "flex flex-col gap-3.5 rounded-[22px] bg-surface p-[22px] md:gap-[22px] md:rounded-[28px] md:p-12";

const TEXT_FIELDS = [
  { name: "firstName", label: "Nombres", type: "text", autoComplete: "given-name", span: "md:col-span-3" },
  { name: "lastName", label: "Apellidos", type: "text", autoComplete: "family-name", span: "md:col-span-3" },
  { name: "email", label: "Correo electrónico", type: "email", autoComplete: "email", span: "md:col-span-2" },
  { name: "phone", label: "Teléfono móvil", type: "tel", autoComplete: "tel", span: "md:col-span-2" },
  { name: "institution", label: "Institución", type: "text", autoComplete: "organization", span: "md:col-span-2" },
  { name: "brand", label: "Marca", type: "text", autoComplete: "off", span: "md:col-span-2" },
  { name: "model", label: "Modelo", type: "text", autoComplete: "off", span: "md:col-span-2" },
  { name: "serial", label: "Serie", type: "text", autoComplete: "off", span: "md:col-span-2" },
];

export default function ServiceFormReact({ query, variables, data: initialData, whatsappUrl }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const { formId, status, errors, handleSubmit, clearFieldError, reset, captcha } = useFormSubmission("servicio-tecnico");
  const form = data?.service?.form;
  if (!form) return <div hidden />;

  if (status === "success") {
    return (
      <div className={cardClass}>
        <FormSuccess title={form.successTitle || "Solicitud registrada"} text={form.successText} className="py-12">
          <button type="button" onClick={reset} className="btn-link">
            {form.successReset || "Enviar otra solicitud"}
          </button>
        </FormSuccess>
      </div>
    );
  }

  const sending = status === "sending";
  const fieldId = (name: string) => `${formId}-${name}`;
  const incidentHintId = `${formId}-incident-hint`;

  return (
    <form className={`relative ${cardClass}`} noValidate onSubmit={handleSubmit} onInput={clearFieldError}>
      <HoneypotField />

      <div className="grid gap-3.5 md:grid-cols-6 md:gap-5">
        {TEXT_FIELDS.map((field) => (
          <div key={field.name} className={`${labelClass} ${field.span}`}>
            <label htmlFor={fieldId(field.name)}>
              {field.label}
              <span aria-hidden="true">*</span>
            </label>
            <input
              id={fieldId(field.name)}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              required
              className={inputClass}
              {...fieldA11yProps(formId, field.name, errors[field.name])}
            />
            <FieldError formId={formId} name={field.name} message={errors[field.name]} />
          </div>
        ))}

        <div className={`${labelClass} md:col-span-6`}>
          <label htmlFor={fieldId("message")}>
            Mensaje del incidente
            <span aria-hidden="true">**</span>
          </label>
          <textarea
            id={fieldId("message")}
            name="message"
            required
            rows={4}
            className={`${controlClass} h-[120px] resize-none py-3 md:h-[140px] md:py-3.5`}
            {...fieldA11yProps(formId, "message", errors.message, form.incidentHint ? incidentHintId : undefined)}
          />
          <FieldError formId={formId} name="message" message={errors.message} />
        </div>
      </div>

      {(form.incidentHint || form.requiredNote) && (
        <div className="flex flex-col gap-1.5 text-caption text-content-subtle md:text-body-sm">
          {form.incidentHint && (
            <p id={incidentHintId} data-tina-field={tinaField(form, "incidentHint")}>
              {form.incidentHint}
            </p>
          )}
          {form.requiredNote && <p data-tina-field={tinaField(form, "requiredNote")}>{form.requiredNote}</p>}
        </div>
      )}

      <Turnstile {...captcha} />
      <FieldError formId={formId} name="captcha" message={errors.captcha} />

      {status === "error" && (
        <FormError message={form.errorText || "No pudimos enviar tu solicitud. Inténtalo de nuevo."} whatsappUrl={whatsappUrl} />
      )}

      <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between md:gap-6 md:border-t md:border-line md:pt-[22px]">
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-start gap-2.5 text-body-sm text-brand-secondary-dark md:items-center md:gap-3">
            <input
              type="checkbox"
              name="consent"
              required
              className="h-5 w-5 shrink-0 accent-brand-secondary-dark"
              {...fieldA11yProps(formId, "consent", errors.consent)}
            />
            <span data-tina-field={tinaField(form, "consentLabel")}>
              {form.consentLabel}{" "}
              {form.privacyUrl ? (
                <a href={form.privacyUrl} className="text-brand-tertiary-dark underline" target="_blank" rel="noopener noreferrer">
                  {form.privacyLabel}
                </a>
              ) : (
                <span className="text-brand-tertiary-dark underline">{form.privacyLabel}</span>
              )}
            </span>
          </label>
          <FieldError formId={formId} name="consent" message={errors.consent} />
        </div>
        <button
          type="submit"
          aria-disabled={sending || undefined}
          className="btn-primary h-[54px] w-full shrink-0 px-11 md:w-auto"
          data-tina-field={tinaField(form, "submitLabel")}
        >
          {sending ? SENDING_LABEL : form.submitLabel || "Enviar solicitud"}
        </button>
      </div>
    </form>
  );
}
