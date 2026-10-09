import { useTina, tinaField } from "tinacms/dist/react";
import { PiPauseLight, PiPlayLight } from "react-icons/pi";
import { mediaUrl } from "../../utils/mediaUrl";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function BrandsReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const brands = (data?.home?.brands || []).filter((brand: any) => brand?.name);
  if (brands.length === 0) return <div hidden />;

  const renderList = (copy: boolean) => (
    <ul
      aria-hidden={copy || undefined}
      className={`flex shrink-0 items-center gap-10 pr-10 md:gap-18 md:pr-18 motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-6 motion-reduce:px-4 md:motion-reduce:gap-x-14 md:motion-reduce:gap-y-8 lg:motion-reduce:gap-x-18 ${
        copy ? "motion-reduce:hidden" : ""
      }`}
    >
      {brands.map((brand: any, index: number) => {
        const content = brand.logo ? (
          <img
            src={mediaUrl(brand.logo)}
            alt={copy ? "" : brand.name}
            width={180}
            height={48}
            loading="lazy"
            className="max-h-9 w-auto max-w-brand-logo-sm object-contain mix-blend-multiply md:max-h-12 md:max-w-brand-logo"
            data-tina-field={copy ? undefined : tinaField(brand, "logo")}
          />
        ) : (
          <span
            className="whitespace-nowrap text-heading-h4 font-semibold text-brand-secondary md:text-heading-h3"
            data-tina-field={copy ? undefined : tinaField(brand, "name")}
          >
            {brand.name}
          </span>
        );
        return (
          <li key={index} className="flex h-12 w-brand-logo-sm shrink-0 items-center justify-center md:h-16 md:w-brand-logo motion-reduce:w-auto">
            {brand.url ? (
              <a href={brand.url} target="_blank" rel="noopener noreferrer" tabIndex={copy ? -1 : undefined}>
                {content}
              </a>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <section data-marquee className="marquee group relative border-y border-line py-9 md:py-14" aria-label="Marcas que representamos">
      <div className="marquee-mask overflow-hidden">
        <div className="flex w-max animate-marquee motion-reduce:w-auto motion-reduce:animate-none">
          {renderList(false)}
          {renderList(true)}
        </div>
      </div>
      <button
        type="button"
        data-marquee-toggle
        aria-pressed="false"
        aria-label="Pausar el desplazamiento de las marcas"
        className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-brand-secondary-dark transition-colors hover:text-accent motion-reduce:hidden md:right-4"
      >
        <PiPauseLight aria-hidden="true" className="h-5 w-5 group-data-[paused]:hidden" />
        <PiPlayLight aria-hidden="true" className="hidden h-5 w-5 group-data-[paused]:block" />
      </button>
    </section>
  );
}
