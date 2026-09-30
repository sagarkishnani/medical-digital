import { useTina, tinaField } from "tinacms/dist/react";
import Icon from "../shared/Icon";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function ValuesReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const values = data?.about?.values;
  const items = (values?.items || []).filter((item: any) => item?.name);
  if (!values || items.length === 0) return <div hidden />;

  return (
    <section id="valores" className="container-xl flex flex-col gap-2 py-10 md:gap-10 md:py-24">
      {values.title && (
        <h2 className="mb-2 text-heading-h3 text-brand-secondary-dark md:mb-0 md:text-heading-h2 lg:text-heading-h1" data-tina-field={tinaField(values, "title")}>
          {values.title}
        </h2>
      )}
      <ul className="grid sm:grid-cols-2 sm:border-t sm:border-line lg:grid-cols-5">
        {items.map((item: any, index: number) => (
          <li key={index} className="flex gap-4 py-[18px] sm:flex-col sm:pb-2 sm:pr-7 sm:pt-8">
            <Icon name={item.icon} className="h-8 w-8 shrink-0 text-brand-primary sm:h-10 sm:w-10" />
            <div className="flex flex-col gap-1 sm:gap-4">
              <h3 className="text-body-lg font-medium text-brand-secondary-dark sm:text-heading-h4" data-tina-field={tinaField(item, "name")}>
                {item.name}
              </h3>
              {item.text && (
                <p className="text-body-sm text-content-subtle sm:text-body-md" data-tina-field={tinaField(item, "text")}>
                  {item.text}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
