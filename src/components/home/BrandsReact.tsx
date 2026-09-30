import { useTina, tinaField } from "tinacms/dist/react";
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

  return (
    <section className="border-y border-line py-14" aria-label="Marcas que representamos">
      <ul className="container-xl flex flex-wrap items-center justify-center gap-x-14 gap-y-8 lg:gap-x-[72px]">
        {brands.map((brand: any, index: number) => {
          const content = brand.logo ? (
            <img
              src={mediaUrl(brand.logo)}
              alt={brand.name}
              height={48}
              loading="lazy"
              className="max-h-12 w-auto max-w-[180px] object-contain mix-blend-multiply"
              data-tina-field={tinaField(brand, "logo")}
            />
          ) : (
            <span className="text-heading-h3 font-semibold text-brand-secondary" data-tina-field={tinaField(brand, "name")}>
              {brand.name}
            </span>
          );
          return (
            <li key={index} className="flex h-16 items-center justify-center">
              {brand.url ? (
                <a href={brand.url} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
