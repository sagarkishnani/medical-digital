import { CATALOG_PAGE_SIZE, normalizeSearch } from "./types";
import type { CatalogItem, CatalogState } from "./types";

export interface CatalogResult {
  items: CatalogItem[];
  total: number;
  page: number;
  totalPages: number;
  brandCounts: Map<string, number>;
}

function matchesSearch(item: CatalogItem, query: string): boolean {
  if (!query) return true;
  return query.split(/\s+/).every((word) => item.search.includes(word));
}

const collator = new Intl.Collator("es", { sensitivity: "base", numeric: true });

function sortItems(items: CatalogItem[], orden: CatalogState["orden"]): CatalogItem[] {
  const sorted = [...items];
  if (orden === "a-z") return sorted.sort((a, b) => collator.compare(a.name, b.name));
  if (orden === "z-a") return sorted.sort((a, b) => collator.compare(b.name, a.name));
  return sorted.sort((a, b) => a.rank - b.rank);
}

export function applyFilters(all: CatalogItem[], state: CatalogState): CatalogResult {
  const query = normalizeSearch(state.q);
  const searched = all.filter((item) => matchesSearch(item, query));

  const brandCounts = new Map<string, number>();
  for (const item of searched) {
    if (item.brandSlug) brandCounts.set(item.brandSlug, (brandCounts.get(item.brandSlug) || 0) + 1);
  }

  const selectedBrands = new Set(state.marca);
  const filtered =
    selectedBrands.size === 0
      ? searched
      : searched.filter((item) => item.brandSlug !== null && selectedBrands.has(item.brandSlug));

  const sorted = sortItems(filtered, state.orden);
  const totalPages = Math.max(1, Math.ceil(sorted.length / CATALOG_PAGE_SIZE));
  const page = Math.min(Math.max(state.pagina, 1), totalPages);
  const start = (page - 1) * CATALOG_PAGE_SIZE;

  return {
    items: sorted.slice(start, start + CATALOG_PAGE_SIZE),
    total: sorted.length,
    page,
    totalPages,
    brandCounts,
  };
}
