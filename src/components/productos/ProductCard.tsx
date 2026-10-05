import { PiArrowUpRightLight } from "react-icons/pi";

export interface ProductCardData {
  href: string;
  name: string;
  brand: string | null;
  specialty: string | null;
  quoteUrl: string;
  image: { src: string; alt: string; width: number; height: number } | null;
}

interface Props {
  card: ProductCardData;
  onQuote: (card: ProductCardData) => void;
  compactOnMobile?: boolean;
  className?: string;
}

export default function ProductCard({ card, onQuote, compactOnMobile = false, className = "" }: Props) {
  return (
    <li
      className={`group relative flex flex-col rounded-2xl border border-line bg-surface transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-1 hover:border-greyscale-light hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${compactOnMobile ? "p-1.5 md:p-2.5" : "p-2 md:p-2.5"} ${className}`}
    >
      <div className="flex aspect-[20/17] items-center justify-center overflow-hidden rounded-xl bg-surface-raised md:aspect-[10/9]">
        {card.image && (
          <img
            src={card.image.src}
            alt={card.image.alt}
            width={card.image.width}
            height={card.image.height}
            loading="lazy"
            decoding="async"
            className="h-3/4 w-3/4 object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
          />
        )}
      </div>
      <div className={`flex flex-1 flex-col gap-1.5 pt-4 ${compactOnMobile ? "px-1.5 pb-1.5 md:px-2.5 md:pb-2.5" : "px-2.5 pb-2.5"}`}>
        {card.brand && (
          <p className="text-overline uppercase tracking-wider text-content-subtle">{card.brand}</p>
        )}
        <h3 className={`text-brand-secondary-dark ${compactOnMobile ? "text-body-sm font-medium md:text-subtitle" : "text-subtitle"}`}>
          <a href={card.href} className="after:absolute after:inset-0 after:rounded-2xl">
            {card.name}
          </a>
        </h3>
        {card.specialty && (
          <p className={`text-caption text-content-subtle ${compactOnMobile ? "hidden md:block" : ""}`}>{card.specialty}</p>
        )}
      </div>
      <div className={`relative z-10 flex items-center gap-2 ${compactOnMobile ? "p-1 md:p-1.5" : "p-1.5"}`}>
        <button
          type="button"
          onClick={() => onQuote(card)}
          aria-haspopup="dialog"
          className={`btn min-w-0 flex-1 bg-brand-secondary-dark text-body-sm text-white hover:bg-brand-tertiary-dark ${compactOnMobile ? "h-11 px-3 md:h-12 md:px-4" : "px-4"}`}
        >
          {compactOnMobile ? (
            <>
              <span className="md:hidden">Cotizar</span>
              <span className="hidden md:inline">Solicitar cotización</span>
            </>
          ) : (
            "Solicitar cotización"
          )}
        </button>
        <a
          href={card.href}
          aria-label={`Ver ${card.name}`}
          className={`flex shrink-0 items-center justify-center rounded-pill bg-surface-raised text-brand-secondary-dark transition-colors hover:bg-brand-primary hover:text-white ${compactOnMobile ? "h-11 w-11 md:h-12 md:w-12" : "h-12 w-12"}`}
        >
          <PiArrowUpRightLight aria-hidden="true" className="h-5 w-5" />
        </a>
      </div>
    </li>
  );
}
