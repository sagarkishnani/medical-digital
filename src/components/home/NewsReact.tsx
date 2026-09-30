import { useTina } from "tinacms/dist/react";
import SectionHeader from "./SectionHeader";

export interface NewsPost {
  href: string;
  title: string;
  excerpt: string;
  image: string;
  tag: string;
  date: string;
  readTime: string;
}

interface Props {
  query: string;
  variables: object;
  data: any;
  posts: NewsPost[];
}

export default function NewsReact({ query, variables, data: initialData, posts }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const news = data?.home?.news;
  if (!news || posts.length === 0) return <div hidden />;

  return (
    <section className="container-xl flex flex-col gap-9 py-16 md:py-24">
      <SectionHeader block={news} href="/blog" />
      <ul className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.href}>
            <a href={post.href} className="group flex flex-col gap-4">
              <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-surface-raised">
                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    width={640}
                    height={400}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <p className="flex flex-wrap items-center gap-2.5 text-body-sm text-content-subtle">
                {post.tag && (
                  <span className="rounded-pill bg-brand-tertiary-lightest px-3 py-1 font-medium text-brand-tertiary-dark">{post.tag}</span>
                )}
                {[post.date, post.readTime].filter(Boolean).join(" · ")}
              </p>
              <h3 className="text-heading-h4 text-brand-secondary-dark text-pretty group-hover:underline">{post.title}</h3>
              {post.excerpt && <p className="text-body-md text-content-subtle">{post.excerpt}</p>}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
