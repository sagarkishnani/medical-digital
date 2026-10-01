import { useTina, tinaField } from "tinacms/dist/react";
import { PiSquaresFourLight } from "react-icons/pi";
import SectionHeader from "./SectionHeader";
import Icon from "../shared/Icon";
import { withBase } from "../../utils/url";

interface Category {
  slug: string;
  name: string;
  count: number;
}

interface Props {
  query: string;
  variables: object;
  data: any;
  categories: Category[];
}

const cardClass =
  "flex h-full min-h-[120px] flex-col justify-between gap-3 rounded-2xl p-4 transition-[transform,box-shadow,border-color,background-color] duration-300 hover:-translate-y-1 md:min-h-44 md:p-6";

export default function SpecialtiesReact({ query, variables, data: initialData, categories }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const specialties = data?.home?.specialties;
  if (!specialties || categories.length === 0) return <div hidden />;

  const iconFor = (slug: string) =>
    (specialties.icons || []).find((entry: any) => entry?.categorySlug === slug)?.icon;

  return (
    <section className="container-xl flex flex-col gap-6 pb-12 pt-2 md:gap-10 md:pb-24 md:pt-12">
      <SectionHeader block={specialties} href={withBase("/productos")} hideLinkOnMobile />
      <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
        {categories.map((category) => (
          <li key={category.slug}>
            <a
              href={withBase(`/productos/categoria/${category.slug}`)}
              className={`${cardClass} border border-line bg-surface hover:shadow-lg`}
            >
              <Icon name={iconFor(category.slug)} fallback="kit-medical" className="h-9 w-9 text-brand-primary md:h-12 md:w-12" />
              <span className="flex flex-col gap-1">
                <span className="text-subtitle text-brand-secondary-dark">{category.name}</span>
                <span className="text-body-sm text-content-subtle">
                  {category.count} {category.count === 1 ? "producto" : "productos"}
                </span>
              </span>
            </a>
          </li>
        ))}
        {specialties.catalogLabel && (
          <li className="col-start-2 md:col-start-3 lg:col-start-5">
            <a href={withBase("/productos")} className={`${cardClass} bg-brand-secondary-dark text-white hover:bg-brand-tertiary-dark`}>
              <PiSquaresFourLight aria-hidden="true" className="h-9 w-9 md:h-12 md:w-12" />
              <span className="text-subtitle" data-tina-field={tinaField(specialties, "catalogLabel")}>
                {specialties.catalogLabel}
              </span>
            </a>
          </li>
        )}
      </ul>
    </section>
  );
}
