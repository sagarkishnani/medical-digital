import { useState } from "react";
import ProductCard from "./ProductCard";
import SearchField from "./SearchField";
import SpecialtyList from "./SpecialtyList";
import BrandFilter from "./BrandFilter";
import AdvisorCard from "./AdvisorCard";
import QuoteModal from "../shared/QuoteModal";
import type { QuoteProduct } from "../shared/QuoteModal";
import { applyFilters } from "../../utils/catalog/applyFilters";
import { DEFAULT_CATALOG_STATE } from "../../utils/catalog/types";
import type { CatalogFacets, CatalogItem, CatalogState } from "../../utils/catalog/types";

interface Props {
  items: CatalogItem[];
  facets: CatalogFacets;
  activeSpecialty: string | null;
  productsHref: string;
  advisorUrl: string;
}

export default function CatalogReact({ items, facets, activeSpecialty, productsHref, advisorUrl }: Props) {
  const [state, setState] = useState<CatalogState>(DEFAULT_CATALOG_STATE);
  const [quote, setQuote] = useState<QuoteProduct | null>(null);
  const result = applyFilters(items, state);

  const toggleBrand = (slug: string) =>
    setState((current) => ({
      ...current,
      pagina: 1,
      marca: current.marca.includes(slug) ? current.marca.filter((brand) => brand !== slug) : [...current.marca, slug],
    }));
  const openAdvisor = () => setQuote({ name: "Asesoría comercial", whatsappUrl: advisorUrl });

  return (
    <section className="container-xl pb-12 pt-4 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-10 lg:pb-24 lg:pt-10">
      <aside aria-label="Filtros del catálogo" className="hidden lg:sticky lg:top-[108px] lg:flex lg:flex-col lg:gap-4">
        <SearchField value={state.q} onChange={(q) => setState((current) => ({ ...current, q, pagina: 1 }))} />
        <div className="flex flex-col gap-3 rounded-2xl border border-line pb-3.5 pl-6 pr-[18px] pt-6">
          <h2 className="text-heading-h4 text-brand-secondary-dark">Especialidades</h2>
          <SpecialtyList
            specialties={facets.specialties}
            activeSpecialty={activeSpecialty}
            productsHref={productsHref}
            query=""
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

      <div className="flex flex-col gap-6">
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
      </div>
      <QuoteModal product={quote} onClose={() => setQuote(null)} />
    </section>
  );
}
