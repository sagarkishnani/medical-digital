import { useTina, tinaField } from "tinacms/dist/react";
import { FaPhone, FaWhatsapp } from "react-icons/fa6";

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
  const whatsappUrl = whatsappDigits ? `https://wa.me/${whatsappDigits}` : "";

  return (
    <div className="order-first flex flex-col gap-5 lg:order-none lg:gap-8 lg:pt-3">
      <dl className="flex flex-col gap-5 lg:gap-8">
        {company.address && (
          <div className="flex flex-col gap-2">
            <dt className="text-caption text-content-subtle lg:text-body-sm">Nuestra sede</dt>
            <dd className="whitespace-pre-line text-body-lg font-medium text-brand-secondary-dark lg:text-heading-h3" data-tina-field={tinaField(company, "address")}>
              {company.address}
            </dd>
          </div>
        )}
        {(phoneDigits || whatsappUrl) && (
          <div className="grid grid-cols-2 gap-2.5 lg:hidden">
            {phoneDigits && (
              <a href={`tel:+${phoneDigits}`} className="btn h-[52px] border-brand-secondary-dark px-4 text-body-md text-brand-secondary-dark">
                <FaPhone aria-hidden="true" className="h-4 w-4" />
                Llamar
              </a>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn h-[52px] bg-semantics-success-dark px-4 text-body-md text-white"
              >
                <FaWhatsapp aria-hidden="true" className="h-5 w-5" />
                WhatsApp
              </a>
            )}
          </div>
        )}
        {company.phone && (
          <div className="flex flex-col gap-2">
            <dt className="text-caption text-content-subtle lg:text-body-sm">Teléfono</dt>
            <dd className="text-body-lg font-medium text-brand-secondary-dark lg:text-heading-h3" data-tina-field={tinaField(company, "phone")}>
              <a href={`tel:+${phoneDigits}`} className="hover:underline">
                {company.phone}
              </a>
            </dd>
          </div>
        )}
        {emails.length > 0 && (
          <div className="flex flex-col gap-2">
            <dt className="text-caption text-content-subtle lg:text-body-sm">Correo electrónico</dt>
            {emails.map((email: string, index: number) => (
              <dd key={email} className="break-all text-body-md font-medium text-brand-secondary-dark lg:text-body-lg" data-tina-field={tinaField(company, "emails", index)}>
                <a href={`mailto:${email}`} className="hover:underline">
                  {email}
                </a>
              </dd>
            ))}
          </div>
        )}
        {company.hours && (
          <div className="flex flex-col gap-2">
            <dt className="text-caption text-content-subtle lg:text-body-sm">Horario</dt>
            <dd className="text-body-md font-medium text-brand-secondary-dark lg:text-body-lg" data-tina-field={tinaField(company, "hours")}>
              {company.hours}
            </dd>
          </div>
        )}
      </dl>
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn hidden self-start bg-semantics-success-dark text-white hover:bg-semantics-success-darkest lg:inline-flex"
        >
          <FaWhatsapp aria-hidden="true" className="h-6 w-6" />
          Escríbenos por WhatsApp
        </a>
      )}
    </div>
  );
}
