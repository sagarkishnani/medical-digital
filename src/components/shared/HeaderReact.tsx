import { useEffect, useRef, useState } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { PiListLight, PiXLight } from "react-icons/pi";
import { tField, localizeHref } from "../../utils/i18n";
import { mediaUrl } from "../../utils/mediaUrl";
import { withBase } from "../../utils/url";
import { lockScroll, unlockScroll } from "../../utils/scrollLock";
import type { Locale } from "../../i18n/config";
import SearchOverlay from "./SearchOverlay";
import QuoteModal from "./QuoteModal";
import type { QuoteProduct } from "./QuoteModal";

type Panel = "menu" | "mega" | "search" | null;

interface Props {
  query: string;
  variables: object;
  data: any;
  locale: Locale;
  currentPath: string;
}

function isActive(currentPath: string, url?: string | null): boolean {
  if (!url || !url.startsWith("/")) return false;
  const path = currentPath.replace(/\/+$/, "") || "/";
  const target = withBase(url).replace(/\/+$/, "") || "/";
  return target === "/" ? path === "/" : path === target || path.startsWith(`${target}/`);
}

export default function HeaderReact({ query, variables, data: initialData, locale, currentPath }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const global = data?.global;
  const nav = global?.nav;
  const links = (nav?.links || []).filter(Boolean);

  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const [quote, setQuote] = useState<QuoteProduct | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (openPanel !== "menu") return;
    lockScroll();
    return unlockScroll;
  }, [openPanel]);

  useEffect(() => {
    if (!openPanel) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenPanel(null);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openPanel]);

  const toggleMenu = () => setOpenPanel((panel) => (panel === "menu" ? null : "menu"));
  const closePanels = () => setOpenPanel(null);

  const whatsappDigits = (global?.whatsapp || "").replace(/\D/g, "");
  const openQuote = () => {
    closePanels();
    setQuote({
      name: "Asesoría comercial",
      whatsappUrl: whatsappDigits
        ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent("Hola, quiero asesoría sobre equipos médicos.")}`
        : "",
    });
  };

  const menuOpen = openPanel === "menu";
  const MenuIcon = menuOpen ? PiXLight : PiListLight;

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-line bg-surface transition-shadow duration-300 ${
          scrolled && !menuOpen ? "shadow-md" : ""
        }`}
      >
        <div className="flex h-16 items-stretch lg:h-[84px]">
          <a
            href={localizeHref(withBase("/"), locale)}
            className="flex shrink-0 items-center pl-4 pr-2 lg:border-r lg:border-line lg:px-6 xl:px-10"
            aria-label={nav?.logoAlt || "Medical Digital"}
            onClick={closePanels}
          >
            {nav?.logo ? (
              <img
                src={mediaUrl(nav.logo)}
                alt={nav?.logoAlt || "Medical Digital"}
                width={235}
                height={33}
                className="h-6 w-auto lg:h-7"
                data-tina-field={tinaField(nav, "logo")}
              />
            ) : (
              <span className="text-heading-h4 text-brand-secondary-dark">Medical Digital</span>
            )}
          </a>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className="hidden w-[72px] shrink-0 items-center justify-center border-r border-line text-brand-secondary-dark transition-colors hover:bg-surface-raised lg:flex xl:w-[92px]"
          >
            <MenuIcon aria-hidden="true" className="h-8 w-8" />
          </button>

          <nav aria-label="Navegación principal" className="hidden min-w-0 flex-1 items-stretch px-1 lg:flex xl:px-5">
            {links.map((link: any, index: number) => {
              const active = isActive(currentPath, link.url);
              return (
                <a
                  key={index}
                  href={localizeHref(link.url, locale, link.external)}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center whitespace-nowrap px-2 text-body-sm font-medium transition-colors hover:text-accent xl:px-3.5 xl:text-body-md ${
                    active ? "text-accent" : "text-brand-secondary-dark"
                  }`}
                  data-tina-field={tinaField(link, "label")}
                >
                  {tField(link, "label", locale)}
                </a>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center pr-2 lg:ml-0 lg:px-3 xl:px-5">
            <SearchOverlay locale={locale} />
            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              className="flex h-12 w-12 items-center justify-center text-brand-secondary-dark lg:hidden"
            >
              <MenuIcon aria-hidden="true" className="h-7 w-7" />
            </button>
          </div>

          {nav?.cta?.label && (
            <button
              type="button"
              onClick={openQuote}
              className="hidden min-w-[120px] shrink basis-[200px] items-center justify-center whitespace-nowrap bg-brand-primary px-4 text-body-sm font-medium text-white transition-colors hover:bg-brand-primary-dark lg:flex xl:text-body-md"
              data-tina-field={tinaField(nav.cta, "label")}
            >
              {tField(nav.cta, "label", locale)}
            </button>
          )}
        </div>
      </header>

      <div
        id="site-menu"
        hidden={!menuOpen}
        className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-surface lg:top-[84px]"
      >
        <nav aria-label="Menú" className="container-xl flex flex-col py-4">
          {links.map((link: any, index: number) => (
            <a
              key={index}
              href={localizeHref(link.url, locale, link.external)}
              onClick={closePanels}
              className="flex h-[60px] items-center border-b border-line text-heading-h4 text-brand-secondary-dark"
            >
              {tField(link, "label", locale)}
            </a>
          ))}
          {nav?.cta?.label && (
            <button type="button" onClick={openQuote} className="btn-primary mt-6 self-start">
              {tField(nav.cta, "label", locale)}
            </button>
          )}
        </nav>
      </div>

      <QuoteModal product={quote} onClose={() => setQuote(null)} />
    </>
  );
}
