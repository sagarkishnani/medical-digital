import type { CSSProperties } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { FaTableCellsLarge } from "react-icons/fa6";
import SectionHeader from "./SectionHeader";
import Icon from "../shared/Icon";

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

const COLUMNS = { base: 2, md: 3, lg: 5 };

function remainingSpan(items: number, columns: number): number {
  return columns - (items % columns);
}

const cardClass =
  "flex h-44 flex-col justify-between rounded-2xl p-6 transition-[transform,box-shadow,border-color,background-color] duration-300 hover:-translate-y-1";

export default function SpecialtiesReact({ query, variables, data: initialData, categories }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const specialties = data?.home?.specialties;
  if (!specialties || categories.length === 0) return <div hidden />;

  const iconFor = (slug: string) =>
    (specialties.icons || []).find((entry: any) => entry?.categorySlug === slug)?.icon;

  const catalogSpan = {
    "--span-base": remainingSpan(categories.length, COLUMNS.base),
    "--span-md": remainingSpan(categories.length, COLUMNS.md),
    "--span-lg": remainingSpan(categories.length, COLUMNS.lg),
  } as CSSProperties;

  return (
    <section className="container-xl flex flex-col gap-10 pb-16 pt-12 md:pb-24">
      <SectionHeader block={specialties} href="/productos" />
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => (
          <li key={category.slug}>
            <a
              href={`/productos/categoria/${category.slug}`}
              className={`${cardClass} border border-line bg-surface hover:shadow-lg`}
            >
              <Icon name={iconFor(category.slug)} fallback="kit-medical" className="h-10 w-10 text-brand-primary" />
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
          <li
            style={catalogSpan}
            className="[grid-column:span_var(--span-base)] md:[grid-column:span_var(--span-md)] lg:[grid-column:span_var(--span-lg)]"
          >
            <a href="/productos" className={`${cardClass} bg-brand-secondary-dark text-white hover:bg-brand-tertiary-dark`}>
              <FaTableCellsLarge aria-hidden="true" className="h-10 w-10" />
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
