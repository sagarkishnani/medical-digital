import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
}

const labelClass = "flex flex-col gap-2 text-body-sm text-content-muted";
const controlClass =
  "w-full rounded-xl border border-line bg-surface-raised px-4 text-body-md text-brand-secondary-dark focus:border-brand-secondary-dark focus:bg-surface focus:outline-none focus-visible:ring-1 focus-visible:ring-offset-0";
const inputClass = `${controlClass} h-[50px] md:h-[52px]`;

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

const INCIDENT_HINT_ID = "service-incident-hint";

export default function ServiceFormReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const form = data?.service?.form;
  if (!form) return <div hidden />;

  return (
    <form className="flex flex-col gap-5 rounded-[22px] bg-surface p-[22px] md:gap-8 md:rounded-[28px] md:p-12" noValidate>
      <div className="grid gap-3.5 md:grid-cols-6 md:gap-5">
        {TEXT_FIELDS.map((field) => (
          <label key={field.name} className={`${labelClass} ${field.span}`}>
            <span>
              {field.label}
              <span aria-hidden="true">*</span>
            </span>
            <input name={field.name} type={field.type} autoComplete={field.autoComplete} required className={inputClass} />
          </label>
        ))}

        <label className={`${labelClass} md:col-span-6`}>
          <span>
            Mensaje del incidente
            <span aria-hidden="true">**</span>
          </span>
          <textarea
            name="message"
            required
            rows={4}
            aria-describedby={form.incidentHint ? INCIDENT_HINT_ID : undefined}
            className={`${controlClass} h-[120px] resize-none py-3.5 md:h-[140px]`}
          />
        </label>
      </div>

      {(form.incidentHint || form.requiredNote) && (
        <div className="flex flex-col gap-1 text-caption text-content-subtle md:text-[13px] md:leading-5">
          {form.incidentHint && (
            <p id={INCIDENT_HINT_ID} data-tina-field={tinaField(form, "incidentHint")}>
              {form.incidentHint}
            </p>
          )}
          {form.requiredNote && <p data-tina-field={tinaField(form, "requiredNote")}>{form.requiredNote}</p>}
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-line pt-5 md:flex-row md:items-center md:justify-between md:gap-6">
        <label className="flex cursor-pointer items-start gap-2.5 text-body-sm text-content-muted md:items-center md:gap-3">
          <input type="checkbox" name="consent" required className="h-5 w-5 shrink-0 accent-brand-secondary-dark" />
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
        <button type="button" className="btn-primary h-[54px] w-full shrink-0 px-11 md:w-auto" data-tina-field={tinaField(form, "submitLabel")}>
          {form.submitLabel || "Enviar solicitud"}
        </button>
      </div>
    </form>
  );
}
