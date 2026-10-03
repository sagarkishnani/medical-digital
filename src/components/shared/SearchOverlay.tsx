import { useEffect, useMemo, useRef, useState } from "react";
import { PiMagnifyingGlassLight } from "react-icons/pi";
import { withBase } from "../../utils/url";

export interface SearchEntry {
  type: "product";
  title: string;
  brand: string;
  categories: string;
  url: string;
  image: string;
}

interface Props {
  id: string;
  open: boolean;
  placeholder?: string | null;
  onNavigate: () => void;
}

const MAX_RESULTS = 4;

function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export default function SearchOverlay({ id, open, placeholder, onNavigate }: Props) {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (entries) return;
    fetch(withBase("/search-index.json"))
      .then((response) => response.json())
      .then(setEntries)
      .catch(() => setEntries([]));
  }, [open, entries]);

  const term = normalize(query.trim());
  const results = useMemo(() => {
    if (!term || !entries) return [];
    return entries
      .filter((entry) => normalize(`${entry.title} ${entry.brand} ${entry.categories}`).includes(term))
      .slice(0, MAX_RESULTS);
  }, [term, entries]);

  return (
    <div
      id={id}
      hidden={!open}
      className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto border-t border-line bg-surface lg:absolute lg:bottom-auto lg:top-full lg:shadow-lg"
    >
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-9">
        <label className="flex items-center gap-3 border-b-[1.5px] border-brand-secondary-dark pb-3 transition-colors focus-within:border-accent lg:gap-4 lg:pb-4">
          <PiMagnifyingGlassLight aria-hidden="true" className="h-6 w-6 shrink-0 text-brand-secondary-dark lg:h-[30px] lg:w-[30px]" />
          <span className="sr-only">Buscar productos</span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder || "Buscar productos"}
            autoComplete="off"
            className="w-full min-w-0 bg-transparent text-heading-h4 [&::-webkit-search-cancel-button]:appearance-none focus-visible:ring-0 focus-visible:ring-offset-0 font-normal text-brand-secondary-dark outline-none placeholder:text-content-subtle lg:text-heading-h3 lg:font-normal"
          />
        </label>

        <div aria-live="polite">
          {term && entries && results.length === 0 && (
            <p className="text-body-md text-content-muted">
              No encontramos resultados para “{query.trim()}”. Prueba con otra marca o especialidad.
            </p>
          )}
          {results.length > 0 && (
            <ul className="flex flex-col gap-2 lg:grid lg:grid-cols-4 lg:gap-6">
              {results.map((entry) => (
                <li key={entry.url}>
                  <a
                    href={entry.url}
                    onClick={onNavigate}
                    className="group flex items-center gap-3.5 rounded-xl p-2 transition-colors hover:bg-surface-raised"
                  >
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-raised">
                      {entry.image && (
                        <img src={entry.image} alt="" width={64} height={64} loading="lazy" className="h-full w-full object-contain mix-blend-multiply" />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="line-clamp-2 text-body-sm font-medium text-brand-secondary-dark group-hover:underline">{entry.title}</span>
                      {entry.brand && <span className="text-caption text-content-muted">{entry.brand}</span>}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
