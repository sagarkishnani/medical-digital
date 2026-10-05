import { useState } from "react";
import ProductCard from "./ProductCard";
import QuoteModal from "../shared/QuoteModal";
import type { QuoteProduct } from "../shared/QuoteModal";
import { applyFilters } from "../../utils/catalog/applyFilters";
import { DEFAULT_CATALOG_STATE } from "../../utils/catalog/types";
import type { CatalogFacets, CatalogItem } from "../../utils/catalog/types";

interface Props {
  items: CatalogItem[];
  facets: CatalogFacets;
  activeSpecialty: string | null;
  productsHref: string;
  advisorUrl: string;
}

export default function CatalogReact({ items }: Props) {
  const [quote, setQuote] = useState<QuoteProduct | null>(null);
  const result = applyFilters(items, DEFAULT_CATALOG_STATE);

  return (
    <section className="container-xl pb-12 pt-4 lg:pb-24 lg:pt-10">
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
      <QuoteModal product={quote} onClose={() => setQuote(null)} />
    </section>
  );
}
