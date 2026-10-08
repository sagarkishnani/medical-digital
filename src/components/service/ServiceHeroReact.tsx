import { useTina, tinaField } from "tinacms/dist/react";
import { withBase } from "../../utils/url";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function ServiceHeroReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const hero = data?.service?.hero;
  if (!hero) return <div hidden />;

  return (
    <header className="flex flex-col gap-2 md:gap-3">
      <nav aria-label="Ruta de navegación">
        <ol className="flex flex-wrap items-center gap-2 text-[13px] leading-5 text-content-muted md:text-body-sm">
          <li>
            <a href={withBase("/")} className="-my-3 inline-block py-3 hover:underline">
              Inicio
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-brand-secondary-dark">
            Servicio técnico
          </li>
        </ol>
      </nav>
      <h1 className="text-heading-h2 text-brand-secondary-dark md:text-heading-h1" data-tina-field={tinaField(hero, "title")}>
        {hero.title}
      </h1>
      {hero.text && (
        <p className="max-w-[640px] text-body-md text-content-muted md:text-body-lg" data-tina-field={tinaField(hero, "text")}>
          {hero.text}
        </p>
      )}
    </header>
  );
}
