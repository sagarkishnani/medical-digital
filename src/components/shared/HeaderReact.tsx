import { useEffect, useRef, useState } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { PiCaretDownLight, PiListLight, PiMagnifyingGlassLight, PiXLight } from "react-icons/pi";
import { tField, localizeHref } from "../../utils/i18n";
import { mediaUrl } from "../../utils/mediaUrl";
import { withBase } from "../../utils/url";
import { lockScroll, unlockScroll } from "../../utils/scrollLock";
import type { Locale } from "../../i18n/config";
import SearchOverlay from "./SearchOverlay";
import QuoteModal from "./QuoteModal";
import ProductsMegaMenu from "./ProductsMegaMenu";
import SiteMenu from "./SiteMenu";
import type { QuoteProduct } from "./QuoteModal";

type Panel = "menu" | "mega" | "search" | null;

export interface HeaderCategory {
  slug: string;
  name: string;
  count: number;
  image: string;
}

interface Props {
  query: string;
  variables: object;
  data: any;
  locale: Locale;
  currentPath: string;
  categories: HeaderCategory[];
}

function isActive(currentPath: string, url?: string | null): boolean {
  if (!url || !url.startsWith("/")) return false;
  const path = currentPath.replace(/\/+$/, "") || "/";
  const target = withBase(url).replace(/\/+$/, "") || "/";
  return target === "/" ? path === "/" : path === target || path.startsWith(`${target}/`);
}

export default function HeaderReact({ query, variables, data: initialData, locale, currentPath, categories }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const global = data?.global;
  const nav = global?.nav;
  const links = (nav?.links || []).filter(Boolean);

  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const [quote, setQuote] = useState<QuoteProduct | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const openQuoteFromTrigger = (event: MouseEvent) => {
      const trigger = (event.target as Element | null)?.closest<HTMLElement>("[data-quote-name]");
      if (!trigger) return;
      event.preventDefault();
      setOpenPanel(null);
      setQuote({
        name: trigger.dataset.quoteName || "",
        whatsappUrl: trigger.dataset.quoteUrl || "",
        productUrl: new URL(trigger.dataset.quoteProductUrl || window.location.href, window.location.href).href,
      });
    };
    document.addEventListener("click", openQuoteFromTrigger);
    return () => document.removeEventListener("click", openQuoteFromTrigger);
  }, []);

  useEffect(() => {
    if (openPanel !== "menu" && openPanel !== "search") return;
    lockScroll();
    return unlockScroll;
  }, [openPanel]);

  useEffect(() => {
    if (!openPanel) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenPanel(null);
      lastTriggerRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openPanel]);

  useEffect(() => {
    if (openPanel !== "search") return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (document.getElementById("site-search")?.contains(target) || lastTriggerRef.current?.contains(target)) return;
      setOpenPanel(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openPanel]);

  const togglePanel = (panel: Exclude<Panel, null>, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setOpenPanel((current) => (current === panel ? null : panel));
  };
  const toggleMega = (trigger: HTMLButtonElement) => {
    const openedByHover = lastTriggerRef.current === null;
    lastTriggerRef.current = trigger;
    setOpenPanel((current) => (current === "mega" && !openedByHover ? null : "mega"));
  };
  const openMegaOnHover = () => {
    lastTriggerRef.current = null;
    setOpenPanel((current) => (current === "menu" || current === "search" ? current : "mega"));
  };
  const closeMegaOnLeave = () => setOpenPanel((current) => (current === "mega" ? null : current));
  const closePanels = () => setOpenPanel(null);

  const whatsappDigits = (global?.whatsapp || "").replace(/\D/g, "");
  const openQuote = () => {
    closePanels();
    setQuote({
      name: "Asesoría comercial",
      whatsappUrl: whatsappDigits
        ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent("Hola, quiero asesoría sobre equipos médicos.")}`
        : "",
      productUrl: window.location.href,
    });
  };

  const activeBarClassName = "absolute -bottom-px left-nav-link h-0.5 bg-brand-primary";
  const menuOpen = openPanel === "menu";
  const megaOpen = openPanel === "mega";
  const searchOpen = openPanel === "search";
  const MenuIcon = menuOpen ? PiXLight : PiListLight;

  return (
    <>
      <header
        onMouseLeave={closeMegaOnLeave}
        className={`sticky top-0 z-50 border-b border-line bg-surface transition-shadow duration-300 ${
          scrolled && !menuOpen ? "shadow-md" : ""
        }`}
      >
        <div className="flex h-16 items-stretch lg:h-[84px]">
          <a
            href={localizeHref(withBase("/"), locale)}
            className="flex shrink-0 items-center pl-4 pr-2 lg:border-r lg:border-line lg:px-nav-logo"
            aria-label={nav?.logoAlt || "Medical Digital"}
            onClick={closePanels}
          >
            {nav?.logo ? (
              <img
                src={mediaUrl(nav.logo)}
                alt={nav?.logoAlt || "Medical Digital"}
                width={235}
                height={33}
                className="h-6 w-auto lg:h-nav-logo-height"
                data-tina-field={tinaField(nav, "logo")}
              />
            ) : (
              <span className="text-heading-h4 text-brand-secondary-dark">Medical Digital</span>
            )}
          </a>

          <button
            type="button"
            onClick={(event) => togglePanel("menu", event.currentTarget)}
            onMouseEnter={closeMegaOnLeave}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className="hidden w-nav-menu shrink-0 items-center justify-center border-r border-line text-brand-secondary-dark transition-colors hover:bg-surface-raised lg:flex"
          >
            <MenuIcon aria-hidden="true" className="h-8 w-8" />
          </button>

          <nav aria-label="Navegación principal" className="hidden min-w-0 flex-1 items-stretch px-nav-gutter nav:flex">
            {links.map((link: any, index: number) => {
              const current = isActive(currentPath, link.url);
              const active = current || (link.productsMenu && megaOpen);
              const hasMega = link.productsMenu && categories.length > 0;
              const linkElement = (
                <a
                  key={index}
                  href={localizeHref(link.url, locale, link.external)}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  aria-current={current ? "page" : undefined}
                  className={`relative flex items-center whitespace-nowrap px-nav-link text-nav-link transition-colors hover:text-accent ${
                    active ? "text-accent" : "text-brand-secondary-dark"
                  }`}
                  onMouseEnter={link.productsMenu ? openMegaOnHover : closeMegaOnLeave}
                  data-tina-field={tinaField(link, "label")}
                >
                  {tField(link, "label", locale)}
                  {current && !hasMega && <span aria-hidden="true" className={`${activeBarClassName} right-nav-link`} />}
                </a>
              );
              if (!hasMega) return linkElement;
              return (
                <div key={index} className="relative flex items-stretch">
                  {linkElement}
                  {current && <span aria-hidden="true" className={`${activeBarClassName} right-0`} />}
                  <button
                    type="button"
                    onClick={(event) => toggleMega(event.currentTarget)}
                    onMouseEnter={openMegaOnHover}
                    aria-expanded={megaOpen}
                    aria-controls="products-menu"
                    aria-label="Ver categorías de productos"
                    className="-ml-1.5 flex w-6 items-center justify-center text-brand-secondary-dark hover:text-accent"
                  >
                    <PiCaretDownLight aria-hidden="true" className={`h-4 w-4 transition-transform duration-300 ${megaOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>
              );
            })}
          </nav>

          <div onMouseEnter={closeMegaOnLeave} className="ml-auto flex shrink-0 items-center pr-2 nav:ml-0 lg:px-nav-actions">
            <button
              type="button"
              onClick={(event) => togglePanel("search", event.currentTarget)}
              aria-expanded={searchOpen}
              aria-controls="site-search"
              aria-label={searchOpen ? "Cerrar búsqueda" : "Buscar productos"}
              className="flex h-12 w-12 items-center justify-center rounded-full text-brand-secondary-dark transition-colors duration-200 lg:hover:bg-surface-raised"
            >
              {searchOpen ? <PiXLight aria-hidden="true" className="h-[26px] w-[26px]" /> : <PiMagnifyingGlassLight aria-hidden="true" className="h-[26px] w-[26px]" />}
            </button>
            <button
              type="button"
              onClick={(event) => togglePanel("menu", event.currentTarget)}
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
              onMouseEnter={closeMegaOnLeave}
              className="hidden min-w-[120px] shrink basis-[200px] items-center justify-center whitespace-nowrap bg-brand-primary px-4 text-nav-cta text-white transition-colors hover:bg-brand-primary-dark lg:flex"
              data-tina-field={tinaField(nav.cta, "label")}
            >
              {tField(nav.cta, "label", locale)}
            </button>
          )}
        </div>

        <ProductsMegaMenu
          id="products-menu"
          open={megaOpen}
          categories={categories}
          categoryIcons={global?.categoryIcons || []}
          catalog={global?.catalog}
          onNavigate={closePanels}
          onContactAdvisor={openQuote}
        />

        <SearchOverlay id="site-search" open={searchOpen} placeholder={global?.search?.placeholder} onNavigate={closePanels} />
      </header>

      <SiteMenu
        id="site-menu"
        open={menuOpen}
        locale={locale}
        global={global}
        categories={categories}
        onNavigate={closePanels}
      />

      <QuoteModal product={quote} texts={global?.quote} onClose={() => setQuote(null)} />
    </>
  );
}
