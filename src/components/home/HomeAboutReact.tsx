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
    <section className="container-xl flex flex-col gap-8 pb-12 md:gap-16 md:pb-24">
      <div className="grid overflow-hidden rounded-2xl bg-gradient-primary md:grid-cols-[1.15fr_1fr]">
        <div className="h-[230px] bg-brand-secondary-medium md:h-auto md:min-h-[415px]">
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
        <div className="flex flex-col justify-center gap-5 px-[22px] pb-7 pt-6 text-white md:gap-8 md:px-6 md:py-10 md:py-12 md:pl-9 md:pr-10 lg:pr-16">
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
        <ul className="grid grid-cols-2 gap-x-4 gap-y-7 lg:grid-cols-4 lg:gap-8 lg:px-12">
          {stats.map((stat: any, index: number) => (
            <li key={index} className="flex flex-col gap-2 md:gap-3.5">
              <Icon name={stat.icon} className="h-8 w-8 text-brand-secondary-dark md:h-10 md:w-10" />
              <p className="text-heading-h2 text-brand-primary lg:text-stat" data-tina-field={tinaField(stat, "value")}>
                {stat.prefix}
                {stat.value}
              </p>
              <p className="max-w-[220px] text-body-sm text-content-subtle md:text-body-md" data-tina-field={tinaField(stat, "label")}>
                {stat.label}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
