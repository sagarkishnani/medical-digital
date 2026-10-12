import { inferRemoteSize } from "astro:assets";

export interface YouTubePoster {
  src: string;
  width: number;
  height: number;
}

const VARIANTS = ["maxresdefault", "sddefault", "hqdefault"] as const;
// YouTube answers a missing variant with a 120×90 gray placeholder, sometimes with status 200.
const PLACEHOLDER_WIDTH = 120;

const cache = new Map<string, Promise<YouTubePoster | null>>();

async function probe(src: string): Promise<YouTubePoster | null> {
  try {
    const { width, height } = await inferRemoteSize(src);
    return width > PLACEHOLDER_WIDTH ? { src, width, height } : null;
  } catch {
    return null;
  }
}

async function findPoster(id: string): Promise<YouTubePoster | null> {
  for (const variant of VARIANTS) {
    const poster = await probe(`https://i.ytimg.com/vi/${id}/${variant}.jpg`);
    if (poster) return poster;
  }
  console.warn(`[woo] No se pudo verificar la portada del video ${id}; se usa hqdefault remoto.`);
  return null;
}

export function resolveYouTubePoster(id: string): Promise<YouTubePoster | null> {
  let poster = cache.get(id);
  if (!poster) {
    poster = findPoster(id);
    cache.set(id, poster);
  }
  return poster;
}
