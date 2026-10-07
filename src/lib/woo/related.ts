import type { WooProduct } from "./types";

export function getRelatedProducts(product: WooProduct, rankedProducts: WooProduct[], limit = 4): WooProduct[] {
  const specialty = product.categories[0]?.slug;
  const candidates = rankedProducts.filter((candidate) => candidate.id !== product.id);
  const sameSpecialty = specialty
    ? candidates.filter((candidate) => candidate.categories.some((category) => category.slug === specialty))
    : [];
  const sameBrand = product.brandSlug
    ? candidates.filter((candidate) => candidate.brandSlug === product.brandSlug)
    : [];

  const related = new Map<number, WooProduct>();
  for (const candidate of [...sameSpecialty, ...sameBrand]) {
    if (related.size === limit) break;
    related.set(candidate.id, candidate);
  }
  return [...related.values()];
}
