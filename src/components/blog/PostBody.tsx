import { TinaMarkdown, type Components } from "tinacms/dist/rich-text";

const components: Components<{}> = {
  p: ({ children }) => <p className="text-body-md leading-[1.75] text-content-muted md:text-[18px]">{children}</p>,
  h2: ({ children }) => (
    <h2 className="mt-2.5 text-[22px] font-medium leading-[1.3] text-brand-secondary-dark md:mt-4 md:text-[28px]">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2.5 text-[19px] font-medium leading-[1.3] text-brand-secondary-dark md:mt-4 md:text-[22px]">{children}</h3>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-1.5 rounded-2xl bg-surface-raised px-4 py-5 md:my-3 md:rounded-[20px] md:px-8 md:py-7 [&_p]:text-[18px] [&_p]:leading-[1.5] [&_p]:text-brand-secondary-dark md:[&_p]:text-[20px] md:[&_p]:leading-[1.55] [&_p]:before:content-['“'] [&_p]:after:content-['”']">
      {children}
    </blockquote>
  ),
  a: ({ url, children }) => (
    <a href={url} className="text-accent underline underline-offset-4">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="flex list-disc flex-col gap-2 pl-6 text-body-md leading-[1.75] text-content-muted md:text-[18px]">{children}</ul>,
  ol: ({ children }) => <ol className="flex list-decimal flex-col gap-2 pl-6 text-body-md leading-[1.75] text-content-muted md:text-[18px]">{children}</ol>,
};

export default function PostBody({ content }: { content: any }) {
  if (!content) return <div hidden />;
  return <TinaMarkdown content={content} components={components} />;
}
