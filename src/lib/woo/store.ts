import sanitizeHtml from "sanitize-html";
import { loadEnv } from "vite";
import type { WooCategory, WooImage, WooProduct } from "./types";

if (!import.meta.env.SSR) {
  throw new Error("src/lib/woo/store.ts solo puede ejecutarse en build. Desde una isla no se importa.");
}

const REQUEST_TIMEOUT_MS = 15_000;
const PAGE_SIZE = 100;
const SLUG_PATTERN = /^[a-z0-9-]+$/;
const LEFTOVER_SHORTCODE = /\[\/?[a-z_][^\]]*\]/gi;

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "b", "i", "u", "ul", "ol", "li", "h3", "h4", "h5", "table", "thead", "tbody", "tr", "th", "td", "a"],
  allowedAttributes: { a: ["href", "rel", "target"] },
  allowedSchemes: ["https", "mailto"],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0",
  ndash: "–", mdash: "—", hellip: "…", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
  laquo: "«", raquo: "»", reg: "®", trade: "™", copy: "©", deg: "°", times: "×", middot: "·",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] !== "#") return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
    const point = code[1].toLowerCase() === "x" ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
  });
}

export function sanitizeDescription(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS).replace(LEFTOVER_SHORTCODE, "").trim();
}

interface StoreApiImage {
  src?: string;
  alt?: string;
}

interface StoreApiTerm {
  id: number;
  name: string;
  slug: string;
}

interface StoreApiProduct {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  brands?: StoreApiTerm[];
  short_description?: string;
  description?: string;
  images?: StoreApiImage[];
  categories?: StoreApiTerm[];
}

interface StoreApiCategory extends StoreApiTerm {
  count: number;
}

interface StoreApiBrand extends StoreApiTerm {
  image?: StoreApiImage | null;
}

export function getStoreUrl(): string {
  const fromProcess = process.env.WOO_STORE_URL;
  const fromDotEnv = loadEnv(import.meta.env.MODE, process.cwd(), "").WOO_STORE_URL;
  return (fromProcess || fromDotEnv || "").trim().replace(/\/+$/, "");
}

async function fetchOnce(url: string): Promise<Response> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}`);
  }
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`content-type inesperado: ${response.headers.get("content-type")}`);
  }
  return response;
}

const STORE_API = "wc/store/v1";
export const WP_API = "wp/v2";

export async function fetchJson<T>(
  storeUrl: string,
  endpoint: string,
  api: string = STORE_API,
): Promise<{ body: T; totalPages: number }> {
  const url = `${storeUrl}/wp-json/${api}/${endpoint}`;
  let response: Response;
  try {
    response = await fetchOnce(url);
  } catch {
    try {
      response = await fetchOnce(url);
    } catch (error) {
      throw new Error(
        `No se pudo leer el catálogo de WooCommerce.\n  WOO_STORE_URL: ${storeUrl}\n  Endpoint: ${url}\n  Motivo: ${(error as Error).message}`,
      );
    }
  }
  const totalPages = Number(response.headers.get("x-wp-totalpages") || "1");
  try {
    return { body: (await response.json()) as T, totalPages };
  } catch {
    throw new Error(`La respuesta de ${url} no es JSON válido.`);
  }
}

function projectImages(images: StoreApiImage[], storeUrl: string, fallbackAlt: string): WooImage[] | null {
  const projected: WooImage[] = [];
  for (const image of images) {
    if (!image.src?.startsWith(`${storeUrl}/`)) return null;
    projected.push({ src: image.src, alt: decodeEntities(image.alt?.trim() || fallbackAlt) });
  }
  return projected;
}

function projectBrandLogos(brands: StoreApiBrand[], storeUrl: string): Map<string, WooImage> {
  const logos = new Map<string, WooImage>();
  for (const brand of brands) {
    const src = brand.image?.src;
    if (SLUG_PATTERN.test(brand.slug) && src?.startsWith(`${storeUrl}/`)) {
      logos.set(brand.slug, { src, alt: decodeEntities(brand.name) });
    }
  }
  return logos;
}

function projectProduct(raw: StoreApiProduct, storeUrl: string, brandLogos: Map<string, WooImage>): WooProduct | null {
  if (!SLUG_PATTERN.test(raw.slug)) {
    console.warn(`[woo] Producto ${raw.id} descartado: slug inválido "${raw.slug}".`);
    return null;
  }
  const name = decodeEntities(raw.name);
  const images = projectImages(raw.images || [], storeUrl, name);
  if (!images) {
    console.warn(`[woo] Producto ${raw.id} descartado: imagen fuera de ${storeUrl}.`);
    return null;
  }
  const brandSlug = SLUG_PATTERN.test(raw.brands?.[0]?.slug || "") ? raw.brands![0].slug : null;
  return {
    id: raw.id,
    name,
    slug: raw.slug,
    sku: raw.sku || "",
    brand: raw.brands?.[0]?.name ? decodeEntities(raw.brands[0].name) : null,
    brandSlug,
    brandLogo: (brandSlug && brandLogos.get(brandSlug)) || null,
    shortDescription: sanitizeDescription(raw.short_description || ""),
    description: sanitizeDescription(raw.description || ""),
    images,
    categories: (raw.categories || [])
      .filter((category) => SLUG_PATTERN.test(category.slug))
      .map(({ id, name: categoryName, slug }) => ({ id, name: decodeEntities(categoryName), slug })),
  };
}

async function loadProducts(): Promise<WooProduct[]> {
  const storeUrl = getStoreUrl();
  if (!storeUrl) return [];

  const brandLogos = await getBrandLogos();
  const rawProducts: StoreApiProduct[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const result = await fetchJson<StoreApiProduct[]>(storeUrl, `products?per_page=${PAGE_SIZE}&page=${page}`);
    rawProducts.push(...result.body);
    totalPages = result.totalPages;
    page++;
  } while (page <= totalPages);

  return rawProducts
    .map((raw) => projectProduct(raw, storeUrl, brandLogos))
    .filter((product): product is WooProduct => product !== null);
}

async function loadFeaturedProducts(limit: number): Promise<WooProduct[]> {
  const storeUrl = getStoreUrl();
  if (!storeUrl) return [];

  const brandLogos = await getBrandLogos();
  const { body } = await fetchJson<StoreApiProduct[]>(storeUrl, `products?featured=true&per_page=${limit}`);
  return body
    .map((raw) => projectProduct(raw, storeUrl, brandLogos))
    .filter((product): product is WooProduct => product !== null);
}

async function loadCategories(): Promise<WooCategory[]> {
  const storeUrl = getStoreUrl();
  if (!storeUrl) return [];

  const { body } = await fetchJson<StoreApiCategory[]>(storeUrl, "products/categories");
  return body
    .filter((category) => SLUG_PATTERN.test(category.slug))
    .map(({ id, name, slug, count }) => ({ id, name: decodeEntities(name), slug, count }));
}

async function loadBrandLogos(): Promise<Map<string, WooImage>> {
  const storeUrl = getStoreUrl();
  if (!storeUrl) return new Map();

  const { body } = await fetchJson<StoreApiBrand[]>(storeUrl, `products/brands?per_page=${PAGE_SIZE}`);
  return projectBrandLogos(body, storeUrl);
}

let productsPromise: Promise<WooProduct[]> | undefined;
let brandLogosPromise: Promise<Map<string, WooImage>> | undefined;
let categoriesPromise: Promise<WooCategory[]> | undefined;
const featuredPromises = new Map<number, Promise<WooProduct[]>>();

function getBrandLogos(): Promise<Map<string, WooImage>> {
  brandLogosPromise ??= loadBrandLogos();
  return brandLogosPromise;
}

export function getProducts(): Promise<WooProduct[]> {
  productsPromise ??= loadProducts();
  return productsPromise;
}

export function getFeaturedProducts(limit: number): Promise<WooProduct[]> {
  const perPage = Math.min(Math.max(Math.trunc(limit), 1), PAGE_SIZE);
  if (!featuredPromises.has(perPage)) {
    featuredPromises.set(perPage, loadFeaturedProducts(perPage));
  }
  return featuredPromises.get(perPage)!;
}

export function getCategories(): Promise<WooCategory[]> {
  categoriesPromise ??= loadCategories();
  return categoriesPromise;
}
