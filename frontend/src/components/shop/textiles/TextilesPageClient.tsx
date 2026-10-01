"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import ProductDetailDrawer from "@/src/components/shop/ProductDetailDrawer";
import type { ShopBridgePageConfig } from "@/src/lib/bridge-page-types";
import { canonicalShopRoutes } from "@/src/lib/shop-routes";
import { type ProductView } from "@/src/lib/product-types";

import TextileCategorySection, { type TextileDisplayItem } from "./TextileCategorySection";
import TextilesPageIntro from "./TextilesPageIntro";

type TextilesPageClientProps = {
  page: ShopBridgePageConfig;
  products: ProductView[];
};

function isPocketSquare(product: ProductView): boolean {
  const slugMatch = product.slug.toLowerCase().includes("pocket-square");
  const titleMatch = product.title.toLowerCase().includes("pocket square");
  return slugMatch || titleMatch;
}

function buildDisplayItem(product: ProductView): TextileDisplayItem {
  const firstOption = product.customizationOptions?.[0];
  return {
    product,
    description: product.shortDescription ?? "",
    selectorLabel: firstOption?.label,
    selectorOptions: firstOption?.values,
  };
}

export default function TextilesPageClient({ page, products }: TextilesPageClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const selectedSlug = searchParams.get("item");

  const productsBySlug = useMemo(() => new Map(products.map((product) => [product.slug, product])), [products]);

  const selectedProduct = selectedSlug ? productsBySlug.get(selectedSlug) ?? null : null;

  const { scarves, pocketSquares } = useMemo(() => {
    const scarfItems: TextileDisplayItem[] = [];
    const pocketSquareItems: TextileDisplayItem[] = [];
    for (const product of products) {
      const item = buildDisplayItem(product);
      if (isPocketSquare(product)) {
        pocketSquareItems.push(item);
      } else {
        scarfItems.push(item);
      }
    }
    return { scarves: scarfItems, pocketSquares: pocketSquareItems };
  }, [products]);

  const updateQuery = (slug?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (slug) {
      params.set("item", slug);
    } else {
      params.delete("item");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <>
      <main className="min-h-screen bg-[#f3efe7] pt-[72px] text-[#3a3a3a] sm:pt-[76px]">
        <TextilesPageIntro
          eyebrow="TEXTILES IN RITUAL"
          title="Scarves and pocket squares shaped by colour, texture, and quiet ritual"
          intro="These modal and muslin silk textiles carry colour, gesture, and a softened trace of scent."
          secondaryIntro="Designed for work, travel, gifting, and everyday refinement."
          imageSrc={page.heroImage}
          imageAlt={page.heroImageAlt}
          imagePosition={page.heroImagePosition}
        >
          <Link
            href="#scarves"
            className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-[#294536] px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#f4efe8] transition-colors duration-200 hover:bg-[#21382c]"
          >
            Explore Textiles
          </Link>
          <Link
            href={canonicalShopRoutes.shopAll}
            className="text-[11px] uppercase tracking-[0.2em] text-[#4f473f] underline decoration-black/10 underline-offset-4 transition-opacity duration-200 hover:opacity-70"
          >
            Shop All
          </Link>
        </TextilesPageIntro>

        <section className="section-primary pt-2 sm:pt-4" data-reveal>
          <div className="page-container max-w-[1200px]">
            <p className="max-w-[58ch] text-[14px] leading-[1.9] text-[#5f574d]">
              These textiles are arranged by form and use, with scarves for drape and daily wear and pocket squares for detail and gifting, alongside colour stories that sit naturally beside Seijaku fragrances.
            </p>

            <TextileCategorySection
              id="scarves"
              title="Scarves"
              intro="For drape, softness, and everyday ritual dressing."
              items={scarves}
              selectedOptions={selectedOptions}
              onSelectOption={(slug, value) =>
                setSelectedOptions((current) => ({
                  ...current,
                  [slug]: value,
                }))
              }
              onViewDetails={updateQuery}
            />

            <div className="border-t border-[rgba(79,71,63,0.05)] pt-2 sm:pt-4">
              <TextileCategorySection
                id="pocket-squares"
                title="Pocket Squares"
                intro="For detail, occasion, gifting, and small gestures of refinement."
                items={pocketSquares}
                selectedOptions={selectedOptions}
                onSelectOption={(slug, value) =>
                  setSelectedOptions((current) => ({
                    ...current,
                    [slug]: value,
                  }))
                }
                onViewDetails={updateQuery}
              />
            </div>
          </div>
        </section>

        <section className="section-editorial pt-6 sm:pt-8">
          <div className="page-container max-w-[980px]">
            <div className="rounded-[30px] border border-[rgba(86,76,64,0.08)] bg-[linear-gradient(180deg,rgba(250,247,241,0.92)_0%,rgba(244,239,231,0.96)_100%)] px-7 py-9 sm:px-10 sm:py-11">
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a745e]">Editorial Note</p>
              <h2 className="mt-4 max-w-[16ch] text-[clamp(28px,3.4vw,40px)] leading-[1.08] tracking-[-0.02em] text-[#1b1714]">
                Textiles designed for quiet gifting and personal ritual
              </h2>
              <p className="mt-5 max-w-[54ch] text-[15px] leading-[1.95] text-[#60584f]">
                Seijaku luxury scarves and modal silk pocket squares are shaped through considered colour, tactile drape, and fragrance pairing, creating artisanal textiles that move easily between refined gifting, daily wear, and quieter personal ritual.
              </p>
            </div>
          </div>
        </section>
      </main>

      <ProductDetailDrawer item={selectedProduct} isOpen={Boolean(selectedProduct)} onClose={() => updateQuery()} />
    </>
  );
}
