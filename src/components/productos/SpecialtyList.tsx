import type { MouseEvent } from "react";
import type { CatalogSpecialty } from "../../utils/catalog/types";

interface Props {
  specialties: CatalogSpecialty[];
  selected: string | null;
  hrefFor: (slug: string | null) => string;
  onSelect: (slug: string | null) => void;
  large?: boolean;
}

export default function SpecialtyList({ specialties, selected, hrefFor, onSelect, large = false }: Props) {
  const options = [{ slug: null, name: "Todos los productos" }, ...specialties];

  const select = (event: MouseEvent<HTMLAnchorElement>, slug: string | null) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (slug !== selected) onSelect(slug);
  };

  return (
    <ul className="flex flex-col">
      {options.map((option) => {
        const active = option.slug === selected;
        return (
          <li key={option.slug ?? "todos"}>
            <a
              href={hrefFor(option.slug)}
              onClick={(event) => select(event, option.slug)}
              aria-current={active ? "true" : undefined}
              className={`flex items-center transition-colors hover:text-brand-secondary-dark ${large ? "min-h-12" : "min-h-11"} text-body-md ${active ? (option.slug ? "font-medium text-brand-secondary-dark" : "font-medium text-accent") : "text-content-muted"}`}
            >
              {option.name}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
