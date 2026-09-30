import { tinaField } from "tinacms/dist/react";

interface Props {
  block: Record<string, any>;
  href?: string;
}

export default function SectionHeader({ block, href }: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
      {block.title && (
        <h2 className="text-heading-h2 text-brand-secondary-dark lg:text-heading-h1" data-tina-field={tinaField(block, "title")}>
          {block.title}
        </h2>
      )}
      {href && block.linkLabel && (
        <a href={href} className="btn-link shrink-0 self-start md:self-auto" data-tina-field={tinaField(block, "linkLabel")}>
          {block.linkLabel}
        </a>
      )}
    </div>
  );
}
