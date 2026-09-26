export interface WooImage {
  src: string;
  alt: string;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  brand: string | null;
  shortDescription: string;
  description: string;
  images: WooImage[];
  categories: Pick<WooCategory, "id" | "name" | "slug">[];
}
