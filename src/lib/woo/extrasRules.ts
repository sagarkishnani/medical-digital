import type { WooProductExtras, WooVideo } from "./types";

export type JetEngineMeta = Record<string, unknown>;

export const EMPTY_EXTRAS: WooProductExtras = {
  datasheetUrl: null,
  specifications: "",
  accessories: "",
  video: null,
};

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtube-nocookie.com"]);

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// JetEngine guarda los switchers como "true"/"false"; un switcher sin guardar no llega.
function switchOff(value: unknown): boolean {
  return value === false || value === "false" || value === "0" || value === "";
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function sameHostFile(value: string, storeUrl: string, extensions: RegExp): string | null {
  const url = parseUrl(value);
  const store = parseUrl(storeUrl);
  if (!url || !store || url.protocol !== "https:" || url.host !== store.host) return null;
  return extensions.test(url.pathname) ? url.href : null;
}

export function parseYouTubeId(value: string): string | null {
  const url = parseUrl(value);
  if (!url || !YOUTUBE_HOSTS.has(url.hostname)) return null;
  const candidate =
    url.hostname === "youtu.be"
      ? url.pathname.slice(1)
      : url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/)?.[1] || "";
  return YOUTUBE_ID.test(candidate) ? candidate : null;
}

export function parseDatasheetUrl(value: unknown, storeUrl: string): string | null {
  return sameHostFile(text(value), storeUrl, /\.pdf$/i);
}

export function parseVideoFileUrl(value: unknown, storeUrl: string): string | null {
  return sameHostFile(text(value), storeUrl, /\.(mp4|webm)$/i);
}

export function videoAttachmentId(meta: JetEngineMeta): number | null {
  if (switchOff(meta.es_archivo)) return null;
  const id = Number(text(meta.video));
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function projectExtras(
  meta: JetEngineMeta,
  storeUrl: string,
  sanitize: (html: string) => string,
  resolvedVideoFile: string | null = null,
): WooProductExtras {
  let video: WooVideo | null = null;
  const youtubeId = switchOff(meta.es_link) ? null : parseYouTubeId(text(meta.video_link));
  if (youtubeId) {
    video = { kind: "youtube", id: youtubeId };
  } else if (!switchOff(meta.es_archivo)) {
    const src = resolvedVideoFile || parseVideoFileUrl(meta.video, storeUrl);
    if (src) video = { kind: "file", src };
  }

  return {
    datasheetUrl: parseDatasheetUrl(meta.link, storeUrl),
    specifications: sanitize(text(meta.especificaciones_tecnicas)),
    accessories: sanitize(text(meta.accesorios)),
    video,
  };
}
