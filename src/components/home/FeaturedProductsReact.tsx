import { useState } from "react";
import { useTina } from "tinacms/dist/react";
import { FaArrowRight } from "react-icons/fa6";
import SectionHeader from "./SectionHeader";
import QuoteModal from "../shared/QuoteModal";
import type { QuoteProduct } from "../shared/QuoteModal";

export interface FeaturedCard {
  href: string;
  name: string;
  brand: string | null;
  quoteUrl: string;
  image: { src: string; alt: string; width: number; height: number } | null;
}

interface Props {
  query: string;
  variables: object;
  data: any;
  cards: FeaturedCard[];
  salesEmail: string;
}

export default function FeaturedProductsReact({ query, variables, data: initialData, cards, salesEmail }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const [quoteProduct, setQuoteProduct] = useState<QuoteProduct | null>(null);
  const featured = data?.home?.featured;
  if (!featured || cards.length === 0) return <div hidden />;

  return (
    <section className="container-xl flex flex-col gap-9 pb-12 pt-16 md:pt-24">
      <SectionHeader block={featured} href="/productos" />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <li
            key={card.href}
            className="group relative flex flex-col rounded-2xl border border-line bg-surface p-2.5 transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-1 hover:border-greyscale-light hover:shadow-lg"
          >
            <div className="flex aspect-[10/9] items-center justify-center overflow-hidden rounded-xl bg-surface-raised">
              {card.image && (
                <img
                  src={card.image.src}
                  alt={card.image.alt}
                  width={card.image.width}
                  height={card.image.height}
                  loading="lazy"
                  className="h-3/4 w-3/4 object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 px-2.5 pb-2.5 pt-4">
              {card.brand && <p className="text-overline uppercase tracking-wider text-content-subtle">{card.brand}</p>}
              <h3 className="text-subtitle text-brand-secondary-dark">
                <a href={card.href} className="after:absolute after:inset-0 after:rounded-2xl">
                  {card.name}
                </a>
              </h3>
            </div>
            <div className="relative z-10 flex items-center gap-2 p-1.5">
              <button
                type="button"
                onClick={() => setQuoteProduct({ name: card.name, whatsappUrl: card.quoteUrl })}
                aria-haspopup="dialog"
                className="btn flex-1 bg-brand-secondary-dark px-4 text-body-sm text-white hover:bg-brand-tertiary-dark"
              >
                Solicitar cotización
              </button>
              <a
                href={card.href}
                aria-label={`Ver ${card.name}`}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-surface-raised text-brand-secondary-dark transition-colors hover:bg-brand-primary hover:text-white"
              >
                <FaArrowRight aria-hidden="true" className="-rotate-45" />
              </a>
            </div>
          </li>
        ))}
      </ul>
      <QuoteModal product={quoteProduct} salesEmail={salesEmail} onClose={() => setQuoteProduct(null)} />
    </section>
  );
}
