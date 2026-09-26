import { loadEnv } from "vite";
import type { WooCategory, WooImage, WooProduct } from "./types";

if (!import.meta.env.SSR) {
  throw new Error("src/lib/woo/store.ts solo puede ejecutarse en build. Desde una isla no se importa.");
}

const REQUEST_TIMEOUT_MS = 15_000;
const PAGE_SIZE = 100;
const SLUG_PATTERN = /^[a-z0-9-]+$/;

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

async function fetchJson<T>(storeUrl: string, endpoint: string): Promise<{ body: T; totalPages: number }> {
  const url = `${storeUrl}/wp-json/wc/store/v1/${endpoint}`;
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
    projected.push({ src: image.src, alt: image.alt?.trim() || fallbackAlt });
  }
  return projected;
}

function projectProduct(raw: StoreApiProduct, storeUrl: string): WooProduct | null {
  if (!SLUG_PATTERN.test(raw.slug)) {
    console.warn(`[woo] Producto ${raw.id} descartado: slug inválido "${raw.slug}".`);
    return null;
  }
  const images = projectImages(raw.images || [], storeUrl, raw.name);
  if (!images) {
    console.warn(`[woo] Producto ${raw.id} descartado: imagen fuera de ${storeUrl}.`);
    return null;
  }
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    sku: raw.sku || "",
    brand: raw.brands?.[0]?.name || null,
    shortDescription: raw.short_description || "",
    description: raw.description || "",
    images,
    categories: (raw.categories || [])
      .filter((category) => SLUG_PATTERN.test(category.slug))
      .map(({ id, name, slug }) => ({ id, name, slug })),
  };
}

async function loadProducts(): Promise<WooProduct[]> {
  const storeUrl = getStoreUrl();
  if (!storeUrl) return [];

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
    .map((raw) => projectProduct(raw, storeUrl))
    .filter((product): product is WooProduct => product !== null);
}

async function loadCategories(): Promise<WooCategory[]> {
  const storeUrl = getStoreUrl();
  if (!storeUrl) return [];

  const { body } = await fetchJson<StoreApiCategory[]>(storeUrl, "products/categories");
  return body
    .filter((category) => SLUG_PATTERN.test(category.slug))
    .map(({ id, name, slug, count }) => ({ id, name, slug, count }));
}

let productsPromise: Promise<WooProduct[]> | undefined;
let categoriesPromise: Promise<WooCategory[]> | undefined;

export function getProducts(): Promise<WooProduct[]> {
  productsPromise ??= loadProducts();
  return productsPromise;
}

export function getCategories(): Promise<WooCategory[]> {
  categoriesPromise ??= loadCategories();
  return categoriesPromise;
}
