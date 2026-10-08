import { useEffect, useState } from "react";
import NewsCard from "./NewsCard";
import type { NewsCardData } from "./types";

interface Category {
  label: string;
  slug: string;
}

interface Props {
  title: string;
  intro: string;
  posts: NewsCardData[];
  categories: Category[];
  emptyText: string;
  homeHref: string;
}

const CATEGORY_PARAM = "categoria";
const ALL_LABEL = "Todos";
const EAGER_CARDS = 3;

function writeCategoryToUrl(slug: string) {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set(CATEGORY_PARAM, slug);
  else url.searchParams.delete(CATEGORY_PARAM);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

export default function NewsListReact({ title, intro, posts, categories, emptyText, homeHref }: Props) {
  const [activeSlug, setActiveSlug] = useState("");

  useEffect(() => {
    const requested = new URL(window.location.href).searchParams.get(CATEGORY_PARAM);
    if (requested === null) return;
    if (categories.some((category) => category.slug === requested)) setActiveSlug(requested);
    else writeCategoryToUrl("");
  }, [categories]);

  const selectCategory = (slug: string) => {
    setActiveSlug(slug);
    writeCategoryToUrl(slug);
  };

  const filtered = activeSlug ? posts.filter((post) => post.categorySlug === activeSlug) : posts;
  const featured = activeSlug ? filtered[0] : posts.find((post) => post.featured) ?? posts[0];

  const tabs = [{ label: ALL_LABEL, slug: "" }, ...categories];

  return (
    <div className="flex flex-col gap-0 md:gap-10">
      <div className="flex flex-col gap-0 md:gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2 px-4 pb-4 pt-7 md:gap-3 md:p-0">
          <nav aria-label="Miga de pan">
            <ol className="flex flex-wrap items-center gap-2 text-[13px] text-content-subtle md:text-body-sm">
              <li>
                <a href={homeHref} className="-my-3 inline-block py-3">Inicio</a>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-brand-secondary-dark">Noticias</li>
            </ol>
          </nav>
          <h1 className="text-heading-h2 text-brand-secondary-dark md:text-[48px] md:leading-[1.1]">{title}</h1>
          {intro && <p className="hidden text-[17px] text-content-muted md:block">{intro}</p>}
        </div>
        <div
          role="group"
          aria-label="Filtrar por categoría"
          className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-5 [scrollbar-width:none] md:flex-wrap md:overflow-visible md:p-0 lg:flex-nowrap [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab) => {
            const isActive = tab.slug === activeSlug;
            return (
              <button
                key={tab.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectCategory(tab.slug)}
                className={`flex h-11 shrink-0 items-center rounded-pill border px-5 text-body-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "border-brand-secondary-dark bg-brand-secondary-dark text-white"
                    : "border-line bg-surface text-brand-secondary-dark can-hover:hover:border-brand-secondary-light"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-4 py-12 text-center text-body-md text-content-muted md:px-0">{emptyText}</p>
      ) : (
        <>
          {featured && (
            <a
              href={featured.href}
              className="group hidden overflow-hidden rounded-[28px] bg-surface-raised transition-shadow duration-300 motion-reduce:transition-none can-hover:hover:shadow-xl md:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
            >
              <div className="aspect-[16/10] overflow-hidden">
                {featured.image && (
                  <img
                    src={featured.image}
                    alt=""
                    width={760}
                    height={475}
                    fetchPriority="high"
                    className="h-full w-full object-cover transition-transform duration-300 motion-reduce:transition-none can-hover:group-hover:scale-[1.04]"
                  />
                )}
              </div>
              <div className="flex flex-col justify-center gap-4 p-8 lg:p-12">
                <p className="flex flex-wrap items-center gap-2.5 text-[13px] text-content-muted">
                  {featured.category && (
                    <span className="rounded-pill bg-greyscale-light px-3 py-1 font-medium text-content-muted">{featured.category}</span>
                  )}
                  <span>
                    {featured.date} · {featured.readTime}
                  </span>
                </p>
                <h2 className="text-heading-h2 leading-[1.2] text-brand-secondary-dark text-pretty">{featured.title}</h2>
                {featured.excerpt && <p className="text-body-md leading-[1.6] text-content-muted">{featured.excerpt}</p>}
                <span className="mt-1.5 text-[15px] font-medium text-brand-secondary-dark underline underline-offset-4">Leer artículo</span>
              </div>
            </a>
          )}
          <ul className="grid grid-cols-1 gap-8 px-4 md:grid-cols-2 md:gap-x-7 md:gap-y-12 md:px-0 lg:grid-cols-3">
            {filtered.map((post, index) => (
              <li key={post.href} className={post === featured ? "md:hidden" : undefined}>
                <NewsCard post={post} eager={index < EAGER_CARDS} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
