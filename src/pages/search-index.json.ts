import type { APIRoute } from "astro";
import { getImage } from "astro:assets";
import { getProducts } from "../lib/woo/store";
import { withBase } from "../utils/url";
import type { SearchEntry } from "../components/shared/SearchOverlay";

export const GET: APIRoute = async () => {
  const products = await getProducts();

  const entries: SearchEntry[] = await Promise.all(
    products.map(async (product) => {
      const cover = product.images[0];
      const image = cover ? await getImage({ src: cover.src, inferSize: true, width: 128, format: "webp" }) : null;
      return {
        type: "product",
        title: product.name,
        brand: product.brand ?? "",
        categories: product.categories.map((category) => category.name).join(" "),
        url: withBase(`/productos/${product.slug}`),
        image: image?.src ?? "",
      };
    }),
  );

  return new Response(JSON.stringify(entries), {
    headers: { "Content-Type": "application/json" },
  });
};
