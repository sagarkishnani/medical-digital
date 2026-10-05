import { useState } from "react";
import { useTina } from "tinacms/dist/react";
import SectionHeader from "./SectionHeader";
import { withBase } from "../../utils/url";
import QuoteModal from "../shared/QuoteModal";
import type { QuoteProduct } from "../shared/QuoteModal";
import ProductCard from "../productos/ProductCard";
import type { ProductCardData } from "../productos/ProductCard";

interface Props {
  query: string;
  variables: object;
  data: any;
  cards: ProductCardData[];
}

export default function FeaturedProductsReact({ query, variables, data: initialData, cards }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const [quoteProduct, setQuoteProduct] = useState<QuoteProduct | null>(null);
  const featured = data?.home?.featured;
  if (!featured || cards.length === 0) return <div hidden />;

  return (
    <section className="container-xl flex flex-col gap-5 pb-10 pt-12 md:gap-9 md:pb-12 md:pt-24">
      <SectionHeader block={featured} href={withBase("/productos")} />
      <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {cards.map((card) => (
          <ProductCard
            key={card.href}
            card={card}
            onQuote={(selected) => setQuoteProduct({ name: selected.name, whatsappUrl: selected.quoteUrl })}
            className="w-[72%] shrink-0 snap-start sm:w-auto"
          />
        ))}
      </ul>
      <QuoteModal product={quoteProduct} onClose={() => setQuoteProduct(null)} />
    </section>
  );
}
