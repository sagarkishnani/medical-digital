import { useTina, tinaField } from "tinacms/dist/react";
import Icon from "../shared/Icon";
import { mediaUrl } from "../../utils/mediaUrl";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function HomeAboutReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const about = data?.home?.about;
  if (!about) return <div hidden />;
  const stats = (about.stats || []).filter(Boolean);

  return (
    <section className="container-xl flex flex-col gap-16 pb-16 md:pb-24">
      <div className="grid overflow-hidden rounded-2xl bg-gradient-primary md:grid-cols-[1.15fr_1fr]">
        <div className="aspect-[740/415] bg-brand-secondary-medium md:aspect-auto md:min-h-[415px]">
          {about.image && (
            <img
              src={mediaUrl(about.image)}
              alt={about.imageAlt || ""}
              width={740}
              height={415}
              loading="lazy"
              className="h-full w-full object-cover object-left"
              data-tina-field={tinaField(about, "image")}
            />
          )}
        </div>
        <div className="flex flex-col justify-center gap-8 px-6 py-10 text-white md:py-12 md:pl-9 md:pr-10 lg:pr-16">
          {about.text && (
            <p className="text-heading-h4 text-pretty lg:text-heading-h3" data-tina-field={tinaField(about, "text")}>
              {about.text}
            </p>
          )}
          {about.buttonLabel && about.buttonUrl && (
            <a href={about.buttonUrl} className="btn-inverse self-start" data-tina-field={tinaField(about, "buttonLabel")}>
              {about.buttonLabel}
            </a>
          )}
        </div>
      </div>

      {stats.length > 0 && (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-8 lg:px-12">
          {stats.map((stat: any, index: number) => (
            <li key={index} className="flex flex-col gap-3.5">
              <Icon name={stat.icon} className="h-10 w-10 text-brand-secondary-dark" />
              <p className="text-stat text-brand-primary" data-tina-field={tinaField(stat, "value")}>
                {stat.prefix}
                {stat.value}
              </p>
              <p className="max-w-[220px] text-body-md text-content-subtle" data-tina-field={tinaField(stat, "label")}>
                {stat.label}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
