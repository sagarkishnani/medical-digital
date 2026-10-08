import { mediaUrl } from "../../utils/mediaUrl";
import { withBase } from "../../utils/url";
import { categorySlug, formatNewsDate, readingMinutes } from "../../utils/news";
import type { NewsCardData } from "./types";

interface PostNode {
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  category?: string | null;
  date?: string | null;
  featured?: boolean | null;
  body?: unknown;
  _sys: { filename: string };
}

export function toNewsCard(post: PostNode): NewsCardData {
  const category = post.category || "";
  return {
    href: withBase(`/noticias/${post._sys.filename}`),
    title: post.title,
    excerpt: post.excerpt || "",
    image: mediaUrl(post.coverImage),
    category,
    categorySlug: categorySlug(category),
    date: post.date ? formatNewsDate(post.date) : "",
    readTime: `${readingMinutes(post.body)} min`,
    featured: Boolean(post.featured),
  };
}
