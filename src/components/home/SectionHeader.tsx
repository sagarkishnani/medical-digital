import { tinaField } from "tinacms/dist/react";

interface Props {
  block: Record<string, any>;
  href?: string;
  hideLinkOnMobile?: boolean;
}

export default function SectionHeader({ block, href, hideLinkOnMobile = false }: Props) {
  return (
    <div className="flex items-end justify-between gap-4 md:gap-6">
      {block.title && (
        <h2 className="section-title" data-tina-field={tinaField(block, "title")}>
          {block.title}
        </h2>
      )}
      {href && block.linkLabel && (
        <a href={href} className={`btn-link shrink-0 text-body-sm md:text-link ${hideLinkOnMobile ? "hidden md:inline-flex" : ""}`} data-tina-field={tinaField(block, "linkLabel")}>
          {block.linkLabel}
        </a>
      )}
    </div>
  );
}
