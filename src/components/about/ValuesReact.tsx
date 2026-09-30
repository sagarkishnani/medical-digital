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
    <section id="valores" className="container-xl flex flex-col gap-10 py-16 md:py-24">
      {values.title && (
        <h2 className="text-heading-h2 text-brand-secondary-dark lg:text-heading-h1" data-tina-field={tinaField(values, "title")}>
          {values.title}
        </h2>
      )}
      <ul className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item: any, index: number) => (
          <li key={index} className="flex flex-col gap-4 pb-2 pr-7 pt-8">
            <Icon name={item.icon} className="h-10 w-10 text-brand-primary" />
            <h3 className="text-heading-h4 text-brand-secondary-dark" data-tina-field={tinaField(item, "name")}>
              {item.name}
            </h3>
            {item.text && (
              <p className="text-body-md text-content-subtle" data-tina-field={tinaField(item, "text")}>
                {item.text}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
