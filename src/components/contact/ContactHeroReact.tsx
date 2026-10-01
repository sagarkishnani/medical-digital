import { useTina } from "tinacms/dist/react";
import PageHero from "../shared/PageHero";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function ContactHeroReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const hero = data?.contact?.hero;
  if (!hero) return <div hidden />;
  return <PageHero hero={hero} breadcrumb="Contacto" compact />;
}
