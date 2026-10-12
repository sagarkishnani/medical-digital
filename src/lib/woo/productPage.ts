import type { WooProduct, WooProductExtras } from "./types";

export type DetailKey = "descripcion" | "especificaciones" | "accesorios";

export interface ProductDetail {
  key: DetailKey;
  title: string;
  html: string;
}

export interface ProductPageData {
  details: ProductDetail[];
  related: WooProduct[];
}

export const RELATED_LIMIT = 4;

function buildDetails(product: WooProduct, extras: WooProductExtras): ProductDetail[] {
  const details: ProductDetail[] = [
    { key: "descripcion", title: "Descripción general", html: product.description },
    { key: "especificaciones", title: "Especificaciones técnicas", html: extras.specifications },
    { key: "accesorios", title: "Accesorios", html: extras.accessories },
  ];
  return details.filter((detail) => detail.html);
}

function buildRelated(product: WooProduct, rankedProducts: WooProduct[]): WooProduct[] {
  const specialty = product.categories[0]?.slug;
  const sameSpecialty = specialty
    ? rankedProducts.filter((candidate) => candidate.categories.some((category) => category.slug === specialty))
    : [];
  const sameBrand = product.brandSlug
    ? rankedProducts.filter((candidate) => candidate.brandSlug === product.brandSlug)
    : [];

  const byId = new Map(rankedProducts.map((candidate) => [candidate.id, candidate]));
  const linked = [...product.crossSellIds, ...product.upsellIds]
    .map((id) => byId.get(id))
    .filter((candidate): candidate is WooProduct => candidate !== undefined);

  const chosen = new Map<number, WooProduct>();
  for (const candidate of [...linked, ...sameSpecialty, ...sameBrand, ...rankedProducts]) {
    if (chosen.size >= RELATED_LIMIT) break;
    if (candidate.id === product.id || chosen.has(candidate.id)) continue;
    chosen.set(candidate.id, candidate);
  }
  return [...chosen.values()];
}

export function buildProductPage(
  product: WooProduct,
  rankedProducts: WooProduct[],
  extras: WooProductExtras,
): ProductPageData {
  return {
    details: buildDetails(product, extras),
    related: buildRelated(product, rankedProducts),
  };
}
