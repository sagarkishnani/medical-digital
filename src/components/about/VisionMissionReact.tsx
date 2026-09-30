import { useTina, tinaField } from "tinacms/dist/react";
import { mediaUrl } from "../../utils/mediaUrl";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function VisionMissionReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const block = data?.about?.visionMission;
  if (!block || (!block.vision && !block.mission)) return <div hidden />;

  const statements = [
    { key: "vision", title: "Visión", text: block.vision },
    { key: "mission", title: "Misión", text: block.mission },
  ].filter((statement) => statement.text);

  return (
    <section id="mision" className="grid md:grid-cols-2 md:min-h-[560px]">
      <div className="relative h-[300px] bg-brand-tertiary-lightest md:h-auto">
        {block.image && (
          <img
            src={mediaUrl(block.image)}
            alt={block.imageAlt || ""}
            width={720}
            height={560}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-[30%_center]"
            data-tina-field={tinaField(block, "image")}
          />
        )}
      </div>
      <div className="flex flex-col justify-center gap-8 bg-brand-secondary-dark px-5 py-10 text-white md:gap-14 md:px-[clamp(40px,7vw,120px)] md:py-20">
        {statements.map((statement) => (
          <div key={statement.key} className="flex max-w-[520px] flex-col gap-3 md:gap-4">
            <h2 className="text-heading-h2 lg:text-heading-h1">{statement.title}</h2>
            <p className="text-body-md text-brand-tertiary-lightest md:text-body-lg" data-tina-field={tinaField(block, statement.key)}>
              {statement.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
