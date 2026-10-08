import { useTina, tinaField } from "tinacms/dist/react";
import { PiEnvelopeSimpleLight, PiPhoneLight } from "react-icons/pi";

interface Props {
  query: string;
  variables: object;
  data: any;
}

const itemClass = "flex min-w-0 items-center gap-3 md:gap-4";
const iconClass = "h-8 w-8 shrink-0 text-brand-secondary-dark md:h-10 md:w-10";
const termClass = "text-body-sm text-content-muted";
const valueClass = "text-body-md font-medium text-brand-secondary-dark md:text-body-lg";

export default function ServiceInfoReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const company = data?.global?.company;
  const phoneDigits = (company?.phone || "").replace(/\D/g, "");
  const serviceEmail = (company?.serviceEmail || "").trim();
  if (!phoneDigits && !serviceEmail) return <div hidden />;

  return (
    <ul className="flex flex-col gap-3.5 md:flex-row md:flex-wrap md:gap-12">
      {phoneDigits && (
        <li className={itemClass}>
          <PiPhoneLight aria-hidden="true" className={iconClass} />
          <div className="flex min-w-0 flex-col">
            <p className={termClass}>Atención al cliente</p>
            <p className={valueClass} data-tina-field={tinaField(company, "phone")}>
              <a href={`tel:+${phoneDigits}`} className="hover:underline">
                {company.phone}
              </a>
            </p>
          </div>
        </li>
      )}
      {serviceEmail && (
        <li className={itemClass}>
          <PiEnvelopeSimpleLight aria-hidden="true" className={iconClass} />
          <div className="flex min-w-0 flex-col">
            <p className={termClass}>Correo electrónico</p>
            <p className={`${valueClass} break-all`} data-tina-field={tinaField(company, "serviceEmail")}>
              <a href={`mailto:${serviceEmail}`} className="hover:underline">
                {serviceEmail}
              </a>
            </p>
          </div>
        </li>
      )}
    </ul>
  );
}
