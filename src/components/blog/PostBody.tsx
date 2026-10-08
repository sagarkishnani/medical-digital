import { TinaMarkdown, type Components } from "tinacms/dist/rich-text";

const components: Components<{}> = {
  p: (props) => <p className="text-body-md leading-relaxed text-content-muted md:text-body-lg md:leading-relaxed">{props?.children}</p>,
  h2: (props) => (
    <h2 className="mt-2.5 text-heading-h4 text-brand-secondary-dark md:mt-4 md:text-heading-h3">{props?.children}</h2>
  ),
  h3: (props) => (
    <h3 className="mt-2.5 text-body-lg font-medium text-brand-secondary-dark md:mt-4 md:text-heading-h4">{props?.children}</h3>
  ),
  blockquote: (props) => (
    <blockquote className="my-1.5 rounded-xl bg-surface-raised px-4 py-5 text-body-lg text-brand-secondary-dark before:content-['“'] after:content-['”'] md:my-3 md:px-8 md:py-7 md:text-heading-h4 md:font-normal [&_p]:inline [&_p]:[color:inherit] [&_p]:[font-size:inherit] [&_p]:[line-height:inherit]">
      {props?.children}
    </blockquote>
  ),
  a: (props) => (
    <a href={props?.url} className="text-accent underline underline-offset-4">
      {props?.children}
    </a>
  ),
  ul: (props) => <ul className="flex list-disc flex-col gap-2 pl-6 text-body-md leading-relaxed text-content-muted md:text-body-lg md:leading-relaxed">{props?.children}</ul>,
  ol: (props) => <ol className="flex list-decimal flex-col gap-2 pl-6 text-body-md leading-relaxed text-content-muted md:text-body-lg md:leading-relaxed">{props?.children}</ol>,
};

export default function PostBody({ content }: { content: any }) {
  if (!content) return <div hidden />;
  return <TinaMarkdown content={content} components={components} />;
}
