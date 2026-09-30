import { useTina, tinaField } from "tinacms/dist/react";
import { mediaUrl } from "../../utils/mediaUrl";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function AboutIntroReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const intro = data?.about?.intro;
  if (!intro) return <div hidden />;
  const paragraphs = (intro.paragraphs || []).filter(Boolean);

  return (
    <section id="quienes" className="container-xl grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-[72px]">
      <div className="flex flex-col gap-5">
        {intro.eyebrow && (
          <p className="text-body-md text-content-subtle" data-tina-field={tinaField(intro, "eyebrow")}>
            {intro.eyebrow}
          </p>
        )}
        {intro.title && (
          <h2 className="text-heading-h2 text-balance text-brand-secondary-dark lg:text-heading-h1" data-tina-field={tinaField(intro, "title")}>
            {intro.title}
          </h2>
        )}
        {paragraphs.map((paragraph: string, index: number) => (
          <p key={index} className="text-body-lg text-content-muted" data-tina-field={tinaField(intro, "paragraphs", index)}>
            {paragraph}
          </p>
        ))}
      </div>
      <div className="aspect-[5/4] overflow-hidden rounded-2xl bg-surface-raised">
        {intro.image && (
          <img
            src={mediaUrl(intro.image)}
            alt={intro.imageAlt || ""}
            width={640}
            height={512}
            loading="lazy"
            className="h-full w-full object-cover object-[65%_center]"
            data-tina-field={tinaField(intro, "image")}
          />
        )}
      </div>
    </section>
  );
}
