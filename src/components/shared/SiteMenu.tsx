import { useState } from "react";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  PiCaretDownLight,
  PiClockLight,
  PiEnvelopeSimpleLight,
  PiFacebookLogoLight,
  PiFilePdfLight,
  PiInstagramLogoLight,
  PiLinkedinLogoLight,
  PiMapPinLight,
  PiPhoneLight,
  PiSquaresFourLight,
  PiTiktokLogoLight,
  PiWhatsappLogoLight,
  PiXLogoLight,
  PiYoutubeLogoLight,
} from "react-icons/pi";
import Icon from "./Icon";
import { mediaUrl } from "../../utils/mediaUrl";
import { withBase } from "../../utils/url";
import { localizeHref, tField } from "../../utils/i18n";
import type { Locale } from "../../i18n/config";
import type { HeaderCategory } from "./HeaderReact";

const SOCIAL_ICONS: Record<string, IconType> = {
  facebook: PiFacebookLogoLight,
  instagram: PiInstagramLogoLight,
  linkedin: PiLinkedinLogoLight,
  tiktok: PiTiktokLogoLight,
  whatsapp: PiWhatsappLogoLight,
  x: PiXLogoLight,
  youtube: PiYoutubeLogoLight,
};

interface Props {
  id: string;
  open: boolean;
  locale: Locale;
  global: any;
  categories: HeaderCategory[];
  onNavigate: () => void;
}

const sectionLabelClass = "text-caption uppercase tracking-[0.08em] text-content-subtle lg:text-heading-h2 lg:normal-case lg:tracking-normal lg:text-brand-secondary-dark";

export default function SiteMenu({ id, open, locale, global, categories, onNavigate }: Props) {
  const [productsExpanded, setProductsExpanded] = useState(false);

  const nav = global?.nav;
  const links = (nav?.links || []).filter(Boolean);
  const cards = (nav?.panel?.cards || []).filter((card: any) => card?.title && card?.url);
  const columns = (nav?.panel?.columns || []).filter((column: any) => column?.title);
  const company = global?.company;
  const emails = (company?.emails || []).filter(Boolean);
  const phoneDigits = (company?.phone || "").replace(/\D/g, "");
  const social = (global?.footer?.social || []).filter((item: any) => item?.url && SOCIAL_ICONS[item.network]);
  const catalog = global?.catalog?.label ? global.catalog : null;
  const catalogLinkProps = catalog?.file ? { href: mediaUrl(catalog.file), target: "_blank", rel: "noopener noreferrer" } : {};
  const categoryIcons = global?.categoryIcons || [];
  const iconFor = (slug: string) => categoryIcons.find((entry: any) => entry?.categorySlug === slug)?.icon;

  const contactItems = [
    company?.phone && { icon: PiPhoneLight, content: <a href={`tel:+${phoneDigits}`}>{company.phone}</a> },
    ...emails.map((email: string) => ({
      icon: PiEnvelopeSimpleLight,
      content: <a href={`mailto:${email}`} className="break-all">{email}</a>,
    })),
    company?.address && { icon: PiMapPinLight, content: <span className="whitespace-pre-line">{company.address}</span> },
    company?.hours && { icon: PiClockLight, content: <span>{company.hours}</span> },
  ].filter(Boolean) as { icon: IconType; content: ReactNode }[];

  const catalogLink = (className: string) =>
    catalog && (
      <a {...catalogLinkProps} className={className}>
        <PiFilePdfLight aria-hidden="true" className="h-[22px] w-[22px]" />
        <span className="lg:hidden">Descargar catálogo PDF</span>
        <span className="hidden lg:inline">Catálogo PDF</span>
      </a>
    );

  return (
    <div id={id} hidden={!open} data-lenis-prevent className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain bg-surface lg:top-[84px]">
      <div className="min-h-full lg:grid lg:grid-cols-[132px_minmax(0,1fr)]">
        <div className="hidden items-center justify-center border-r border-line lg:flex">
          <span className="rotate-180 text-body-md tracking-[0.5em] text-content-subtle [writing-mode:vertical-rl]">MENÚ</span>
        </div>

        <div className="flex max-w-[1180px] flex-col gap-7 px-4 pb-8 pt-2 lg:gap-[52px] lg:px-14 lg:pb-12 lg:pt-[52px]">
          <nav aria-label="Menú" className="flex flex-col lg:hidden">
            {links.map((link: any, index: number) =>
              link.productsMenu && categories.length > 0 ? (
                <div key={index} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setProductsExpanded((value) => !value)}
                    aria-expanded={productsExpanded}
                    aria-controls="mobile-products"
                    className="flex h-[60px] w-full items-center justify-between text-heading-h4 text-brand-secondary-dark"
                  >
                    {tField(link, "label", locale)}
                    <PiCaretDownLight aria-hidden="true" className={`h-6 w-6 transition-transform duration-300 ${productsExpanded ? "rotate-180" : ""}`} />
                  </button>
                  <ul id="mobile-products" hidden={!productsExpanded} className="grid grid-cols-2 gap-2 pb-3.5">
                    {categories.map((category) => (
                      <li key={category.slug}>
                        <a
                          href={withBase(`/productos/categoria/${category.slug}`)}
                          onClick={onNavigate}
                          className="flex min-h-11 items-center gap-2.5 rounded-lg bg-surface-raised p-3 text-caption font-medium text-brand-secondary-dark"
                        >
                          <Icon name={iconFor(category.slug)} fallback="kit-medical" className="h-6 w-6 shrink-0 text-brand-primary" />
                          {category.name}
                        </a>
                      </li>
                    ))}
                    <li>
                      <a
                        href={withBase("/productos")}
                        onClick={onNavigate}
                        className="flex min-h-11 items-center gap-2.5 rounded-lg bg-brand-secondary-dark p-3 text-caption font-medium text-white"
                      >
                        <PiSquaresFourLight aria-hidden="true" className="h-6 w-6 shrink-0" />
                        Ver todo el catálogo
                      </a>
                    </li>
                  </ul>
                </div>
              ) : (
                <a
                  key={index}
                  href={localizeHref(link.url, locale, link.external)}
                  onClick={onNavigate}
                  className="flex h-[60px] items-center border-b border-line text-heading-h4 text-brand-secondary-dark"
                >
                  {tField(link, "label", locale)}
                </a>
              ),
            )}
          </nav>

          {cards.length > 0 && (
            <ul className="hidden grid-cols-3 gap-7 lg:grid">
              {cards.map((card: any, index: number) => (
                <li key={index}>
                  <a href={localizeHref(card.url, locale)} onClick={onNavigate} className="group flex items-center gap-[18px]">
                    <span className="h-[104px] w-[120px] shrink-0 overflow-hidden rounded-xl bg-surface-raised">
                      {card.image && (
                        <img
                          src={mediaUrl(card.image)}
                          alt={card.imageAlt || ""}
                          width={120}
                          height={104}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-heading-h4 text-brand-secondary-dark transition-colors duration-300 group-hover:text-accent">{card.title}</span>
                      {card.text && <span className="text-body-sm text-content-subtle">{card.text}</span>}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-7 lg:grid lg:grid-cols-3">
            {columns.map((column: any, index: number) => (
              <div key={index} className="flex flex-col gap-3 lg:gap-4">
                <p className={sectionLabelClass}>{column.title}</p>
                <ul className="grid grid-cols-2 gap-3 text-body-md text-content-muted lg:flex lg:flex-col lg:text-body-lg">
                  {(column.links || []).filter((link: any) => link?.label && link?.url).map((link: any, linkIndex: number) => (
                    <li key={linkIndex}>
                      <a href={localizeHref(link.url, locale)} onClick={onNavigate} className="hover:text-accent">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {contactItems.length > 0 && (
              <div className="flex flex-col gap-3 lg:gap-4">
                {nav?.panel?.contactTitle && <p className={sectionLabelClass}>{nav.panel.contactTitle}</p>}
                <ul className="flex flex-col gap-3 text-body-md text-content-muted">
                  {contactItems.map(({ icon: ItemIcon, content }, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <ItemIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary lg:h-6 lg:w-6" />
                      {content}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {(social.length > 0 || catalog) && (
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:border-t lg:border-line lg:pt-7">
              {social.length > 0 && (
                <ul className="flex gap-2">
                  {social.map((item: any, index: number) => {
                    const SocialIcon = SOCIAL_ICONS[item.network];
                    return (
                      <li key={index}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={item.network}
                          className="flex h-11 w-11 items-center justify-center text-content"
                        >
                          <SocialIcon aria-hidden="true" className="h-7 w-7" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
              {catalogLink(
                "flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-pill border border-brand-secondary-dark px-7 text-body-md font-medium text-brand-secondary-dark transition-colors hover:bg-surface-raised lg:ml-auto",
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
