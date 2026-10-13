"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import ShopProductActions from "@/src/components/shop/ShopProductActions";
import type { ShopBridgePageConfig } from "@/src/lib/bridge-page-types";
import { canonicalShopRoutes } from "@/src/lib/shop-routes";
import type { ProductView } from "@/src/lib/product-types";

import DiffuserPageIntro from "./DiffuserPageIntro";

type DiffusersPageClientProps = {
  page: ShopBridgePageConfig;
  products: ProductView[];
};

const DIFFUSERS_SLUGS = [
  "Kolkata-tea-diffuser",
  "coffee-ceramic-diffuser-set",
  "black-kitty-electric-and-manual-ceramic-diffuser",
] as const;

export default function DiffusersPageClient({ page, products }: DiffusersPageClientProps) {
  const router = useRouter();

  const productsBySlug = useMemo(
    () => new Map(products.map((p) => [p.slug, p])),
    [products],
  );

  const curated = useMemo(
    () =>
      DIFFUSERS_SLUGS.map((slug) => productsBySlug.get(slug)).filter(
        (p): p is ProductView => Boolean(p),
      ),
    [productsBySlug],
  );

  const updateQuery = (slug?: string) => {
    if (slug) {
      router.push(`/shop/${slug}`);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#f3efe7] pt-[72px] text-[#3a3a3a] sm:pt-[76px]">
        <DiffuserPageIntro
          eyebrow={page.heroEyebrow}
          title={page.heroTitle}
          intro={page.heroDescription.join(" ")}
          imageSrc={page.heroImage}
          imageAlt={page.heroImageAlt}
          imagePosition={page.heroImagePosition}
          quote={page.heroQuote}
        >
          <Link
            href="#diffusers"
            className="inline-flex items-center justify-center rounded-full bg-[#294536] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#f4efe8] transition-colors duration-200 hover:bg-[#21382c]"
          >
            Explore Diffusers
          </Link>
          <Link
            href={canonicalShopRoutes.shopAll}
            className="text-[11px] uppercase tracking-[0.2em] text-[#5b5247] underline decoration-black/10 underline-offset-4 transition-opacity duration-200 hover:opacity-70"
          >
            Shop All
          </Link>
        </DiffuserPageIntro>

        <section
          id="diffusers"
          className="section-primary scroll-mt-[120px] pt-2 sm:pt-4"
          data-reveal
        >
          <div className="page-container max-w-[1200px]">
            <div className="border-t border-[rgba(79,71,63,0.08)] pt-12 sm:pt-16">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#8a745e]">Three forms</p>
              <h2 className="mt-3 max-w-[26ch] font-serif text-[clamp(26px,2.8vw,34px)] leading-[1.18] tracking-[-0.02em] text-[#1b1714]">
                Each diffuser has a different relationship with the room.
              </h2>
            </div>

            <div className="mt-12 sm:mt-16">
              {curated.map((product, index) => (
                <DiffuserFeatureRow
                  key={product.slug}
                  index={index}
                  product={product}
                  onViewDetails={() => updateQuery(product.slug)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="section-editorial pt-6 sm:pt-8">
          <div className="page-container max-w-[980px]">
            <div className="rounded-[28px] border border-[rgba(86,76,64,0.1)] bg-[linear-gradient(180deg,rgba(250,247,241,0.92)_0%,rgba(244,239,231,0.95)_100%)] px-6 py-8 sm:px-10 sm:py-10">
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a745e]">Editorial Note</p>
              <h2 className="mt-4 max-w-[16ch] text-[clamp(28px,3.4vw,40px)] leading-[1.08] tracking-[-0.02em] text-[#1b1714]">
                Refillable fragrance rituals for modern homes
              </h2>
              <p className="mt-5 max-w-[60ch] text-[15px] leading-[1.9] text-[#60584f]">
                Seijaku diffusers are crafted as artisanal home fragrance objects, pairing considered forms with refillable oils and wax melts. Choose a diffuser form that suits your space, then pair it with a quieter mood for a calmer way to scent smaller rooms with warmth, utility, and restraint.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

type DiffuserFeatureRowProps = {
  index: number;
  product: ProductView;
  onViewDetails: () => void;
};

function DiffuserFeatureRow({
  index,
  product,
  onViewDetails,
}: DiffuserFeatureRowProps) {
  const reverse = index % 2 === 1;
  const indexLabel = String(index + 1).padStart(2, "0");

  return (
    <article
      className={`grid items-center gap-10 border-t border-[rgba(79,71,63,0.06)] py-16 first:border-t-0 first:pt-2 sm:gap-14 sm:py-20 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)] lg:gap-16 ${
        reverse ? "lg:[&>:first-child]:order-2" : ""
      }`}
    >
      <div className="relative">
        <div className="relative aspect-[5/4] overflow-hidden rounded-[26px] bg-[#e7dfd4] shadow-[0_18px_38px_rgba(41,34,27,0.06)]">
          <Image
            src={product.image}
            alt={product.imageAlt ?? product.title}
            fill
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="object-cover object-center"
          />
        </div>
      </div>

      <div className={reverse ? "lg:pr-2" : "lg:pl-2"}>
        <p className="font-serif text-[44px] leading-none text-[#8a745e] sm:text-[56px]">{indexLabel}</p>
        <p className="mt-5 text-[10px] uppercase tracking-[0.32em] text-[#8a745e]">{product.type}</p>
        <h3 className="mt-3 max-w-[18ch] font-serif text-[clamp(28px,3vw,40px)] leading-[1.08] tracking-[-0.02em] text-[#1b1714]">
          {product.title}
        </h3>
        {product.shortDescription ? (
          <p className="mt-5 max-w-[42ch] text-[15px] leading-[1.85] text-[#60584f]">
            {product.shortDescription}
          </p>
        ) : null}
        <p className="mt-6 text-[14px] tracking-[0.04em] text-[#312b25]">{product.priceLabel}</p>

        <ShopProductActions
          className="mt-7"
          item={product}
          onViewDetails={onViewDetails}
        />
      </div>
    </article>
  );
}
