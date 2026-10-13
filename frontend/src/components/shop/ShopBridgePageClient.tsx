"use client";

import Link from "next/link";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { canonicalShopRoutes } from "@/src/lib/shop-routes";
import { type ProductView } from "@/src/lib/product-types";
import type { ShopBridgePageConfig } from "@/src/lib/bridge-page-types";

import { useMemo } from "react";

import EditorialProductRow from "./EditorialProductRow";
import ShopProductActions from "./ShopProductActions";

type ShopBridgePageClientProps = {
  page: ShopBridgePageConfig;
  products: ProductView[];
};

function DokraBroochRow({
  item,
  index,
  onViewDetails,
}: {
  item: ProductView;
  index: number;
  onViewDetails: (slug: string) => void;
}) {
  const reverse = index % 2 === 1;

  return (
    <article className="py-20">
      <div className={`grid items-center gap-12 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:gap-16 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-lg bg-[#e6ddd1]">
          <div className="relative aspect-[4/4.8] w-full">
            <Image src={item.image || "/images/Home Page hero image 1.png"} alt={item.imageAlt ?? item.title} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
        </div>

        <div className="max-w-[460px]">
          <p className="text-xs uppercase tracking-[0.28em] text-[#8f7a65]/80">Dokra Brooch</p>
          <h3 className="mt-4 font-serif text-[32px] leading-[1.06] tracking-[-0.025em] text-[#1f1a16] sm:text-[38px]">
            {item.title}
          </h3>
          <p
            className="mt-5 text-[16px] leading-[1.9] text-[#60584f]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.shortDescription ?? "A dokra brooch shaped for quiet daily ritual."}
          </p>
          <p className="mt-5 text-[15px] text-[#5f584f]">{item.priceLabel}</p>
          <ShopProductActions className="mt-7" item={item} onViewDetails={() => onViewDetails(item.slug)} />
        </div>
      </div>
    </article>
  );
}

export default function ShopBridgePageClient({ page, products }: ShopBridgePageClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSlug = searchParams.get("item");
  const productsBySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const selectedProduct = selectedSlug ? productsBySlug.get(selectedSlug) ?? null : null;
  const isDokraPage = page.slug === "dokra-ornaments";

  const updateQuery = (slug?: string) => {
    if (slug) {
      router.push(`/shop/${slug}`);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#F3EFE7] pt-[72px] text-[#3a3a3a] sm:pt-[76px]">
        <section className="section-primary bg-[#F3EFE7]" data-reveal>
          <div className="page-container grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div className="max-w-[520px]">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#9a785d]">{page.heroEyebrow}</p>
              <h1 className="mt-5">{page.heroTitle}</h1>
              <div className="mt-5 space-y-3 text-[16px] leading-[1.82] text-[#5e584f]">
                {page.heroDescription.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <a
                  href="#bridge-products"
                  className="inline-flex items-center justify-center rounded-full bg-[#2e4a36] px-7 py-4 text-[12px] font-medium uppercase tracking-[0.18em] text-[#f4efe8] hover:bg-[#243c2c]"
                >
                  {isDokraPage ? "Explore Brooches" : `Explore ${page.navLabel}`}
                </a>
                <Link
                  href={canonicalShopRoutes.shopAll}
                  className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#6b6257] hover:text-[#2e4a36]"
                >
                  <span>Shop All</span>
                  <span aria-hidden>&rarr;</span>
                </Link>
              </div>
            </div>

            <div className="relative w-full max-w-[420px] justify-self-center overflow-hidden rounded-[24px] border border-[#D8CEC1] bg-[#FAF7F1] p-3 shadow-[0_18px_40px_rgba(48,40,30,0.06)] md:max-w-[460px]">
              <div className="relative aspect-[4/4.9] overflow-hidden rounded-[20px]">
                <Image
                  src={page.heroImage || "/images/Home Page hero image 1.png"}
                  alt={page.heroImageAlt || page.heroTitle || "Dokra ornaments"}
                  fill
                  priority
                  sizes="(min-width: 768px) 55vw, 100vw"
                  className={`object-cover ${page.heroImagePosition ?? "object-center"}`}
                />
              </div>
              <div className="pointer-events-none absolute inset-x-7 bottom-7 rounded-[18px] border border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.26),rgba(255,255,255,0.08))] p-4 backdrop-blur-[1.5px] md:inset-x-8 md:bottom-8 md:p-5">
                <p className="max-w-[24ch] font-serif text-[22px] leading-[1.14] text-white md:text-[24px]">{page.heroQuote}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="bridge-products" className="section-primary bg-[#F3EFE7]" data-reveal>
          <div className="page-container max-w-[1180px]">
            {isDokraPage ? (
              <>
                <div className="max-w-[760px]">
                  {page.productSectionEyebrow ? (
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[#9a785d]">{page.productSectionEyebrow}</p>
                  ) : null}
                  {page.productSectionTitle ? <h2 className="mt-4 text-[#1c1c1c]">{page.productSectionTitle}</h2> : null}
                  {page.productSectionDescription ? (
                    <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.82] text-[#625b53]">{page.productSectionDescription}</p>
                  ) : null}
                </div>

                <div className="mt-6">
                  {products.map((product, index) => (
                    <div key={product.slug}>
                      <DokraBroochRow item={product} index={index} onViewDetails={updateQuery} />
                      {index === 1 ? (
                        <div className="py-24 text-center">
                          <p className="mx-auto max-w-[600px] font-serif text-[28px] leading-[1.45] tracking-[-0.02em] text-[#7a7065] md:text-[32px]">
                            These objects are not worn for display.
                            <br />
                            They are carried, placed, and returned to.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {page.postCtaTitle ? (
                  <div className="mx-auto mt-14 max-w-[720px] py-20 text-center xl:mt-16">
                    <h2 className="text-[#1c1c1c]">{page.postCtaTitle}</h2>
                    {page.postCtaDescription ? (
                      <p className="mt-4 text-[16px] leading-[1.82] text-[#625b53]">{page.postCtaDescription}</p>
                    ) : null}
                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
                      {page.postCtaPrimaryLabel && page.postCtaPrimaryHref ? (
                        <a
                          href={page.postCtaPrimaryHref}
                          className="inline-flex items-center justify-center rounded-full bg-[#2e4a36] px-7 py-4 text-[12px] font-medium uppercase tracking-[0.18em] text-[#f4efe8] hover:bg-[#243c2c]"
                        >
                          {page.postCtaPrimaryLabel}
                        </a>
                      ) : null}
                      {page.postCtaSecondaryLabel && page.postCtaSecondaryHref ? (
                        <a
                          href={page.postCtaSecondaryHref}
                          className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#5e5549] underline decoration-black/10 underline-offset-4 hover:text-[#2e4a36]"
                        >
                          {page.postCtaSecondaryLabel}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {page.seoFootnote ? (
                  <p className="mx-auto mt-12 max-w-[900px] text-center text-xs leading-[1.9] text-[#847a6d]">
                    {page.seoFootnote}
                  </p>
                ) : null}
              </>
            ) : (
              products.map((product, index) => (
                <EditorialProductRow key={product.slug} item={product} index={index} onViewDetails={updateQuery} />
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
