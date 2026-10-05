import { useEffect, useMemo, useRef, useState } from "react";
import { PiSlidersHorizontalLight } from "react-icons/pi";
import ProductCard from "./ProductCard";
import SearchField from "./SearchField";
import SpecialtyList from "./SpecialtyList";
import BrandFilter from "./BrandFilter";
import AdvisorCard from "./AdvisorCard";
import SortMenu from "./SortMenu";
import ActiveFilters from "./ActiveFilters";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import FilterSheet from "./FilterSheet";
import type { ActiveFilter } from "./ActiveFilters";
import { useCatalogState } from "./useCatalogState";
import QuoteModal from "../shared/QuoteModal";
import type { QuoteProduct } from "../shared/QuoteModal";
import { applyFilters } from "../../utils/catalog/applyFilters";
import { serializeCatalogUrl } from "../../utils/catalog/urlState";
import { DEFAULT_CATALOG_STATE } from "../../utils/catalog/types";
import type { CatalogFacets, CatalogItem, SortKey } from "../../utils/catalog/types";

interface Props {
  items: CatalogItem[];
  facets: CatalogFacets;
  activeSpecialty: string | null;
  productsHref: string;
  advisorUrl: string;
}

export default function CatalogReact({ items, facets, activeSpecialty, productsHref, advisorUrl }: Props) {
  const brandSlugs = useMemo(() => facets.brands.map((brand) => brand.slug), [facets.brands]);
  const { state, update, ready } = useCatalogState(brandSlugs);
  const [quote, setQuote] = useState<QuoteProduct | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const mobileBarRef = useRef<HTMLDivElement>(null);
  const result = applyFilters(items, state);
  const specialtyQuery = ready ? serializeCatalogUrl({ ...state, pagina: 1 }) : "";

  useEffect(() => {
    if (ready && result.page !== state.pagina) update({ ...state, pagina: result.page }, "replace");
  }, [ready, result.page, state, update]);

  const setSearch = (q: string) => update({ ...state, q, pagina: 1 }, "debounce");
  const toggleBrand = (slug: string) =>
    update({
      ...state,
      pagina: 1,
      marca: state.marca.includes(slug) ? state.marca.filter((brand) => brand !== slug) : [...state.marca, slug],
    });
  const setSort = (orden: SortKey) => update({ ...state, orden, pagina: 1 });
  const clearFilters = () => update(DEFAULT_CATALOG_STATE);

  const scrollToResults = () => {
    const target = resultsRef.current;
    if (!target) return;
    const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
    const barHeight = mobileBarRef.current?.offsetParent ? mobileBarRef.current.getBoundingClientRect().height : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - barHeight - 16;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = (window as unknown as { lenis?: { scrollTo: (to: number, options?: { immediate?: boolean }) => void } }).lenis;
    if (lenis) lenis.scrollTo(top, { immediate: reduceMotion });
    else window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  };
  const changePage = (pagina: number) => {
    update({ ...state, pagina });
    requestAnimationFrame(scrollToResults);
  };

  const specialty = facets.specialties.find((item) => item.slug === activeSpecialty);
  const activeFilters: ActiveFilter[] = [
    ...(specialty ? [{ key: "especialidad", label: specialty.name, href: `${productsHref}${specialtyQuery}` }] : []),
    ...(state.q ? [{ key: "q", label: `“${state.q}”`, onRemove: () => update({ ...state, q: "", pagina: 1 }) }] : []),
    ...state.marca.map((slug) => ({
      key: `marca-${slug}`,
      label: facets.brands.find((brand) => brand.slug === slug)?.name ?? slug,
      onRemove: () => toggleBrand(slug),
    })),
  ];

  const filterCount = state.marca.length + (activeSpecialty ? 1 : 0);
  const openAdvisor = () => setQuote({ name: "Asesoría comercial", whatsappUrl: advisorUrl });

  return (
    <section className="container-xl pb-12 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-10 lg:pb-24 lg:pt-10">
      <aside aria-label="Filtros del catálogo" className="hidden lg:sticky lg:top-[108px] lg:flex lg:flex-col lg:gap-4">
        <SearchField value={state.q} onChange={setSearch} />
        <div className="flex flex-col gap-3 rounded-2xl border border-line pb-3.5 pl-6 pr-[18px] pt-6">
          <h2 className="text-heading-h4 text-brand-secondary-dark">Especialidades</h2>
          <SpecialtyList
            specialties={facets.specialties}
            activeSpecialty={activeSpecialty}
            productsHref={productsHref}
            query={specialtyQuery}
          />
        </div>
        {facets.brands.length > 0 && (
          <div className="flex flex-col gap-3.5 rounded-2xl border border-line p-6">
            <h2 className="text-heading-h4 text-brand-secondary-dark">Marcas</h2>
            <BrandFilter
              brands={facets.brands}
              selected={state.marca}
              counts={result.brandCounts}
              onToggle={toggleBrand}
            />
          </div>
        )}
        <AdvisorCard onContact={openAdvisor} />
      </aside>

      <div>
        <div
          ref={mobileBarRef}
          className="sticky top-16 z-30 -mx-5 flex flex-col gap-3 border-b border-line bg-surface px-5 py-3.5 md:-mx-8 md:px-8 lg:hidden"
        >
          <SearchField value={state.q} onChange={setSearch} compact />
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
              className="flex h-11 items-center gap-2 rounded-pill border border-brand-secondary-dark px-4 text-body-sm font-medium text-brand-secondary-dark"
            >
              <PiSlidersHorizontalLight aria-hidden="true" className="h-[18px] w-[18px]" />
              Filtros{filterCount > 0 ? ` (${filterCount})` : ""}
            </button>
            <SortMenu value={state.orden} onChange={setSort} />
          </div>
        </div>
        <div ref={resultsRef} className="flex flex-col gap-4 pt-4 lg:gap-6 lg:pt-0">
          <div className="flex items-center justify-between gap-4 lg:min-h-11">
            <ActiveFilters total={result.total} filters={activeFilters} onClear={clearFilters} />
            <div className="hidden shrink-0 self-start lg:block">
              <SortMenu value={state.orden} onChange={setSort} />
            </div>
          </div>
          {result.total === 0 && <EmptyState onClear={clearFilters} />}
          <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-5">
            {result.items.map((item) => (
              <ProductCard
                key={item.id}
                card={item}
                compactOnMobile
                onQuote={(card) => setQuote({ name: card.name, whatsappUrl: card.quoteUrl })}
              />
            ))}
          </ul>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            hrefFor={(pagina) => serializeCatalogUrl({ ...state, pagina }) || "?"}
            onChange={changePage}
          />
          <AdvisorCard onContact={openAdvisor} className="mt-2 lg:hidden" />
        </div>
      </div>
      <FilterSheet open={sheetOpen} total={result.total} onClose={() => setSheetOpen(false)} onClear={clearFilters}>
        <div className="flex flex-col">
          <h3 className="py-1.5 text-caption uppercase tracking-wider text-content-subtle">Especialidades</h3>
          <SpecialtyList
            specialties={facets.specialties}
            activeSpecialty={activeSpecialty}
            productsHref={productsHref}
            query={specialtyQuery}
            large
          />
        </div>
        {facets.brands.length > 0 && (
          <div className="flex flex-col gap-1">
            <h3 className="py-1.5 text-caption uppercase tracking-wider text-content-subtle">Marcas</h3>
            <BrandFilter
              brands={facets.brands}
              selected={state.marca}
              counts={result.brandCounts}
              onToggle={toggleBrand}
              large
              searchable={false}
            />
          </div>
        )}
      </FilterSheet>
      <QuoteModal product={quote} onClose={() => setQuote(null)} />
    </section>
  );
}
