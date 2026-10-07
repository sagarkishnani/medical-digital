import { fetchJson, getStoreUrl, sanitizeDescription, WP_API } from "./store";
import { EMPTY_EXTRAS, parseVideoFileUrl, projectExtras, videoAttachmentId, type JetEngineMeta } from "./extrasRules";
import type { WooProductExtras } from "./types";

if (!import.meta.env.SSR) {
  throw new Error("src/lib/woo/extras.ts solo puede ejecutarse en build. Desde una isla no se importa.");
}

const PAGE_SIZE = 100;

interface WpProduct {
  id: number;
  meta?: JetEngineMeta | unknown[];
}

interface WpMedia {
  source_url?: string;
}

function hasHtml(html: string): boolean {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim() !== "";
}

async function resolveVideoFile(storeUrl: string, attachmentId: number): Promise<string | null> {
  try {
    const { body } = await fetchJson<WpMedia>(storeUrl, `media/${attachmentId}?_fields=source_url`, WP_API);
    return parseVideoFileUrl(body.source_url, storeUrl);
  } catch {
    return null;
  }
}

async function loadProductExtras(): Promise<Map<number, WooProductExtras>> {
  const storeUrl = getStoreUrl();
  const extras = new Map<number, WooProductExtras>();
  if (!storeUrl) return extras;

  const rawProducts: WpProduct[] = [];
  try {
    let page = 1;
    let totalPages = 1;
    do {
      const result = await fetchJson<WpProduct[]>(
        storeUrl,
        `product?per_page=${PAGE_SIZE}&page=${page}&_fields=id,meta`,
        WP_API,
      );
      rawProducts.push(...result.body);
      totalPages = result.totalPages;
      page++;
    } while (page <= totalPages);
  } catch (error) {
    console.warn(`[woo] Sin campos de JetEngine: ${(error as Error).message.split("\n")[0]}`);
    return extras;
  }

  let withMeta = 0;
  for (const raw of rawProducts) {
    if (!raw.meta || Array.isArray(raw.meta)) continue;
    withMeta++;
    const attachmentId = videoAttachmentId(raw.meta);
    const resolvedVideo = attachmentId ? await resolveVideoFile(storeUrl, attachmentId) : null;
    const projected = projectExtras(raw.meta, storeUrl, sanitizeDescription, resolvedVideo);
    extras.set(raw.id, {
      ...projected,
      specifications: hasHtml(projected.specifications) ? projected.specifications : "",
      accessories: hasHtml(projected.accessories) ? projected.accessories : "",
    });
  }

  if (withMeta === 0) {
    console.warn('[woo] /wp/v2/product no expone "meta": la ficha se publica sin PDF, especificaciones, accesorios ni video.');
  }
  return extras;
}

let extrasPromise: Promise<Map<number, WooProductExtras>> | undefined;

export function getProductExtras(): Promise<Map<number, WooProductExtras>> {
  extrasPromise ??= loadProductExtras();
  return extrasPromise;
}

export function extrasFor(extras: Map<number, WooProductExtras>, productId: number): WooProductExtras {
  return extras.get(productId) ?? EMPTY_EXTRAS;
}
