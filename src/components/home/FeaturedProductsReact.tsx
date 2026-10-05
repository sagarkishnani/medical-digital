import { useTina } from "tinacms/dist/react";
import SectionHeader from "./SectionHeader";
import { withBase } from "../../utils/url";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function FeaturedProductsReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const featured = data?.home?.featured;
  if (!featured) return <div hidden />;

  return <SectionHeader block={featured} href={withBase("/productos")} />;
}
