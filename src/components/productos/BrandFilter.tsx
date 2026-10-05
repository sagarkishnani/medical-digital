import { useId, useState } from "react";
import { PiCheckLight } from "react-icons/pi";
import { normalizeSearch } from "../../utils/catalog/types";

interface Props {
  brands: { slug: string; name: string }[];
  selected: string[];
  counts: Map<string, number>;
  onToggle: (slug: string) => void;
  large?: boolean;
  searchable?: boolean;
}

export default function BrandFilter({ brands, selected, counts, onToggle, large = false, searchable = true }: Props) {
  const id = useId();
  const [brandQuery, setBrandQuery] = useState("");
  const query = normalizeSearch(brandQuery);
  const visible = query ? brands.filter((brand) => normalizeSearch(brand.name).includes(query)) : brands;

  return (
    <div className="flex flex-col gap-3.5">
      {searchable && (
        <>
          <label htmlFor={id} className="sr-only">
            Buscar marca
          </label>
          <input
            id={id}
            type="search"
            value={brandQuery}
            onChange={(event) => setBrandQuery(event.target.value)}
            placeholder="Buscar marca…"
            autoComplete="off"
            className="h-11 rounded-lg border border-line bg-surface px-3.5 text-body-sm text-brand-secondary-dark placeholder:text-content-subtle transition-colors focus:border-brand-secondary-dark focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </>
      )}
      <ul className="flex flex-col gap-1">
        {visible.map((brand) => {
          const checked = selected.includes(brand.slug);
          return (
            <li key={brand.slug}>
              <label className={`flex cursor-pointer items-center gap-3 ${large ? "min-h-12 text-body-md" : "min-h-11 text-body-md"}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(brand.slug)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`flex shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary peer-focus-visible:ring-offset-2 ${large ? "h-6 w-6" : "h-5 w-5"} ${checked ? "border-brand-secondary-dark bg-brand-secondary-dark text-white" : "border-greyscale-medium bg-surface text-transparent"}`}
                >
                  <PiCheckLight className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1 text-brand-secondary-dark">{brand.name}</span>
                <span className="text-body-sm text-content-subtle">{counts.get(brand.slug) ?? 0}</span>
              </label>
            </li>
          );
        })}
        {visible.length === 0 && <li className="py-2 text-body-sm text-content-subtle">Sin marcas con ese nombre.</li>}
      </ul>
    </div>
  );
}
