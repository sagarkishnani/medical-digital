import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
}

const labelClass = "flex flex-col gap-2 text-body-sm text-content-muted";
const controlClass =
  "h-[52px] w-full rounded-lg border border-line bg-surface-raised px-4 text-body-md text-brand-secondary-dark focus:border-brand-secondary-dark focus:bg-surface focus:outline-none";

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

export default function ContactFormReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const form = data?.contact?.form;
  if (!form) return <div hidden />;

  const locations = (form.locations || []).filter(Boolean);
  const specialties = (form.specialties || []).filter(Boolean);

  return (
    <form className="flex flex-col gap-6 rounded-2xl bg-surface p-6 md:p-11" noValidate>
      {form.title && (
        <h2 className="text-heading-h3 text-brand-secondary-dark md:text-heading-h2" data-tina-field={tinaField(form, "title")}>
          {form.title}
        </h2>
      )}

      <div className="grid gap-[18px] sm:grid-cols-2">
        {TEXT_FIELDS.map((field) => (
          <label key={field.name} className={labelClass}>
            <span>
              {field.label}
              <RequiredMark required={field.required} />
            </span>
            <input
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              required={field.required}
              className={controlClass}
            />
          </label>
        ))}

        {locations.length > 0 && (
          <label className={labelClass} data-tina-field={tinaField(form, "locations")}>
            <span>
              Ubicación
              <RequiredMark required />
            </span>
            <select name="location" required defaultValue="" className={controlClass}>
              <option value="" disabled>
                Selecciona
              </option>
              {locations.map((location: string) => (
                <option key={location}>{location}</option>
              ))}
            </select>
          </label>
        )}

        {specialties.length > 0 && (
          <label className={labelClass} data-tina-field={tinaField(form, "specialties")}>
            <span>Especialidad</span>
            <select name="specialty" defaultValue="" className={controlClass}>
              <option value="" disabled>
                Selecciona
              </option>
              {specialties.map((specialty: string) => (
                <option key={specialty}>{specialty}</option>
              ))}
            </select>
          </label>
        )}

        <label className={`${labelClass} sm:col-span-2`}>
          <span>Mensaje</span>
          <textarea name="message" rows={4} className={`${controlClass} h-[130px] resize-none py-3.5`} />
        </label>
      </div>

      <div className="flex flex-col gap-6 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-3 text-body-sm text-content-muted">
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
        <button type="button" className="btn-primary px-11" data-tina-field={tinaField(form, "submitLabel")}>
          {form.submitLabel || "Enviar"}
        </button>
      </div>
    </form>
  );
}
