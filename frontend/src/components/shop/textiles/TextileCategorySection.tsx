import type { ProductView } from "@/src/lib/product-types";

import TextileProductCard from "./TextileProductCard";

export type TextileDisplayItem = {
  product: ProductView;
  description: string;
  pairingLabel?: string;
  pairingHref?: string;
  selectorLabel?: string;
  selectorOptions?: string[];
};

type TextileCategorySectionProps = {
  id: string;
  title: string;
  intro: string;
  items: TextileDisplayItem[];
  selectedOptions: Record<string, string>;
  onSelectOption: (slug: string, value: string) => void;
  onViewDetails: (slug: string) => void;
};

export default function TextileCategorySection({
  id,
  title,
  intro,
  items,
  selectedOptions,
  onSelectOption,
  onViewDetails,
}: TextileCategorySectionProps) {
  return (
    <section id={id} className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-[620px]">
        <h2 className="text-[clamp(30px,3.3vw,42px)] leading-[1.08] tracking-[-0.025em] text-[#1b1714]">{title}</h2>
        <p className="mt-5 max-w-[34ch] text-[15px] leading-[1.9] text-[#60584f]">{intro}</p>
      </div>

      <div className="mt-10 grid gap-x-7 gap-y-8 sm:mt-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 xl:grid-cols-4 xl:gap-x-9 xl:gap-y-12">
        {items.map((item) => (
          <TextileProductCard
            key={item.product.slug}
            item={item.product}
            categoryLabel="Modal and Muslin Silk Textiles"
            description={item.description}
            pairingLabel={item.pairingLabel}
            pairingHref={item.pairingHref}
            selectorLabel={item.selectorLabel}
            selectorOptions={item.selectorOptions}
            selectedOption={selectedOptions[item.product.slug] ?? ""}
            onSelectOption={(value) => onSelectOption(item.product.slug, value)}
            onViewDetails={() => onViewDetails(item.product.slug)}
          />
        ))}
      </div>
    </section>
  );
}
