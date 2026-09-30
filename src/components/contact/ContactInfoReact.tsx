import { useTina, tinaField } from "tinacms/dist/react";
import { FaWhatsapp } from "react-icons/fa6";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function ContactInfoReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const global = data?.global;
  const company = global?.company;
  if (!company) return <div hidden />;

  const emails = (company.emails || []).filter(Boolean);
  const phoneDigits = (company.phone || "").replace(/\D/g, "");
  const whatsappDigits = (global.whatsapp || "").replace(/\D/g, "");

  return (
    <div className="flex flex-col gap-8 lg:pt-3">
      <dl className="flex flex-col gap-8">
        {company.address && (
          <div className="flex flex-col gap-2">
            <dt className="text-body-sm text-content-subtle">Nuestra sede</dt>
            <dd className="whitespace-pre-line text-heading-h3 text-brand-secondary-dark" data-tina-field={tinaField(company, "address")}>
              {company.address}
            </dd>
          </div>
        )}
        {company.phone && (
          <div className="flex flex-col gap-2">
            <dt className="text-body-sm text-content-subtle">Teléfono</dt>
            <dd className="text-heading-h3 text-brand-secondary-dark" data-tina-field={tinaField(company, "phone")}>
              <a href={`tel:+${phoneDigits}`} className="hover:underline">
                {company.phone}
              </a>
            </dd>
          </div>
        )}
        {emails.length > 0 && (
          <div className="flex flex-col gap-2">
            <dt className="text-body-sm text-content-subtle">Correo electrónico</dt>
            {emails.map((email: string, index: number) => (
              <dd key={email} className="break-all text-body-lg font-medium text-brand-secondary-dark" data-tina-field={tinaField(company, "emails", index)}>
                <a href={`mailto:${email}`} className="hover:underline">
                  {email}
                </a>
              </dd>
            ))}
          </div>
        )}
        {company.hours && (
          <div className="flex flex-col gap-2">
            <dt className="text-body-sm text-content-subtle">Horario</dt>
            <dd className="text-body-lg font-medium text-brand-secondary-dark" data-tina-field={tinaField(company, "hours")}>
              {company.hours}
            </dd>
          </div>
        )}
      </dl>
      {whatsappDigits && (
        <a
          href={`https://wa.me/${whatsappDigits}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn self-start bg-semantics-success-dark text-white hover:bg-semantics-success-darkest"
        >
          <FaWhatsapp aria-hidden="true" className="h-6 w-6" />
          Escríbenos por WhatsApp
        </a>
      )}
    </div>
  );
}
