import { useTina, tinaField } from "tinacms/dist/react";
import { mediaUrl } from "../../utils/mediaUrl";
import { withBase } from "../../utils/url";

interface Section {
  query: string;
  variables: object;
  data: any;
}

interface Props {
  page: Section;
  home: Section;
  productCounts: Record<string, number>;
}

export default function BrandGridReact({ page, home, productCounts }: Props) {
  const { data: pageData } = useTina(page);
  const { data: homeData } = useTina(home);
  const section = pageData?.brandsPage?.brands;
  const brands = (homeData?.home?.brands || []).filter((brand: any) => brand?.name);
  if (brands.length === 0) return <div hidden />;

  const linkLabel = section?.linkLabel || "Ver productos";

  return (
    <section className="container-xl flex flex-col gap-6 py-10 md:gap-10 md:py-24">
      {section?.title && (
        <h2 className="section-title" data-tina-field={tinaField(section, "title")}>
          {section.title}
        </h2>
      )}
      <ul className="grid gap-3.5 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {brands.map((brand: any, index: number) => (
          <li key={index} className="flex flex-col gap-3.5 rounded-2xl border border-line p-[22px] md:gap-5 md:p-7">
            <h3 className="flex h-11 items-center md:h-14">
              {brand.logo ? (
                <img
                  src={mediaUrl(brand.logo)}
                  alt={brand.name}
                  width={180}
                  height={44}
                  loading="lazy"
                  className="max-h-9 w-auto max-w-[160px] object-contain mix-blend-multiply md:max-h-11 md:max-w-[180px]"
                  data-tina-field={tinaField(brand, "logo")}
                />
              ) : (
                <span className="text-heading-h4 font-semibold text-content" data-tina-field={tinaField(brand, "name")}>
                  {brand.name}
                </span>
              )}
            </h3>
            {brand.desc && (
              <p className="flex-1 text-body-md text-content-muted" data-tina-field={tinaField(brand, "desc")}>
                {brand.desc}
              </p>
            )}
            {brand.slug && productCounts[brand.slug] > 0 && (
              <a
                href={withBase(`/productos?marca=${brand.slug}`)}
                className="btn-link mt-auto self-start"
                data-tina-field={tinaField(section, "linkLabel")}
              >
                {linkLabel}
                <span className="sr-only"> de {brand.name}</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
