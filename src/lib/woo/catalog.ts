import { getImage } from "astro:assets";
import { getCategories, getFeaturedProducts, getProducts } from "./store";
import type { WooCategory, WooProduct } from "./types";
import { normalizeSearch } from "../../utils/catalog/types";
import type { CatalogFacets, CatalogItem } from "../../utils/catalog/types";
import { buildQuoteUrl } from "../../utils/whatsapp";
import { withBase } from "../../utils/url";

if (!import.meta.env.SSR) {
  throw new Error("src/lib/woo/catalog.ts solo puede ejecutarse en build. Desde una isla no se importa.");
}

const FEATURED_LIMIT = 100;

interface BuildCatalogOptions {
  category?: WooCategory;
  whatsappNumber: string;
  siteUrl: string;
}

export interface Catalog {
  items: CatalogItem[];
  facets: CatalogFacets;
}

async function toCatalogItem(product: WooProduct, rank: number, options: BuildCatalogOptions): Promise<CatalogItem> {
  const cover = product.images[0];
  const image = cover ? await getImage({ src: cover.src, inferSize: true, width: 480, format: "webp" }) : null;
  return {
    id: product.id,
    href: withBase(`/productos/${product.slug}`),
    name: product.name,
    brand: product.brand,
    brandSlug: product.brandSlug,
    specialty: product.categories[0]?.name || null,
    sku: product.sku,
    categories: product.categories.map((category) => category.slug),
    search: normalizeSearch([product.name, product.brand, product.sku].filter(Boolean).join(" ")),
    rank,
    quoteUrl: options.whatsappNumber ? buildQuoteUrl(options.whatsappNumber, product, options.siteUrl) : "",
    image: image
      ? { src: image.src, alt: cover.alt, width: Number(image.attributes.width), height: Number(image.attributes.height) }
      : null,
  };
}

export async function buildCatalog(options: BuildCatalogOptions): Promise<Catalog> {
  const [products, featured, categories] = await Promise.all([
    getProducts(),
    getFeaturedProducts(FEATURED_LIMIT),
    getCategories(),
  ]);

  const featuredIds = new Set(featured.map((product) => product.id));
  const ranked = [
    ...products.filter((product) => featuredIds.has(product.id)),
    ...products.filter((product) => !featuredIds.has(product.id)),
  ];
  const scoped = options.category
    ? ranked.filter((product) => product.categories.some((category) => category.id === options.category!.id))
    : ranked;

  const items = await Promise.all(scoped.map((product, rank) => toCatalogItem(product, rank, options)));

  const brands = new Map<string, string>();
  for (const product of scoped) {
    if (product.brandSlug && product.brand) brands.set(product.brandSlug, product.brand);
  }

  return {
    items,
    facets: {
      specialties: categories
        .filter((category) => category.count > 0)
        .map((category) => ({
          slug: category.slug,
          name: category.name,
          count: category.count,
          href: withBase(`/productos/categoria/${category.slug}`),
        })),
      brands: [...brands]
        .map(([slug, name]) => ({ slug, name }))
        .sort((a, b) => a.name.localeCompare(b.name, "es")),
    },
  };
}
