import { TinaMarkdown } from "tinacms/dist/rich-text";

/**
 * Renders a Tina rich-text AST. It is an island rather than an .astro partial
 * because TinaMarkdown is a React component; `client:visible` keeps it out of
 * the critical path.
 */
export default function PostBody({ content }: { content: any }) {
  // Never return null from an island: Astro logs a bogus "Invalid hook call"
  // for components that server-render to nothing.
  if (!content) return <div hidden />;
  return <TinaMarkdown content={content} />;
}
