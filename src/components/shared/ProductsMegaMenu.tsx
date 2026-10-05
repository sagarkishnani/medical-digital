import { PiArrowUpRightLight } from "react-icons/pi";
import Icon from "./Icon";
import { BsFiletypePdf } from "react-icons/bs";
import { panelMotion } from "./panelMotion";
import { mediaUrl } from "../../utils/mediaUrl";
import { withBase } from "../../utils/url";
import type { HeaderCategory } from "./HeaderReact";

interface Props {
  id: string;
  open: boolean;
  categories: HeaderCategory[];
  categoryIcons: { categorySlug?: string | null; icon?: string | null }[];
  catalog?: { label?: string | null; file?: string | null } | null;
  onNavigate: () => void;
  onContactAdvisor: () => void;
}

export default function ProductsMegaMenu({ id, open, categories, categoryIcons, catalog, onNavigate, onContactAdvisor }: Props) {
  const iconFor = (slug: string) => categoryIcons.find((entry) => entry?.categorySlug === slug)?.icon;

  return (
    <div
      id={id}
      className={`absolute inset-x-0 top-full hidden border-t border-line bg-surface shadow-lg lg:block ${panelMotion(open, "-translate-y-2")}`}
    >
      <div className="mx-auto flex max-w-[1320px] flex-col gap-5 px-8 pb-7 pt-6">
        <ul className="grid grid-cols-4 border-l border-t border-line xl:grid-cols-5">
          {categories.map((category) => (
            <li key={category.slug}>
              <a
                href={withBase(`/productos/categoria/${category.slug}`)}
                onClick={onNavigate}
                className="group relative flex h-full min-h-28 items-center gap-3 overflow-hidden border-b border-r border-line p-4 transition-colors duration-300 hover:bg-surface-raised focus-visible:bg-surface-raised"
              >
                <Icon name={iconFor(category.slug)} fallback="kit-medical" className="h-8 w-8 shrink-0 text-brand-primary" />
                <span className="relative z-10 flex min-w-0 flex-1 flex-col gap-1 pr-11">
                  <span className="text-subtitle text-brand-secondary-dark">{category.name}</span>
                  <span className="text-caption text-content-subtle">
                    {category.count} {category.count === 1 ? "producto" : "productos"}
                  </span>
                </span>
                {category.image && (
                  <img
                    src={category.image}
                    alt=""
                    width={64}
                    height={64}
                    loading="lazy"
                    className="absolute -bottom-1 -right-1 h-16 w-16 translate-x-3 object-contain opacity-0 mix-blend-multiply transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                  />
                )}
              </a>
            </li>
          ))}
          <li>
            <a
              href={withBase("/productos")}
              onClick={onNavigate}
              className="flex h-full min-h-28 items-center justify-between gap-3 bg-brand-secondary-dark p-4 text-white transition-colors duration-300 hover:bg-brand-tertiary-dark"
            >
              <span className="text-subtitle">Ver todo el catálogo</span>
              <PiArrowUpRightLight aria-hidden="true" className="h-7 w-7" />
            </a>
          </li>
        </ul>

        <div className="flex items-center justify-between text-body-sm text-content-muted">
          <p>
            ¿No encuentras lo que buscas?{" "}
            <button type="button" onClick={onContactAdvisor} className="font-medium text-accent underline underline-offset-4">
              Habla con un asesor
            </button>
          </p>
          {catalog?.label && (
            <a
              {...(catalog.file ? { href: mediaUrl(catalog.file), target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex cursor-pointer items-center gap-1.5 font-medium text-brand-secondary-dark"
            >
              <BsFiletypePdf aria-hidden="true" className="h-5 w-5 text-brand-primary" />
              {catalog.label || "Catálogo PDF"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
