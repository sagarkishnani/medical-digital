import type { APIRoute } from "astro";
import { getImage } from "astro:assets";
import { getFeaturedProducts, getProducts } from "../lib/woo/store";
import { withBase } from "../utils/url";
import type { SearchEntry } from "../components/shared/SearchOverlay";

export const GET: APIRoute = async () => {
  const [products, featured] = await Promise.all([getProducts(), getFeaturedProducts(4)]);
  const featuredIds = new Set(featured.map((product) => product.id));

  const entries: SearchEntry[] = await Promise.all(
    products.map(async (product) => {
      const cover = product.images[0];
      const image = cover ? await getImage({ src: cover.src, inferSize: true, width: 128, format: "webp" }) : null;
      return {
        title: product.name,
        brand: product.brand ?? "",
        categories: product.categories.map((category) => category.name).join(" "),
        featured: featuredIds.has(product.id),
        url: withBase(`/productos/${product.slug}`),
        image: image?.src ?? "",
      };
    }),
  );

  return new Response(JSON.stringify(entries), {
    headers: { "Content-Type": "application/json" },
  });
};
