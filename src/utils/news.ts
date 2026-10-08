export const NEWS_AUTHOR = "Equipo Medical Digital";

const WORDS_PER_MINUTE = 200;
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const limaDateParts = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Lima",
  day: "2-digit",
  month: "numeric",
  year: "numeric",
});

export function categorySlug(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function collectText(node: unknown, words: string[]): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((child) => collectText(child, words));
    return;
  }
  const { text, children } = node as { text?: unknown; children?: unknown };
  if (typeof text === "string") words.push(text);
  collectText(children, words);
}

export function readingMinutes(body: unknown): number {
  const parts: string[] = [];
  collectText(body, parts);
  const wordCount = parts.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function formatNewsDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = Object.fromEntries(limaDateParts.formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.day} ${MONTHS[Number(parts.month) - 1]} ${parts.year}`;
}

export function sortByDate<T extends { date?: string | null }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
}

export function pickFeatured<T extends { featured?: boolean | null }>(sorted: T[]): T | undefined {
  return sorted.find((post) => post.featured) ?? sorted[0];
}
