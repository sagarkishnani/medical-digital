import { fetchJson, getProductMeta, getStoreUrl, sanitizeDescription, WP_API } from "./store";
import { EMPTY_EXTRAS, JET_ENGINE_KEYS, parseVideoFileUrl, projectExtras, videoAttachmentId } from "./extrasRules";
import type { WooProductExtras } from "./types";

if (!import.meta.env.SSR) {
  throw new Error("src/lib/woo/extras.ts solo puede ejecutarse en build. Desde una isla no se importa.");
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

  const metaByProduct = await getProductMeta();
  let withFields = 0;
  for (const [productId, meta] of metaByProduct) {
    if (!JET_ENGINE_KEYS.some((key) => key in meta)) continue;
    withFields++;
    const attachmentId = videoAttachmentId(meta);
    const resolvedVideo = attachmentId ? await resolveVideoFile(storeUrl, attachmentId) : null;
    const projected = projectExtras(meta, storeUrl, sanitizeDescription, resolvedVideo);
    extras.set(productId, {
      ...projected,
      specifications: hasHtml(projected.specifications) ? projected.specifications : "",
      accessories: hasHtml(projected.accessories) ? projected.accessories : "",
    });
  }

  if (metaByProduct.size > 0 && withFields === 0) {
    console.warn("[woo] Ningún producto trae campos de JetEngine en meta_data: la ficha se publica sin PDF, especificaciones, accesorios ni video.");
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
