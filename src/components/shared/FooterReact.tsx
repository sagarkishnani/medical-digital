import type { ReactNode } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import type { IconType } from "react-icons";
import {
  PiBookOpenLight,
  PiCertificateLight,
  PiEnvelopeSimpleLight,
  PiFilePdfLight,
  PiMapPinLight,
  PiPhoneLight,
} from "react-icons/pi";
import { SOCIAL_ICONS, SOCIAL_NAMES } from "./socialLinks";
import { mediaUrl } from "../../utils/mediaUrl";
import { tField, localizeHref } from "../../utils/i18n";
import type { Locale } from "../../i18n/config";

const TWNSTUDIOS_CREDIT_URL =
  "https://twnstudios.com/?utm_source=medicaldigital&utm_medium=referral&utm_campaign=client_portfolio";

const columnTitleClass = "text-overline uppercase tracking-[0.08em] text-brand-secondary-light";
const linkClass = "-my-1.5 inline-block py-1.5 transition-colors duration-300 hover:text-brand-primary-light";

interface Props {
  query: string;
  variables: object;
  data: any;
  locale: Locale;
}

export default function FooterReact({ query, variables, data: initialData, locale }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const global = data?.global;
  const footer = global?.footer;
  const nav = global?.nav;
  const company = global?.company;
  const catalog = global?.catalog;

  const columns = (footer?.columns || []).filter((column: any) => column?.title);
  const social = (footer?.social || []).filter((item: any) => item?.url && SOCIAL_ICONS[item.network]);
  const certifications = (footer?.certifications || []).filter((item: any) => item?.code);
  const complaintsBook = footer?.complaintsBook?.url && footer.complaintsBook.label ? footer.complaintsBook : null;
  const emails = (company?.emails || []).filter(Boolean);
  const phoneDigits = (company?.phone || "").replace(/\D/g, "");
  const catalogLinkProps = catalog?.file
    ? { href: mediaUrl(catalog.file), target: "_blank", rel: "noopener noreferrer" }
    : {};

  const isLastOfOddColumns = (index: number) => columns.length % 2 === 1 && index === columns.length - 1;

  const contactItems = [
    company?.phone && {
      icon: PiPhoneLight,
      content: <a href={`tel:+${phoneDigits}`} className={linkClass}>{company.phone}</a>,
    },
    ...emails.map((email: string) => ({
      icon: PiEnvelopeSimpleLight,
      content: <a href={`mailto:${email}`} className={`${linkClass} break-all`}>{email}</a>,
    })),
    company?.address && {
      icon: PiMapPinLight,
      content: <span className="whitespace-pre-line">{company.address}</span>,
    },
  ].filter(Boolean) as { icon: IconType; content: ReactNode }[];

  const socialLinks = (className: string) =>
    social.length > 0 && (
      <ul className={`gap-2.5 ${className}`}>
        {social.map((item: any, index: number) => {
          const SocialIcon = SOCIAL_ICONS[item.network];
          return (
            <li key={index}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SOCIAL_NAMES[item.network]} de Medical Digital`}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-secondary transition-colors duration-300 hover:border-brand-primary hover:bg-brand-primary"
              >
                <SocialIcon aria-hidden="true" className="h-[18px] w-[18px]" />
              </a>
            </li>
          );
        })}
      </ul>
    );

  return (
    <footer className="bg-brand-secondary-dark text-white">
      <div className="container-xl flex flex-col gap-7 pb-6 pt-8 xl:gap-10 xl:pb-7 xl:pt-12">
        {footer?.catalogTitle && (
          <div className="flex flex-col gap-3.5 rounded-[20px] bg-white/5 px-4 py-5 md:flex-row md:items-center md:justify-between md:gap-6 md:rounded-2xl md:py-6 md:pl-8 md:pr-7">
            <div className="flex items-center gap-3.5 md:gap-[18px]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-primary md:h-14 md:w-14 md:rounded-[14px]">
                <PiFilePdfLight aria-hidden="true" className="h-[26px] w-[26px] md:h-[30px] md:w-[30px]" />
              </span>
              <p className="text-subtitle md:text-heading-h4" data-tina-field={tinaField(footer, "catalogTitle")}>
                {tField(footer, "catalogTitle", locale)}
              </p>
            </div>
            <a
              {...catalogLinkProps}
              className="btn-primary w-full md:w-auto"
              data-tina-field={tinaField(footer, "catalogButtonLabel")}
            >
              {tField(footer, "catalogButtonLabel", locale) || "Descargar catálogo"}
            </a>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 md:gap-9 xl:grid-cols-[1.3fr_1fr_1fr_1fr_1.3fr]">
          <div className="col-span-2 flex flex-col gap-5 xl:col-span-1">
            {nav?.logo ? (
              <img
                src={mediaUrl(nav.logo)}
                alt={nav?.logoAlt || "Medical Digital"}
                width={235}
                height={33}
                loading="lazy"
                className="h-[26px] w-auto self-start brightness-0 invert xl:h-[30px]"
              />
            ) : (
              <p className="text-heading-h4">Medical Digital</p>
            )}
            {footer?.tagline && (
              <p className="max-w-[260px] text-body-sm text-brand-tertiary-light" data-tina-field={tinaField(footer, "tagline")}>
                {tField(footer, "tagline", locale)}
              </p>
            )}
            {socialLinks("hidden md:flex")}
          </div>

          {columns.map((column: any, index: number) => (
            <nav
              key={index}
              aria-label={tField(column, "title", locale)}
              className={`flex flex-col gap-2.5 xl:gap-[11px] ${isLastOfOddColumns(index) ? "col-span-2 md:col-span-1" : ""}`}
            >
              <p className={columnTitleClass} data-tina-field={tinaField(column, "title")}>
                {tField(column, "title", locale)}
              </p>
              <ul className="flex flex-col gap-2 text-body-sm xl:gap-[9px]">
                {(column.links || []).filter((link: any) => link?.label && link?.url).map((link: any, linkIndex: number) => (
                  <li key={linkIndex}>
                    <a href={localizeHref(link.url, locale)} className={linkClass} data-tina-field={tinaField(link, "label")}>
                      {tField(link, "label", locale)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {contactItems.length > 0 && (
            <div className="col-span-2 flex flex-col gap-3 md:col-span-1 xl:gap-[13px]">
              {footer?.contactTitle && (
                <p className={columnTitleClass} data-tina-field={tinaField(footer, "contactTitle")}>
                  {tField(footer, "contactTitle", locale)}
                </p>
              )}
              <ul className="flex flex-col gap-3 text-body-sm xl:gap-[13px]">
                {contactItems.map(({ icon: ContactIcon, content }, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <ContactIcon aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-primary-light" />
                    {content}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {(certifications.length > 0 || complaintsBook) && (
          <div className="flex flex-col gap-4 border-y border-brand-secondary py-5 xl:flex-row xl:items-center xl:justify-between xl:gap-7 xl:py-6">
            {certifications.length > 0 && (
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-8">
                {footer?.certificationsTitle && (
                  <p className={columnTitleClass} data-tina-field={tinaField(footer, "certificationsTitle")}>
                    {tField(footer, "certificationsTitle", locale)}
                  </p>
                )}
                <ul className="flex flex-col gap-3.5 md:flex-row md:flex-wrap md:gap-x-8">
                  {certifications.map((certification: any, index: number) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-tertiary-light xl:h-[52px] xl:w-[52px]">
                        <PiCertificateLight aria-hidden="true" className="h-[22px] w-[22px] text-brand-tertiary-light xl:h-[26px] xl:w-[26px]" />
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-body-sm font-medium" data-tina-field={tinaField(certification, "code")}>
                          {certification.code}
                        </span>
                        {certification.name && (
                          <span className="text-caption text-brand-tertiary-light" data-tina-field={tinaField(certification, "name")}>
                            {tField(certification, "name", locale)}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {complaintsBook && (
              <a
                href={localizeHref(complaintsBook.url, locale)}
                className="mt-1 flex items-center gap-2.5 self-start xl:mt-0 xl:self-auto"
                data-tina-field={tinaField(complaintsBook, "label")}
              >
                <PiBookOpenLight aria-hidden="true" className="h-7 w-7 shrink-0 xl:h-8 xl:w-8" />
                <span className="text-body-sm xl:max-w-28">{tField(complaintsBook, "label", locale)}</span>
              </a>
            )}
          </div>
        )}

        {socialLinks("flex md:hidden")}

        <div className="flex flex-col gap-1.5 text-caption text-brand-secondary-light md:flex-row md:justify-between md:gap-4">
          <p data-tina-field={tinaField(footer, "legal")}>
            © {new Date().getFullYear()} {tField(footer, "legal", locale)}
          </p>
          <p>
            Desarrollado por{" "}
            <a
              href={TWNSTUDIOS_CREDIT_URL}
              target="_blank"
              rel="noopener"
              className="transition-colors duration-300 hover:text-white"
            >
              TWNSTUDIOS
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
