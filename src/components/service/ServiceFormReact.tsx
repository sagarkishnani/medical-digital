import { useState } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import {
  CharacterCount,
  FieldError,
  FormError,
  FormSuccess,
  HoneypotField,
  SENDING_LABEL,
  characterCountId,
  fieldA11yProps,
} from "../shared/FormStatus";
import Turnstile from "../shared/Turnstile";
import { useFormSubmission } from "../../hooks/useFormSubmission";
import { FORM_FIELDS, OTHER_BRAND_VALUE } from "../../utils/formValidation";
import type { WooBrand } from "../../lib/woo/types";

interface Props {
  query: string;
  variables: object;
  data: any;
  whatsappUrl: string;
  brands: WooBrand[];
}

const labelClass = "flex flex-col gap-1.5 text-body-sm text-content-muted md:gap-2";
const controlClass =
  "w-full rounded-xl border border-line bg-surface-raised px-3.5 text-body-md text-brand-secondary-dark placeholder:text-content-subtle focus:border-brand-secondary-dark focus:bg-surface focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 aria-[invalid=true]:border-semantics-error-dark md:px-4";
const inputClass = `${controlClass} h-[50px] md:h-[52px]`;
const cardClass = "flex flex-col gap-3.5 rounded-[22px] bg-surface p-[22px] md:gap-[22px] md:rounded-[28px] md:p-12";

const FIELDS = FORM_FIELDS["servicio-tecnico"];
const MESSAGE_MAX = FIELDS.message.maxLength;

const CONTACT_FIELDS = [
  { name: "firstName", label: "Nombres", type: "text", autoComplete: "given-name", span: "md:col-span-3", placeholder: "Ej. María" },
  { name: "lastName", label: "Apellidos", type: "text", autoComplete: "family-name", span: "md:col-span-3", placeholder: "Ej. Pérez García" },
  { name: "email", label: "Correo electrónico", type: "email", autoComplete: "email", span: "md:col-span-2", placeholder: "nombre@institucion.com" },
  { name: "phone", label: "Teléfono móvil", type: "tel", autoComplete: "tel", span: "md:col-span-2", placeholder: "Ej. 987654321" },
  { name: "institution", label: "Institución", type: "text", autoComplete: "organization", span: "md:col-span-2", placeholder: "Nombre de la institución" },
];

const EQUIPMENT_FIELDS = [
  { name: "model", label: "Modelo", type: "text", autoComplete: "off", span: "md:col-span-2", placeholder: "Ej. AT-102" },
  { name: "serial", label: "Serie", type: "text", autoComplete: "off", span: "md:col-span-2", placeholder: "Ej. 1234567" },
];

const NUMERIC_PROPS = { inputMode: "numeric" as const, pattern: "[0-9]*" };

export default function ServiceFormReact({ query, variables, data: initialData, whatsappUrl, brands }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const { formId, status, errors, handleSubmit, clearFieldError, handleBlur, reset, captcha } = useFormSubmission("servicio-tecnico");
  const [brand, setBrand] = useState("");
  const [messageLength, setMessageLength] = useState(0);
  const form = data?.service?.form;
  if (!form) return <div hidden />;

  const resetForm = () => {
    setBrand("");
    setMessageLength(0);
    reset();
  };

  if (status === "success") {
    return (
      <div className={cardClass}>
        <FormSuccess title={form.successTitle || "Solicitud registrada"} text={form.successText} className="py-12">
          <button type="button" onClick={resetForm} className="btn-link min-h-11">
            {form.successReset || "Enviar otra solicitud"}
          </button>
        </FormSuccess>
      </div>
    );
  }

  const sending = status === "sending";
  const fieldId = (name: string) => `${formId}-${name}`;
  const incidentHintId = `${formId}-incident-hint`;

  const renderInput = (field: (typeof CONTACT_FIELDS)[number]) => (
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
        placeholder={field.placeholder}
        maxLength={FIELDS[field.name].maxLength}
        {...(field.type === "tel" ? NUMERIC_PROPS : {})}
        className={inputClass}
        {...fieldA11yProps(formId, field.name, errors[field.name])}
      />
      <FieldError formId={formId} name={field.name} message={errors[field.name]} />
    </div>
  );

  return (
    <form className={`relative ${cardClass}`} noValidate onSubmit={handleSubmit} onInput={clearFieldError} onBlur={handleBlur}>
      <HoneypotField />

      <div className="grid gap-3.5 md:grid-cols-6 md:gap-5">
        {CONTACT_FIELDS.map(renderInput)}

        <div className={`${labelClass} md:col-span-2`}>
          <label htmlFor={fieldId("brand")}>
            Marca
            <span aria-hidden="true">*</span>
          </label>
          <select
            id={fieldId("brand")}
            name="brand"
            required
            value={brand}
            onChange={(event) => setBrand(event.currentTarget.value)}
            className={inputClass}
            {...fieldA11yProps(formId, "brand", errors.brand)}
          >
            <option value="" disabled>
              Selecciona la marca
            </option>
            {brands.map((option) => (
              <option key={option.slug} value={option.name}>
                {option.name}
              </option>
            ))}
            <option value={OTHER_BRAND_VALUE}>
              Otra marca
            </option>
          </select>
          <FieldError formId={formId} name="brand" message={errors.brand} />
          {brand === OTHER_BRAND_VALUE && (
            <>
              <label htmlFor={fieldId("brandOther")} className="sr-only">
                Escribe la marca
              </label>
              <input
                id={fieldId("brandOther")}
                name="brandOther"
                type="text"
                autoComplete="off"
                required
                placeholder="Escribe la marca"
                maxLength={FIELDS.brand.maxLength}
                className={inputClass}
                {...fieldA11yProps(formId, "brandOther", errors.brandOther)}
              />
              <FieldError formId={formId} name="brandOther" message={errors.brandOther} />
            </>
          )}
        </div>

        {EQUIPMENT_FIELDS.map(renderInput)}

        <div className={`${labelClass} md:col-span-6`}>
          <label htmlFor={fieldId("message")}>
            Mensaje del incidente
            <span aria-hidden="true">**</span>
          </label>
          <textarea
            id={fieldId("message")}
            name="message"
            required
            rows={5}
            maxLength={MESSAGE_MAX}
            placeholder="Describe la falla del equipo"
            onInput={(event) => setMessageLength(event.currentTarget.value.length)}
            className={`${controlClass} h-[160px] resize-none py-3 md:py-3.5`}
            {...fieldA11yProps(
              formId,
              "message",
              errors.message,
              [form.incidentHint ? incidentHintId : "", characterCountId(formId, "message")].filter(Boolean).join(" "),
            )}
          />
          <div className="flex items-start justify-between gap-3">
            <FieldError formId={formId} name="message" message={errors.message} />
            <CharacterCount formId={formId} name="message" length={messageLength} max={MESSAGE_MAX} />
          </div>
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
