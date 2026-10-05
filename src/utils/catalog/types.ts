import type { ProductCardData } from "../../components/productos/ProductCard";

export interface CatalogItem extends ProductCardData {
  id: number;
  sku: string;
  brandSlug: string | null;
  categories: string[];
  search: string;
  rank: number;
}

export interface CatalogSpecialty {
  slug: string;
  name: string;
  count: number;
  href: string;
}

export interface CatalogFacets {
  specialties: CatalogSpecialty[];
  brands: { slug: string; name: string }[];
}

export type SortKey = "relevantes" | "a-z" | "z-a";

export interface CatalogState {
  q: string;
  marca: string[];
  orden: SortKey;
  pagina: number;
}

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevantes", label: "Más relevantes" },
  { key: "a-z", label: "Nombre A–Z" },
  { key: "z-a", label: "Nombre Z–A" },
];

export const CATALOG_PAGE_SIZE = 12;

export const DEFAULT_CATALOG_STATE: CatalogState = { q: "", marca: [], orden: "relevantes", pagina: 1 };

export function normalizeSearch(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
