import { useTina, tinaField } from "tinacms/dist/react";
import { FaLocationDot } from "react-icons/fa6";

interface Props {
  query: string;
  variables: object;
  data: any;
}

const EMBED_PREFIX = "https://www.google.com/maps/embed";

function extractEmbedUrl(value?: string | null): string {
  const input = value?.trim() || "";
  const src = input.match(/src=["']([^"']+)["']/i)?.[1] ?? input;
  return src.replace(/&amp;/g, "&");
}

export default function ContactMapReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const map = data?.contact?.map;
  if (!map) return <div hidden />;

  const embedUrl = extractEmbedUrl(map.embedUrl);
  const canEmbed = embedUrl.startsWith(EMBED_PREFIX);
  const title = map.title || "Mapa de Google";

  return (
    <section className="relative h-[260px] bg-greyscale-lightest md:h-[420px]">
      {canEmbed ? (
        <iframe
          src={embedUrl}
          title={title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
          data-tina-field={tinaField(map, "embedUrl")}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 map-placeholder">
          <FaLocationDot aria-hidden="true" className="h-12 w-12 text-brand-primary" />
          <p className="rounded-pill bg-surface px-3 py-1.5 text-body-sm text-content-subtle" data-tina-field={tinaField(map, "title")}>
            {title}
          </p>
        </div>
      )}
      {map.directionsUrl && (
        <a
          href={map.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary absolute bottom-6 left-1/2 -translate-x-1/2 shadow-lg"
          data-tina-field={tinaField(map, "directionsUrl")}
        >
          Cómo llegar
        </a>
      )}
    </section>
  );
}
