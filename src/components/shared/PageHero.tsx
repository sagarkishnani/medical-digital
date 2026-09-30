import { tinaField } from "tinacms/dist/react";
import { mediaUrl } from "../../utils/mediaUrl";
import { withBase } from "../../utils/url";

interface Props {
  hero: Record<string, any>;
  breadcrumb: string;
  compact?: boolean;
}

export default function PageHero({ hero, breadcrumb, compact = false }: Props) {
  return (
    <section
      className={`relative flex items-center overflow-hidden bg-gradient-primary pt-[72px] ${
        compact ? "min-h-[220px] md:min-h-[340px]" : "min-h-[260px] md:min-h-[420px]"
      }`}
    >
      {hero.image && (
        <>
          <img
            src={mediaUrl(hero.image)}
            alt=""
            width={1440}
            height={compact ? 309 : 420}
            className="absolute inset-0 h-full w-full object-cover"
            data-tina-field={tinaField(hero, "image")}
          />
          <div className="absolute inset-0 bg-gradient-overlay" />
        </>
      )}
      <div className="container-xl relative flex flex-col gap-2 text-white md:gap-4">
        <nav aria-label="Ruta de navegación">
          <ol className="flex gap-2 text-caption text-brand-tertiary-light md:text-body-sm">
            <li>
              <a href={withBase("/")} className="hover:text-white hover:underline">
                Inicio
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white">
              {breadcrumb}
            </li>
          </ol>
        </nav>
        <h1 className="text-heading-h2 md:text-display" data-tina-field={tinaField(hero, "title")}>
          {hero.title}
        </h1>
      </div>
    </section>
  );
}
