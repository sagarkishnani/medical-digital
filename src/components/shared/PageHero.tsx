import { tinaField } from "tinacms/dist/react";
import { mediaUrl } from "../../utils/mediaUrl";

interface Props {
  hero: Record<string, any>;
  breadcrumb: string;
  compact?: boolean;
}

export default function PageHero({ hero, breadcrumb, compact = false }: Props) {
  return (
    <section
      className={`relative flex items-center overflow-hidden bg-gradient-primary pt-[72px] ${
        compact ? "min-h-[260px] md:min-h-[309px]" : "min-h-[320px] md:min-h-[420px]"
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
      <div className="container-xl relative flex flex-col gap-4 text-white">
        <nav aria-label="Ruta de navegación">
          <ol className="flex gap-2 text-body-sm text-brand-tertiary-light">
            <li>
              <a href="/" className="hover:text-white hover:underline">
                Inicio
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white">
              {breadcrumb}
            </li>
          </ol>
        </nav>
        <h1 className="text-heading-h1 md:text-display" data-tina-field={tinaField(hero, "title")}>
          {hero.title}
        </h1>
      </div>
    </section>
  );
}
