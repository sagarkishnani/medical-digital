import { useTina } from "tinacms/dist/react";
import SectionHeader from "./SectionHeader";
import { withBase } from "../../utils/url";

export interface NewsPost {
  href: string;
  title: string;
  excerpt: string;
  image: string;
  tag: string;
  date: string;
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
    <section className="container-xl flex flex-col gap-5 py-12 md:gap-9 md:py-24">
      <SectionHeader block={news} href={withBase("/blog")} />
      <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 gap-3.5 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.href} className="w-[78%] shrink-0 snap-start sm:w-auto">
            <a href={post.href} className="group flex flex-col gap-3 md:gap-4">
              <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-surface-raised">
                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    width={640}
                    height={400}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <p className="flex flex-wrap items-center gap-2.5 text-body-sm text-content-subtle">
                {post.tag && (
                  <span className="rounded-pill bg-brand-tertiary-lightest px-3 py-1 font-medium text-brand-tertiary-dark">{post.tag}</span>
                )}
                {post.date}
              </p>
              <h3 className="text-body-lg font-medium text-brand-secondary-dark md:text-heading-h4 text-pretty group-hover:underline">{post.title}</h3>
              {post.excerpt && <p className="hidden text-body-md text-content-subtle md:block">{post.excerpt}</p>}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
