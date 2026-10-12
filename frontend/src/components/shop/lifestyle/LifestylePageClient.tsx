"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ShopBridgePageConfig } from "@/src/lib/bridge-page-types";
import { canonicalShopRoutes } from "@/src/lib/shop-routes";
import { type ProductView } from "@/src/lib/product-types";

import LifestylePageIntro from "./LifestylePageIntro";
import LifestyleSetCard, { type LifestyleFieldValue } from "./LifestyleSetCard";
import {
  buildLiveCalmPouchCard,
  CUSTOM_GIFTING_SLUG,
  DAYTIME_PAUSES_SLUGS,
  PERSONAL_RITUALS_SLUGS,
} from "./lifestyleSetConfig";

type LifestylePageClientProps = {
  page: ShopBridgePageConfig;
  products: ProductView[];
};

export default function LifestylePageClient({ page, products }: LifestylePageClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedValues, setSelectedValues] = useState<Record<string, Record<string, LifestyleFieldValue>>>({});
  const productsBySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const selectedSlug = searchParams.get("item");
  const selectedProduct = selectedSlug ? productsBySlug.get(selectedSlug) ?? null : null;

  const dayTimeProducts = useMemo(
    () => DAYTIME_PAUSES_SLUGS.map((slug) => productsBySlug.get(slug)).filter((p): p is ProductView => Boolean(p)),
    [productsBySlug],
  );
  const personalRitualProducts = useMemo(
    () => PERSONAL_RITUALS_SLUGS.map((slug) => productsBySlug.get(slug)).filter((p): p is ProductView => Boolean(p)),
    [productsBySlug],
  );
  const customGiftingProduct = productsBySlug.get(CUSTOM_GIFTING_SLUG) ?? null;
  const liveCalmPouchCard = useMemo(() => buildLiveCalmPouchCard(products), [products]);

  const updateQuery = (slug?: string) => {
    if (slug) {
      router.push(`/shop/${slug}`);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#f3efe7] px-6 pt-[72px] text-[#3a3a3a] sm:pt-[76px] md:px-12">
        <LifestylePageIntro
          title="Composed ritual sets for everyday calm"
          intro="Objects that shape quiet habit, morning, evening, pause, and return."
          imageSrc={page.heroImage}
          imageAlt={page.heroImageAlt}
        >
          <Link
            href="#daytime-pauses"
            className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-[#294536] px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#f4efe8] transition-colors duration-200 hover:bg-[#21382c]"
          >
            Explore Sets
          </Link>
          <Link
            href={canonicalShopRoutes.shopAll}
            className="text-[11px] uppercase tracking-[0.2em] text-[#4f473f] underline decoration-black/10 underline-offset-4 transition-opacity duration-200 hover:opacity-70"
          >
            Shop All
          </Link>
        </LifestylePageIntro>

        <section className="mx-auto max-w-[1200px] pb-24 pt-12 sm:pb-28 sm:pt-16">
          <div className="space-y-24 sm:space-y-28">
            {/* Section 1 — Daytime Pauses */}
            {dayTimeProducts.length > 0 ? (
              <section id="daytime-pauses" className="scroll-mt-[108px]">
                <SectionHeading
                  eyebrow="One"
                  title="Daytime Pauses"
                  description="Compact ritual boxes for desk-side reset and the quieter moments between meetings."
                />
                <div className="mt-12 grid gap-12 md:grid-cols-2">
                  {dayTimeProducts.map((product) => (
                    <LifestyleSetCard
                      key={product.slug}
                      item={product}
                      displayTitle={product.title}
                      groupLabel={product.type}
                      includes={[]}
                      selectedValues={{}}
                      onSelectValue={() => undefined}
                      onViewDetails={() => updateQuery(product.slug)}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {/* Section 2 — Personal Rituals */}
            {personalRitualProducts.length > 0 ? (
              <section id="personal-rituals" className="scroll-mt-[108px]">
                <SectionHeading
                  eyebrow="Two"
                  title="Personal Rituals"
                  description="A four-part collection sized for daily use — from waking to attuning, end of day."
                />
                <div className="mt-12 grid gap-12 md:grid-cols-2">
                  {personalRitualProducts.map((product) => (
                    <LifestyleSetCard
                      key={product.slug}
                      item={product}
                      displayTitle={product.title}
                      groupLabel={product.type}
                      includes={[]}
                      selectedValues={{}}
                      onSelectValue={() => undefined}
                      onViewDetails={() => updateQuery(product.slug)}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {/* Section 3 — Custom Gifting (Live Calm Pouch picker + editorial aside) */}
            {customGiftingProduct ? (
              <section id="custom-gifting" className="scroll-mt-[108px]">
                <SectionHeading eyebrow="Three" title="Custom Gifting" />
                <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:items-stretch">
                  <div>
                    <LifestyleSetCard
                      item={customGiftingProduct}
                      displayTitle={liveCalmPouchCard.title}
                      groupLabel={liveCalmPouchCard.groupLabel}
                      includes={liveCalmPouchCard.includes}
                      fields={liveCalmPouchCard.fields}
                      selectedValues={selectedValues[liveCalmPouchCard.id] ?? {}}
                      onSelectValue={(fieldId, value) =>
                        setSelectedValues((current) => ({
                          ...current,
                          [liveCalmPouchCard.id]: {
                            ...(current[liveCalmPouchCard.id] ?? {}),
                            [fieldId]: value,
                          },
                        }))
                      }
                      onViewDetails={() => updateQuery(customGiftingProduct.slug)}
                    />
                  </div>
                  <aside className="flex h-full flex-col justify-center rounded-[28px] bg-[linear-gradient(180deg,rgba(248,243,236,0.98)_0%,rgba(241,234,224,0.96)_100%)] px-7 py-10 shadow-sm sm:px-9 lg:px-10">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-[#8b775f]">Custom gifting</p>
                    <h3 className="mt-5 max-w-[14ch] text-[clamp(28px,3.4vw,40px)] leading-[1.08] tracking-[-0.025em] text-[#1b1714]">
                      A composed gift set, assembled with care.
                    </h3>
                    <p className="mt-6 max-w-[36ch] text-[15px] leading-[1.9] text-[#5f574d]">
                      Choose a perfume, a textile, and a dokra form to shape a gift that feels personal, useful, and quietly distinctive.
                    </p>
                  </aside>
                </div>
              </section>
            ) : null}
          </div>
        </section>

        {/* Editorial — From Object to Practice */}
        <section className="mx-auto mb-24 max-w-[1200px] rounded-[30px] bg-[linear-gradient(180deg,rgba(244,238,229,0.98)_0%,rgba(238,231,220,0.98)_100%)] px-7 py-16 sm:px-10 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center lg:gap-14">
            <div className="max-w-[600px]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8a745e]">Editorial</p>
              <h2 className="mt-5 max-w-[14ch] text-[clamp(32px,4vw,46px)] leading-[1.08] tracking-[-0.025em] text-[#1b1714]">
                From Object to Practice
              </h2>
              <p className="mt-6 max-w-[44ch] text-[16px] leading-[1.9] text-[#60584f]">
                Each set is designed to become a small, repeatable ritual – shaping how you begin, pause, and return.
              </p>
              <p className="mt-5 text-[14px] leading-[1.9] text-[#746c62]">
                Dates for upcoming guided programs to be announced soon.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center lg:justify-start">
                <Link
                  href="/#daily-ritual-room"
                  className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#2e4a36] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[#f4efe8] transition-colors duration-200 hover:bg-[#243c2c]"
                >
                  Start a Daily Ritual
                </Link>
                <Link
                  href="/seasonaldrops"
                  className="text-[12px] uppercase tracking-[0.2em] text-[#2e4a36] underline decoration-black/10 underline-offset-4 transition-opacity duration-200 hover:opacity-70"
                >
                  Explore Seasonal Drops &rarr;
                </Link>
              </div>
            </div>

            <div className="min-h-[300px] rounded-[26px] border border-[rgba(86,76,64,0.05)] bg-[linear-gradient(180deg,rgba(250,247,241,0.68)_0%,rgba(241,233,223,0.88)_100%)] shadow-sm" />
          </div>
        </section>
      </main>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-[640px]">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#8a745e]">{eyebrow}</p>
      <h2 className="mt-4 text-[clamp(28px,3.4vw,42px)] leading-[1.08] tracking-[-0.025em] text-[#1b1714]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.85] text-[#60584f]">{description}</p>
      ) : null}
    </div>
  );
}
