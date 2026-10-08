import type { NewsCardData } from "./types";

interface Props {
  post: NewsCardData;
  variant?: "grid" | "related";
  eager?: boolean;
}

export default function NewsCard({ post, variant = "grid", eager = false }: Props) {
  const isRelated = variant === "related";
  return (
    <a href={post.href} className="group flex min-w-0 flex-col gap-3 md:gap-[14px] lg:gap-4">
      <div className="aspect-[16/10] overflow-hidden rounded-[18px] bg-surface-raised md:rounded-[22px]">
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
      <p className={`flex flex-wrap items-center gap-2 text-caption md:gap-2.5 md:text-[13px] ${isRelated ? "text-content-muted" : "text-content-subtle"}`}>
        {post.category && (
          <span className="rounded-pill bg-brand-tertiary-lightest px-2.5 py-1 font-medium text-brand-tertiary-dark md:px-3">{post.category}</span>
        )}
        <span>
          {post.date}
          {!isRelated && ` · ${post.readTime}`}
        </span>
      </p>
      <h3 className={`font-medium leading-[1.35] text-brand-secondary-dark text-pretty ${isRelated ? "text-[19px]" : "text-[19px] md:text-heading-h4"}`}>
        {post.title}
      </h3>
      {!isRelated && post.excerpt && <p className="text-body-sm leading-[1.55] text-content-subtle md:text-[15px]">{post.excerpt}</p>}
    </a>
  );
}
