import type { WooProduct } from "../lib/woo/types";

export function buildQuoteUrl(number: string, product: Pick<WooProduct, "name" | "slug">, siteUrl: string): string {
  const digits = number.replace(/\D/g, "");
  const productUrl = new URL(`productos/${product.slug}`, siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`).href;
  const message = `Hola, quiero cotizar: ${product.name} — ${productUrl}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
