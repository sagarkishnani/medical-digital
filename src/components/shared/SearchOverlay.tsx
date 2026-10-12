import { useEffect, useMemo, useRef, useState } from "react";
import { PiMagnifyingGlassLight } from "react-icons/pi";
import { withBase } from "../../utils/url";
import { panelMotion } from "./panelMotion";

export interface SearchEntry {
  title: string;
  brand: string;
  categories: string;
  featured: boolean;
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
  const [showAll, setShowAll] = useState(false);
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
  const matches = useMemo(() => {
    if (!entries) return [];
    return term
      ? entries.filter((entry) => normalize(`${entry.title} ${entry.brand} ${entry.categories}`).includes(term))
      : entries.filter((entry) => entry.featured);
  }, [term, entries]);
  const results = showAll ? matches : matches.slice(0, MAX_RESULTS);

  const seeAll = (className: string) => {
    if (!term)
      return (
        <a href={withBase("/productos")} onClick={onNavigate} className={className}>
          Ver todos los resultados
        </a>
      );
    if (showAll || matches.length <= MAX_RESULTS) return null;
    return (
      <button type="button" onClick={() => setShowAll(true)} className={className}>
        Ver todos los resultados
      </button>
    );
  };

  return (
    <div
      id={id}
      data-lenis-prevent
      className={`fixed inset-x-0 bottom-0 top-16 overflow-y-auto overscroll-contain border-t border-line bg-surface lg:absolute lg:bottom-auto lg:top-full lg:max-h-[calc(100vh-85px)] lg:shadow-lg ${panelMotion(open, "-translate-y-4")}`}
    >
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-9">
        <div className="flex items-center gap-3 border-b-[1.5px] border-brand-secondary-dark pb-3 focus-within:border-b-2 lg:gap-4 lg:pb-4">
          <PiMagnifyingGlassLight aria-hidden="true" className="h-6 w-6 shrink-0 text-content-subtle lg:h-[30px] lg:w-[30px]" />
          <label htmlFor={`${id}-input`} className="sr-only">
            Buscar productos
          </label>
          <input
            ref={inputRef}
            id={`${id}-input`}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowAll(false);
            }}
            placeholder={placeholder || "Buscar productos"}
            autoComplete="off"
            className="w-full min-w-0 bg-transparent text-heading-h4 [&::-webkit-search-cancel-button]:appearance-none focus-visible:ring-0 focus-visible:ring-offset-0 font-normal text-brand-secondary-dark outline-none placeholder:text-content-subtle lg:text-heading-h3 lg:font-normal"
          />
          {seeAll("hidden shrink-0 whitespace-nowrap text-body-sm font-medium text-accent lg:inline")}
        </div>

        <div aria-live="polite" className="flex flex-col gap-3.5">
          {term && entries && results.length === 0 && (
            <p className="text-body-md text-content-muted">No encontramos resultados para “{query.trim()}”. Prueba con otra marca o especialidad.</p>
          )}
          {results.length > 0 && (
            <>
              <p className="text-caption text-content-subtle">{term ? "Resultados" : "Más buscados"}</p>
              <ul className="flex flex-col gap-2 lg:grid lg:grid-cols-4 lg:gap-4">
                {results.map((entry) => (
                  <li key={entry.url}>
                    <a
                      href={entry.url}
                      onClick={onNavigate}
                      className="flex items-center gap-3.5 rounded-xl py-2 transition-colors lg:gap-3 lg:p-2.5 lg:hover:bg-surface-raised"
                    >
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-raised">
                        {entry.image && (
                          <img
                            src={entry.image}
                            alt=""
                            width={64}
                            height={64}
                            loading="lazy"
                            className="h-4/5 w-4/5 object-contain mix-blend-multiply"
                          />
                        )}
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="line-clamp-2 text-body-sm font-medium leading-tight text-brand-secondary-dark">{entry.title}</span>
                        {entry.brand && <span className="text-caption text-content-muted">{entry.brand}</span>}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {seeAll("flex h-[52px] w-full items-center justify-center rounded-pill border border-brand-secondary-dark text-body-md font-medium text-brand-secondary-dark lg:hidden")}
      </div>
    </div>
  );
}
