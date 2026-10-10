import { useTina, tinaField } from "tinacms/dist/react";
import { FieldError, FormError, FormSuccess, HoneypotField, SENDING_LABEL, fieldA11yProps } from "../shared/FormStatus";
import Turnstile from "../shared/Turnstile";
import { useFormSubmission } from "../../hooks/useFormSubmission";

interface Props {
  query: string;
  variables: object;
  data: any;
  specialties: string[];
  whatsappUrl: string;
}

const labelClass = "flex flex-col gap-2 text-body-sm text-content-muted";
const controlClass =
  "h-[52px] w-full rounded-lg border border-line bg-surface-raised px-4 text-body-md text-brand-secondary-dark focus:border-brand-secondary-dark focus:bg-surface focus:outline-none aria-[invalid=true]:border-semantics-error-dark";
const cardClass = "flex flex-col gap-3.5 rounded-2xl bg-surface p-[22px] md:gap-6 md:p-11";

const TEXT_FIELDS = [
  { name: "firstName", label: "Nombre", type: "text", autoComplete: "given-name", required: true },
  { name: "lastName", label: "Apellidos", type: "text", autoComplete: "family-name", required: true },
  { name: "phone", label: "Teléfono móvil", type: "tel", autoComplete: "tel", required: true },
  { name: "email", label: "Correo electrónico", type: "email", autoComplete: "email", required: true },
  { name: "position", label: "Cargo", type: "text", autoComplete: "organization-title", required: false },
  { name: "institution", label: "Institución", type: "text", autoComplete: "organization", required: true },
];

function RequiredMark({ required }: { required: boolean }) {
  return required ? <span aria-hidden="true">*</span> : null;
}

export default function ContactFormReact({ query, variables, data: initialData, specialties, whatsappUrl }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const { formId, status, errors, handleSubmit, clearFieldError, reset, captcha } = useFormSubmission("contacto");
  const form = data?.contact?.form;
  if (!form) return <div hidden />;

  if (status === "success") {
    return (
      <div className={cardClass}>
        <FormSuccess title={form.successTitle || "¡Mensaje enviado!"} text={form.successText} className="py-14">
          <button type="button" onClick={reset} className="btn-link">
            {form.successReset || "Enviar otro mensaje"}
          </button>
        </FormSuccess>
      </div>
    );
  }

  const locations = (form.locations || []).filter(Boolean);
  const sending = status === "sending";
  const fieldId = (name: string) => `${formId}-${name}`;

  return (
    <form className={`relative ${cardClass}`} noValidate onSubmit={handleSubmit} onInput={clearFieldError}>
      {form.title && (
        <h2 className="text-heading-h3 text-brand-secondary-dark md:text-heading-h2" data-tina-field={tinaField(form, "title")}>
          {form.title}
        </h2>
      )}

      <HoneypotField />

      <div className="grid gap-3.5 sm:grid-cols-2 md:gap-[18px]">
        {TEXT_FIELDS.map((field) => (
          <div key={field.name} className={labelClass}>
            <label htmlFor={fieldId(field.name)}>
              {field.label}
              <RequiredMark required={field.required} />
            </label>
            <input
              id={fieldId(field.name)}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              required={field.required}
              className={controlClass}
              {...fieldA11yProps(formId, field.name, errors[field.name])}
            />
            <FieldError formId={formId} name={field.name} message={errors[field.name]} />
          </div>
        ))}

        {locations.length > 0 && (
          <div className={labelClass} data-tina-field={tinaField(form, "locations")}>
            <label htmlFor={fieldId("location")}>
              Ubicación
              <RequiredMark required />
            </label>
            <select
              id={fieldId("location")}
              name="location"
              required
              defaultValue=""
              className={controlClass}
              {...fieldA11yProps(formId, "location", errors.location)}
            >
              <option value="" disabled>
                Selecciona
              </option>
              {locations.map((location: string) => (
                <option key={location}>{location}</option>
              ))}
            </select>
            <FieldError formId={formId} name="location" message={errors.location} />
          </div>
        )}

        {specialties.length > 0 && (
          <div className={labelClass}>
            <label htmlFor={fieldId("specialty")}>Especialidad</label>
            <select id={fieldId("specialty")} name="specialty" defaultValue="" className={controlClass}>
              <option value="" disabled>
                Selecciona
              </option>
              {specialties.map((specialty) => (
                <option key={specialty}>{specialty}</option>
              ))}
              <option>Otra</option>
            </select>
          </div>
        )}

        <div className={`${labelClass} sm:col-span-2`}>
          <label htmlFor={fieldId("message")}>Mensaje</label>
          <textarea
            id={fieldId("message")}
            name="message"
            rows={4}
            className={`${controlClass} h-[130px] resize-none py-3.5`}
            {...fieldA11yProps(formId, "message", errors.message)}
          />
          <FieldError formId={formId} name="message" message={errors.message} />
        </div>
      </div>

      <Turnstile {...captcha} />
      <FieldError formId={formId} name="captcha" message={errors.captcha} />

      {status === "error" && (
        <FormError message={form.errorText || "No pudimos enviar tu mensaje. Inténtalo de nuevo."} whatsappUrl={whatsappUrl} />
      )}

      <div className="flex flex-col gap-4 sm:gap-6 sm:border-t sm:border-line sm:pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-start gap-2.5 text-body-sm text-content-muted sm:items-center sm:gap-3">
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
                <span>{form.privacyLabel}</span>
              )}
            </span>
          </label>
          <FieldError formId={formId} name="consent" message={errors.consent} />
        </div>
        <button
          type="submit"
          aria-disabled={sending || undefined}
          className="btn-primary h-[54px] shrink-0 px-11"
          data-tina-field={tinaField(form, "submitLabel")}
        >
          {sending ? SENDING_LABEL : form.submitLabel || "Enviar"}
        </button>
      </div>
    </form>
  );
}
