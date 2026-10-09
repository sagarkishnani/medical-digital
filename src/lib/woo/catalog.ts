import { getCategories, getFeaturedProducts, getProducts } from "./store";
import type { WooCategory, WooProduct } from "./types";
import { normalizeSearch } from "../../utils/catalog/types";
import type { CatalogFacets, CatalogItem } from "../../utils/catalog/types";
import { withBase } from "../../utils/url";

if (!import.meta.env.SSR) {
  throw new Error("src/lib/woo/catalog.ts solo puede ejecutarse en build. Desde una isla no se importa.");
}

const FEATURED_LIMIT = 100;

export interface Catalog {
  products: WooProduct[];
  items: CatalogItem[];
  facets: CatalogFacets;
}

function toCatalogItem(product: WooProduct, rank: number): CatalogItem {
  return {
    id: product.id,
    name: product.name,
    brandSlug: product.brandSlug,
    categories: product.categories.map((category) => category.slug),
    search: normalizeSearch([product.name, product.brand, product.sku].filter(Boolean).join(" ")),
    rank,
  };
}

export async function getRankedProducts(): Promise<WooProduct[]> {
  const [allProducts, featured] = await Promise.all([getProducts(), getFeaturedProducts(FEATURED_LIMIT)]);
  const featuredIds = new Set(featured.map((product) => product.id));
  return [
    ...allProducts.filter((product) => featuredIds.has(product.id)),
    ...allProducts.filter((product) => !featuredIds.has(product.id)),
  ];
}

export async function buildCatalog(category?: WooCategory): Promise<Catalog> {
  const [ranked, categories] = await Promise.all([getRankedProducts(), getCategories()]);
  const products = category
    ? ranked.filter((product) => product.categories.some((productCategory) => productCategory.id === category.id))
    : ranked;

  const brands = new Map<string, string>();
  for (const product of products) {
    if (product.brandSlug && product.brand) brands.set(product.brandSlug, product.brand);
  }

  return {
    products,
    items: products.map(toCatalogItem),
    facets: {
      specialties: categories
        .filter((productCategory) => productCategory.count > 0)
        .map((productCategory) => ({
          slug: productCategory.slug,
          name: productCategory.name,
          count: productCategory.count,
          href: withBase(`/productos/categoria/${productCategory.slug}`),
        })),
      brands: [...brands]
        .map(([slug, name]) => ({ slug, name }))
        .sort((a, b) => a.name.localeCompare(b.name, "es")),
    },
  };
}
