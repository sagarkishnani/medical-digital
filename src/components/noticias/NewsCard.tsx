import type { NewsCardData } from "./types";

interface Props {
  post: NewsCardData;
  variant?: "grid" | "related";
  headingLevel?: "h2" | "h3";
  eager?: boolean;
}

export default function NewsCard({ post, variant = "grid", headingLevel = "h3", eager = false }: Props) {
  const isRelated = variant === "related";
  const Heading = headingLevel;
  return (
    <a href={post.href} className="group flex min-w-0 flex-col gap-3 lg:gap-4">
      <div className="aspect-[16/10] overflow-hidden rounded-xl bg-surface-raised md:rounded-2xl">
        {post.image && (
          <img
            src={post.image}
            alt=""
            width={640}
            height={400}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 motion-reduce:transition-none can-hover:group-hover:scale-105"
          />
        )}
      </div>
      <p className={`flex flex-wrap items-center gap-2 text-caption md:gap-2.5 ${isRelated ? "text-content-muted" : "text-content-subtle"}`}>
        {post.category && (
          <span className="rounded-pill bg-brand-tertiary-lightest px-2.5 py-1 font-medium text-brand-tertiary-dark md:px-3">{post.category}</span>
        )}
        <span>
          {post.date}
          {!isRelated && ` · ${post.readTime}`}
        </span>
      </p>
      <Heading className="text-body-lg font-medium text-brand-secondary-dark text-pretty md:text-heading-h4">{post.title}</Heading>
      {!isRelated && post.excerpt && <p className="text-body-sm text-content-subtle">{post.excerpt}</p>}
    </a>
  );
}
