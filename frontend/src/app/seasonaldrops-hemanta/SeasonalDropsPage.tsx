"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";

import type { ShopBridgePageConfig } from "@/src/lib/bridge-page-types";
import { isNotifyMeProduct, isUnbuyableProduct, type ProductView } from "@/src/lib/product-types";

type FormEntry = {
  name: string;
  philosophy: string;
  scent: string;
  botanical?: string;
  price: string;
  cta: string;
  slug: string;
  whatArrives: string[];
};

const PLACEHOLDER_3X2 = "https://placehold.co/1600x1067";
const PLACEHOLDER_WIDE = "https://placehold.co/1600x1000";

const makingSteps = [
  {
    number: "01",
    title: "LITERARY RESEARCH",
  },
  {
    number: "02",
    title: "NARRATIVE PHOTO STUDIES",
  },
  {
    number: "03",
    title: "FRAGRANCE FORMULATION",
  },
  {
    number: "04",
    title: "MATERIAL EXPERIMENTATION",
  },
  {
    number: "05",
    title: "ARTISAN ITERATION",
    description: "(4 months, Shantiniketan)",
  },
  {
    number: "06",
    title: "PACKAGING REFINEMENT",
  },
  {
    number: "07",
    title: "HAND FINISHING",
  },
];

// Editorial framing per form (philosophy + scent + "what arrives" disclosure).
// `price` is a fallback only — the live card prefers Product.priceLabel from
// the backend so admin edits flow through without a code change. Same for
// the card's image (Product.primaryImage takes precedence over the bundled
// editorial asset). Brand should keep `whatArrives` lists current per SKU.
const SHARED_WHAT_ARRIVES = [
  "Terracotta diffuser",
  "Fragrance oil",
  "Wax melts",
  "Candles",
  "Halogen lamp",
  "Textile narrative",
  "Archival box",
];

const forms: FormEntry[] = [
  {
    name: "NANDINI",
    philosophy: "Warmth without submission.",
    scent: "Raktakarabi",
    botanical: "Red Oleander",
    price: "6,499",
    cta: "Reserve Nandini",
    slug: "hemanta-nandini",
    whatArrives: SHARED_WHAT_ARRIVES,
  },
  {
    name: "RAJA",
    philosophy: "Power in shadow.",
    scent: "Kundo",
    botanical: "Star Jasmine",
    price: "4,499",
    cta: "Reserve Raja",
    slug: "hemanta-raja-diffuser",
    whatArrives: SHARED_WHAT_ARRIVES,
  },
  {
    name: "ISPANI",
    philosophy: "Home discovered through scent.",
    scent: "Bengal Jui",
    botanical: "Jasmine",
    price: "6,499",
    cta: "Reserve Ispani",
    slug: "hemanta-ispani",
    whatArrives: SHARED_WHAT_ARRIVES,
  },
  {
    name: "RISHI",
    philosophy: "Release without spectacle.",
    scent: "Chhatim",
    price: "5,499",
    cta: "Reserve Rishi",
    slug: "hemanta-rishi-diffuser",
    whatArrives: SHARED_WHAT_ARRIVES,
  },
];

const characterScentMapping = [
  {
    name: "NANDINI",
    scent: "Raktakarabi",
    image: "/images/seasonal-drop-nandini-raktakarabi.jpg",
    alt: "Nandini paired with the Raktakarabi scent",
    area: "nandini",
    focalPoint: "50% 35%",
  },
  {
    name: "RAJA",
    scent: "Kundo",
    image: "/images/seasonal-drop-raja-kundo.jpg",
    alt: "Raja paired with the Kundo scent",
    area: "raja",
    focalPoint: "50% 50%",
  },
  {
    name: "ISPANI",
    scent: "Bengal Jui",
    image: "/images/seasonal-drop-ispani-jui.jpg",
    alt: "Ispani paired with the Bengal Jui scent",
    area: "ispani",
    focalPoint: "50% 22%",
  },
  {
    name: "RISHI",
    scent: "Chhatim",
    image: "/images/seasonal-drop-rishi-chhatim.jpg",
    alt: "Rishi paired with the Chhatim scent",
    area: "rishi",
    focalPoint: "50% 40%",
  },
];

function ImageBreak({
  caption,
  imageSrc = PLACEHOLDER_WIDE,
  alt = "Editorial archival placeholder",
  animated = false,
  tone = "default",
  forceMonochrome = false,
  sketchEffect = false,
}: {
  caption: string;
  imageSrc?: string;
  alt?: string;
  animated?: boolean;
  tone?: "default" | "muted";
  forceMonochrome?: boolean;
  sketchEffect?: boolean;
}) {
  return (
    <section className="image-break" data-reveal>
      <div className="editorial-shell">
        <figure className="image-break-figure">
          <div
            className={`archive-image${animated ? " archive-image-animated" : ""}${
              tone === "muted" ? " archive-image-muted" : ""
            }${sketchEffect ? " archive-image-sketch" : ""}`}
          >
            <img
              src={imageSrc}
              alt={alt}
              className="archive-image-media"
              style={
                sketchEffect
                  ? {
                      filter: "grayscale(1) saturate(0) contrast(1.38) brightness(0.7) sepia(0.04) blur(0.5px)",
                    }
                  : forceMonochrome
                    ? {
                        filter: "grayscale(1) saturate(0) brightness(0.76) contrast(0.92)",
                      }
                    : undefined
              }
            />
            <span
              className="archive-caption"
              style={{
                left: 0,
                right: 0,
                width: "100%",
                textAlign: "center",
                display: "block",
                paddingLeft: "8px",
                paddingRight: "8px",
              }}
            >
              {caption}
            </span>
          </div>
        </figure>
      </div>
    </section>
  );
}

type SeasonalDropsPageProps = {
  productsBySlug: Record<string, ProductView>;
  bridge: ShopBridgePageConfig | null;
};

export default function SeasonalDropsPage({ productsBySlug, bridge }: SeasonalDropsPageProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedProduct = selectedSlug ? productsBySlug[selectedSlug] ?? null : null;

  // Bridge-overridable assets (Decision #31). Each slot falls back to the
  // existing hardcoded path when the admin hasn't uploaded a replacement.
  const heroImage =
    bridge?.heroImage && bridge.heroImage.length > 0
      ? bridge.heroImage
      : "/images/Hemanta drop HP banner 1.png";
  const heroImageAlt =
    bridge?.heroImageAlt && bridge.heroImageAlt.length > 0
      ? bridge.heroImageAlt
      : "Hemanta Seasonal Drop hero banner";
  const formImageOverrides: Array<string | undefined> = [
    bridge?.formCard1Image,
    bridge?.formCard2Image,
    bridge?.formCard3Image,
    bridge?.formCard4Image,
  ];
  const formImageAlts: Array<string | undefined> = [
    bridge?.formCard1Alt,
    bridge?.formCard2Alt,
    bridge?.formCard3Alt,
    bridge?.formCard4Alt,
  ];
  const characterImages = characterScentMapping.map((entry, i) => ({
    ...entry,
    image: formImageOverrides[i] && formImageOverrides[i]!.length > 0 ? formImageOverrides[i]! : entry.image,
    alt: formImageAlts[i] && formImageAlts[i]!.length > 0 ? formImageAlts[i]! : entry.alt,
  }));
  const imageBreak1Src = bridge?.imageBreak1Image && bridge.imageBreak1Image.length > 0
    ? bridge.imageBreak1Image
    : "/images/Seasonal Drop img 2.jpg";
  const imageBreak1Alt = bridge?.imageBreak1Alt && bridge.imageBreak1Alt.length > 0
    ? bridge.imageBreak1Alt
    : "Seasonal drop editorial image for Story preceded form";
  const imageBreak2Src = bridge?.imageBreak2Image && bridge.imageBreak2Image.length > 0
    ? bridge.imageBreak2Image
    : "/images/seasonal-drop-character-before-clay.png";
  const imageBreak2Alt = bridge?.imageBreak2Alt && bridge.imageBreak2Alt.length > 0
    ? bridge.imageBreak2Alt
    : "Seasonal drop editorial image for Character before clay";
  const imageBreak3Src = bridge?.imageBreak3Image && bridge.imageBreak3Image.length > 0
    ? bridge.imageBreak3Image
    : "/images/seasonal-drop-listen-before-shaping.jpg";
  const imageBreak3Alt = bridge?.imageBreak3Alt && bridge.imageBreak3Alt.length > 0
    ? bridge.imageBreak3Alt
    : "Seasonal drop editorial image for Listening before shaping";

  const scrollToFourForms = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();

    const target = document.getElementById("four-forms");
    if (!target) return;

    const headerOffset = 96;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  };

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const captions = Array.from(document.querySelectorAll<HTMLElement>(".archive-caption"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" },
    );

    targets.forEach((target) => observer.observe(target));

    let captionObserver: IntersectionObserver | null = null;
    if (captions.length) {
      if ("IntersectionObserver" in window) {
        captionObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                captionObserver?.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.25 },
        );

        captions.forEach((caption) => captionObserver?.observe(caption));
      } else {
        captions.forEach((caption) => caption.classList.add("visible"));
      }
    }

    return () => {
      observer.disconnect();
      captionObserver?.disconnect();
    };
  }, []);

  return (
    <>
    <main className="seasonaldrops-page min-h-screen bg-[#F3EFE7] pt-[72px] text-[#3a3a3a] sm:pt-[76px]">
      <section className="relative flex min-h-[74vh] max-h-[80vh] items-center justify-center overflow-hidden bg-[#1b1a18]" data-reveal>
        <img
          src={heroImage}
          alt={heroImageAlt}
          className="hero-image absolute inset-0 h-full w-full object-cover object-[center_54%]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(17,16,14,0.44) 0%, rgba(17,16,14,0.2) 36%, rgba(17,16,14,0.52) 100%)",
          }}
        />

        <div className="page-container relative z-10 text-center">
          <h1
            className="mx-auto max-w-[18ch] text-[clamp(38px,5.4vw,66px)] font-serif leading-[1.06] tracking-[-0.02em]"
            style={{ color: "#E3EAD8", textShadow: "0 2px 18px rgba(10, 16, 12, 0.24)" }}
          >
            Hemanta
            <span
              className="mt-2 block text-[clamp(24px,3.4vw,40px)]"
              style={{ color: "#E3EAD8" }}
            >
              Seasonal Drop 01
            </span>
          </h1>
          <p
            className="mx-auto mt-5 max-w-[40ch] text-[16px] font-light leading-[1.75]"
            style={{ color: "#DCE5CF", textShadow: "0 2px 16px rgba(10, 16, 12, 0.2)" }}
          >
            100 years of Rabindranath Tagore&rsquo;s Raktakarabi
          </p>
          <Link
            href="#four-forms"
            onClick={scrollToFourForms}
            className="mt-8 inline-flex border border-[#d7c7a9]/80 px-6 py-3 text-[12px] tracking-[0.14em] text-[#efe4cd] hover:border-[#efe4cd] hover:text-[#fff7e8]"
          >
            Explore the Four Forms &darr;
          </Link>
        </div>
      </section>

      <section className="major-section pb-8" data-reveal>
        <div className="editorial-shell">
          <div className="editorial-column">
            <h2 className="mt-0 text-[clamp(31px,4vw,44px)] leading-[1.15]">Hemanta &mdash; A Letter from the House of Seijaku</h2>
            <div className="mt-8 space-y-3 text-[17px] font-light leading-[1.7] text-[#4e4841]">
              <p>There is a particular quality of light in Bengal at the onset of Hemanta.</p>
              <p>The afternoons grow thinner. The air carries a quiet sharpness.</p>
              <p>Terracotta cools faster to the touch.</p>
              <p>This collection was born in that interval.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="major-section pt-0" data-reveal>
        <div className="editorial-shell">
          <div className="editorial-column text-[17px] font-light leading-[1.82] text-[#4f4942]">
            <div className="space-y-2">
              <p
                className="mb-8 font-serif text-[#262320]"
                style={{ fontSize: "clamp(32px, 3vw, 40px)", lineHeight: 1.28 }}
              >
                A hundred years ago, Rabindranath Tagore wrote <span className="font-serif">Raktakarabi</span> &mdash; a play
                of veils and voices.
              </p>
              <div className="space-y-5">
                <p>A king who hides behind a lattice.</p>
                <p>A woman who refuses containment.</p>
                <p>A monk who gives back what others cling to.</p>
                <p>A scent discovered far from home.</p>
              </div>
            </div>
            <div className="mt-8 space-y-2">
              <p>We returned not to retell them &mdash; but to listen again.</p>
              <p
                className="pt-2 font-serif text-[#262320]"
                style={{ fontSize: "clamp(28px, 2.6vw, 36px)", lineHeight: 1.3 }}
              >
                Hemanta is our response.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ImageBreak
        caption="Story preceded form."
        imageSrc={imageBreak1Src}
        alt={imageBreak1Alt}
        animated
      />

      <section className="making-section" data-reveal>
        <div className="making-shell">
          <div className="making-inner">
            <h2 className="making-heading">The Making</h2>

            <div className="making-scroller" aria-label="Hemanta making process rail">
              <ol className="making-rail">
                {makingSteps.map((step) => (
                  <li key={step.number} className="making-step">
                    <span aria-hidden className="step-line" />
                    <p className="step-number">{step.number}</p>
                    <p className="step-title">{step.title}</p>
                    {step.description ? <p className="step-description">{step.description}</p> : null}
                  </li>
                ))}
              </ol>
            </div>

            <div className="making-notes">
              <p>Before clay was shaped, the characters were embodied.</p>
              <p
                className="text-[#403a33]"
                style={{ fontSize: "clamp(22px, 2vw, 28px)", lineHeight: 1.64 }}
              >
                The story was photographed before it was formed.
              </p>
              <p>Boxes were silkscreened and finished by hand.</p>
              <p>Terracotta forms refined through multiple prototypes.</p>
              <p
                className="text-[#403a33]"
                style={{ fontSize: "clamp(22px, 2vw, 28px)", lineHeight: 1.64 }}
              >
                Fragrance developed to mirror character psychology.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ImageBreak
        caption="Character before clay."
        imageSrc={imageBreak2Src}
        alt={imageBreak2Alt}
        animated
        tone="muted"
        sketchEffect
      />

      <section className="mapping-section" data-reveal>
        <div className="mapping-shell">
          <h2 className="mt-0 text-[clamp(30px,3.2vw,42px)] leading-[1.12]">Character &amp; Scent Mapping</h2>
          <p className="mt-3 text-[16px] font-light leading-[1.75] text-[#555047]">
            Four presences. Four scents. Held in relation.
          </p>

          <div className="mapping-grid">
            {characterScentMapping.map((entry) => (
              <article key={entry.name} className={`mapping-tile mapping-${entry.area}`}>
                <div className="mapping-media">
                  <img
                    src={entry.image}
                    alt={entry.alt}
                    className="mapping-image"
                    style={{ objectPosition: entry.focalPoint }}
                  />
                </div>
                <div aria-hidden className="mapping-overlay" />
                <div className="mapping-label">
                  <p className="mapping-name">{entry.name}</p>
                  <p className="mapping-scent">{entry.scent}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="four-forms" className="major-section scroll-mt-[108px]" data-reveal>
        <div className="four-forms-shell">
          <div className="four-forms-head">
            <h2 className="mt-0 text-[clamp(30px,3.4vw,44px)] leading-[1.12]">The Four Forms</h2>
            <p className="mt-3 text-[16px] font-light leading-[1.76] text-[#554f48]">
              Four chapters. Four scent-led characters. Each held as an object within the Hemanta archive.
            </p>
          </div>

          <div className="forms-grid">
            {forms.map((form, index) => {
              const product = productsBySlug[form.slug];
              const fallbackImage =
                formImageOverrides[index] && formImageOverrides[index]!.length > 0
                  ? formImageOverrides[index]!
                  : characterImages[index]?.image ?? PLACEHOLDER_3X2;
              const fallbackAlt =
                formImageAlts[index] && formImageAlts[index]!.length > 0
                  ? formImageAlts[index]!
                  : `${form.name} editorial`;

              // Prefer DB-managed assets; fall back to bridge override / bundled path.
              const cardImage = product?.image ?? fallbackImage;
              const cardImageAlt = product?.imageAlt ?? fallbackAlt;
              const cardTitle = form.name; // editorial label stays uppercase
              const cardPrice = product?.priceLabel ?? `INR ${form.price}`;

              // CTA states match the rest of the storefront (ShopProductActions).
              // - no product (admin hasn't created yet) → "Not yet available", static
              // - unbuyable (SOLD_OUT/UPCOMING)              → status pill, static
              // - notify-me (WAITLIST)                       → "Notify Me", opens drawer
              // - everything else                            → "Reserve <name>", opens drawer
              const isClickable = Boolean(product) && !isUnbuyableProduct(product!);
              let ctaLabel = form.cta;
              if (!product) ctaLabel = "Not yet available";
              else if (isUnbuyableProduct(product)) ctaLabel = product.status ?? "Sold Out";
              else if (isNotifyMeProduct(product)) ctaLabel = "Notify Me";

              return (
                <article key={form.name} className="form-card" data-reveal>
                  <div className="form-card-media">
                    <img src={cardImage} alt={cardImageAlt} className="form-card-image" loading="lazy" />
                  </div>

                  <div className="form-card-body">
                    <h3 className="form-card-name">{cardTitle}</h3>
                    <p className="form-card-philosophy">{form.philosophy}</p>
                    <p className="form-card-scent">
                      <span>{form.scent}</span>
                      {form.botanical ? <span aria-hidden> · </span> : null}
                      {form.botanical ? <span>{form.botanical}</span> : null}
                    </p>

                    <details className="form-card-disclosure">
                      <summary>What Arrives</summary>
                      <ul>
                        {form.whatArrives.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </details>

                    <div className="form-card-footer">
                      <span className="form-card-price">{cardPrice}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedSlug(form.slug)}
                        disabled={!isClickable}
                        className={`form-card-cta ${isClickable ? "form-card-cta-active" : "form-card-cta-disabled"}`}
                        aria-label={isClickable ? form.cta : `${cardTitle}: ${ctaLabel}`}
                      >
                        {ctaLabel} {isClickable ? <span aria-hidden>&rarr;</span> : null}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <ImageBreak
        caption="Listening before shaping."
        imageSrc={imageBreak3Src}
        alt={imageBreak3Alt}
        animated
        tone="muted"
        sketchEffect
      />

      <section className="major-section closing-block closing-block-includes" data-reveal>
        <div className="editorial-shell">
          <div className="editorial-column max-w-[640px]">
            <h2 className="mt-0 text-[clamp(28px,3.2vw,38px)] leading-[1.12]">Each Hemanta set includes</h2>
            <div className="mt-8 space-y-1.5 text-[16px] font-light leading-[1.75] text-[#4e4841]">
              <p>Handcrafted diffuser</p>
              <p>Fragrance oil</p>
              <p>Wax melts</p>
              <p>Candles</p>
              <p>Halogen lamp</p>
              <p>Textile narrative</p>
              <p>Archival box</p>
            </div>
            <p
              className="mt-7 font-serif text-[#24211e]"
              style={{ fontSize: "clamp(32px, 3vw, 40px)", lineHeight: 1.28 }}
            >
              Designed to be held.
            </p>
            <span aria-hidden className="final-section-divider" />
          </div>
        </div>
      </section>

      <section className="limited-section closing-block closing-block-limited" data-reveal>
        <div className="editorial-shell">
          <div className="editorial-column max-w-[760px]">
            <p className="font-serif text-[clamp(28px,3.7vw,40px)] leading-[1.28] text-[#1f1d19]">
              Hemanta is Seasonal Drop 01.
              <br />
              Limited.
              <br />
              Not permanent.
              <br />
              A chapter in the Seijaku archive.
            </p>
            <p
              className="mt-8 font-light text-[#514b44]"
              style={{ fontSize: "clamp(24px, 2.1vw, 30px)", lineHeight: 1.58 }}
            >
              Those who hold Hemanta will be first to know
              <br />
              when it returns through immersive gatherings in Shantiniketan or Kalimpong.
            </p>
            <span aria-hidden className="final-section-divider" />
          </div>
        </div>
      </section>

      <section className="retreat-section closing-block closing-block-retreat" data-reveal>
        <div className="editorial-shell">
          <div className="editorial-column max-w-[760px]">
            <p className="text-[17px] font-light leading-[1.8] text-[#524c45]">
              In time, Hemanta will be re-experienced
              <br />
              through curated retreats &mdash;
              <br />
              where literature, material, and scent are encountered in place.
            </p>
            <span aria-hidden className="final-section-divider" />
          </div>
        </div>
      </section>

      <section className="major-section pt-0 pb-[72px] closing-cta-section" data-reveal>
        <div className="editorial-shell">
          <div className="editorial-column max-w-[760px]">
            <div className="flex flex-col items-start justify-start gap-4 sm:flex-row sm:gap-5">
              <button
                type="button"
                onClick={scrollToFourForms}
                className="inline-flex min-w-[220px] items-center justify-center border border-[#92806a] px-6 py-3 text-[12px] tracking-[0.12em] text-[#2e4938] hover:border-[#6d5e4b] hover:text-[#22392c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b6d57] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3EFE7]"
              >
                Reserve a Hemanta Set
              </button>
              <Link
                href="/ritual"
                className="inline-flex min-w-[220px] items-center justify-center border border-[#b4a792] px-6 py-3 text-[12px] tracking-[0.12em] text-[#3f3a33] hover:border-[#93836f] hover:text-[#2f2a25]"
              >
                Enter the Ritual Space
              </Link>
            </div>
            <Link
              href="/a-seijaku-life"
              className="mt-8 inline-flex border-b border-[#7b6f5d] pb-1 text-[17px] tracking-[0.04em] text-[#2d4535] hover:text-[#1f3528]"
            >
              Scroll the Seasonal Journal &rarr;
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .major-section {
          padding-top: 72px;
          padding-bottom: 72px;
        }

        .limited-section {
          padding-top: 72px;
          padding-bottom: 64px;
        }

        .retreat-section {
          padding-top: 72px;
          padding-bottom: 72px;
        }

        .final-section-divider {
          display: block;
          width: 64px;
          height: 1px;
          margin-top: 32px;
          margin-bottom: 32px;
          background: rgba(110, 95, 78, 0.28);
        }

        .closing-block {
          padding-bottom: 0;
        }

        .closing-block-includes {
          padding-top: 64px;
        }

        .closing-block-limited,
        .closing-block-retreat {
          padding-top: 48px;
        }

        .closing-cta-section {
          padding-top: 40px;
        }

        .image-break {
          margin-top: 48px;
          margin-bottom: 48px;
        }

        .editorial-shell {
          width: min(1200px, calc(100vw - 120px));
          margin: 0 auto;
        }

        .editorial-column {
          max-width: 720px;
          margin-left: clamp(24px, 10vw, 160px);
          margin-right: auto;
          text-align: left;
        }

        .editorial-wide {
          max-width: 1120px;
          margin-left: clamp(24px, 10vw, 160px);
          margin-right: auto;
          text-align: left;
        }

        .image-break-figure {
          max-width: 1100px;
          margin-left: clamp(24px, 10vw, 160px);
          margin-right: auto;
        }

        .archive-image {
          position: relative;
          display: block;
          overflow: hidden;
          background: #1b1a18;
        }

        .archive-image-media {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
          transform: scale(1.01);
        }

        .archive-image-animated .archive-image-media {
          filter: saturate(1.02) brightness(0.95);
          animation: archivePanelDrift 24s cubic-bezier(0.22, 1, 0.36, 1) infinite alternate;
          will-change: transform, filter;
        }

        .archive-image::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 48%;
          z-index: 1;
          background: linear-gradient(to top, rgba(8, 10, 8, 0.68), rgba(8, 10, 8, 0.16) 54%, rgba(8, 10, 8, 0));
          pointer-events: none;
        }

        .archive-image-muted::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            linear-gradient(90deg, rgba(10, 10, 10, 0.58) 0%, rgba(10, 10, 10, 0.2) 20%, rgba(10, 10, 10, 0.2) 80%, rgba(10, 10, 10, 0.6) 100%),
            linear-gradient(180deg, rgba(12, 12, 12, 0.38) 0%, rgba(12, 12, 12, 0.1) 22%, rgba(12, 12, 12, 0.34) 100%);
          pointer-events: none;
        }

        .archive-image-muted::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            linear-gradient(to top, rgba(8, 10, 8, 0.68), rgba(8, 10, 8, 0.16) 54%, rgba(8, 10, 8, 0)),
            radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.045), transparent 28%),
            radial-gradient(circle at 78% 72%, rgba(255, 255, 255, 0.03), transparent 24%),
            repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.014) 0px,
              rgba(255, 255, 255, 0.014) 1px,
              transparent 1px,
              transparent 3px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.014) 0px,
              rgba(0, 0, 0, 0.014) 1px,
              transparent 1px,
              transparent 4px
            );
          mix-blend-mode: soft-light;
          opacity: 0.5;
          pointer-events: none;
        }

        .archive-image-sketch::before {
          background:
            linear-gradient(90deg, rgba(10, 10, 10, 0.7) 0%, rgba(10, 10, 10, 0.28) 18%, rgba(10, 10, 10, 0.28) 82%, rgba(10, 10, 10, 0.72) 100%),
            linear-gradient(180deg, rgba(12, 12, 12, 0.5) 0%, rgba(12, 12, 12, 0.16) 20%, rgba(12, 12, 12, 0.46) 100%);
        }

        .archive-image-sketch::after {
          background:
            linear-gradient(to top, rgba(8, 8, 8, 0.84), rgba(8, 8, 8, 0.26) 52%, rgba(8, 8, 8, 0)),
            radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.03), transparent 24%),
            repeating-linear-gradient(
              -18deg,
              rgba(255, 255, 255, 0.03) 0px,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px,
              transparent 4px
            ),
            repeating-linear-gradient(
              18deg,
              rgba(0, 0, 0, 0.04) 0px,
              rgba(0, 0, 0, 0.04) 1px,
              transparent 1px,
              transparent 5px
            );
          mix-blend-mode: soft-light;
          opacity: 0.76;
        }

        .archive-image-muted .archive-image-media {
          filter: grayscale(1) saturate(0) brightness(0.8) contrast(0.93);
        }

        .archive-image-muted.archive-image-animated .archive-image-media {
          filter: grayscale(1) saturate(0) brightness(0.78) contrast(0.92);
        }

        .archive-image-sketch .archive-image-media {
          filter: grayscale(1) saturate(0) contrast(1.34) brightness(0.72) sepia(0.04) blur(0.45px);
        }

        .archive-image-sketch.archive-image-animated .archive-image-media {
          filter: grayscale(1) saturate(0) contrast(1.38) brightness(0.7) sepia(0.04) blur(0.5px);
        }

        .archive-caption {
          position: absolute;
          left: 0;
          right: 0;
          bottom: clamp(10px, 2vw, 14px);
          transform: translateY(8px);
          z-index: 2;
          font-family: var(--font-inter), "Helvetica Neue", Arial, sans-serif;
          font-size: clamp(12px, 1.4vw, 14px);
          font-weight: 300;
          letter-spacing: 0.08em;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.44);
          width: 100%;
          padding-left: 16px;
          padding-right: 16px;
          text-align: center;
          opacity: 0;
          transition:
            opacity 0.6s ease,
            transform 0.6s ease;
          overflow-wrap: break-word;
        }

        .archive-caption.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes archivePanelDrift {
          0% {
            transform: translate3d(-1.1%, 0.6%, 0) scale(1.04);
            filter: saturate(1) brightness(0.94);
          }
          50% {
            transform: translate3d(0.3%, 0%, 0) scale(1.065);
            filter: saturate(1.03) brightness(0.98);
          }
          100% {
            transform: translate3d(1.2%, -0.8%, 0) scale(1.085);
            filter: saturate(1.05) brightness(1);
          }
        }

        .making-section {
          padding-top: 96px;
          padding-bottom: 96px;
        }

        .making-shell {
          width: min(1200px, calc(100vw - 120px));
          margin: 0 auto;
        }

        .making-inner {
          margin-left: clamp(24px, 10vw, 160px);
          margin-right: auto;
        }

        .making-heading {
          margin-top: 0;
          margin-bottom: 34px;
          font-size: clamp(30px, 3.4vw, 46px);
          line-height: 1.1;
          letter-spacing: -0.02em;
          text-align: left;
          color: #1f1c18;
        }

        .making-scroller {
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-gutter: stable;
          scroll-behavior: smooth;
          padding-bottom: 18px;
          cursor: grab;
          scrollbar-width: thin;
          scrollbar-color: #8a8175 #e3dbd0;
        }

        .making-scroller:active {
          cursor: grabbing;
        }

        .making-scroller::-webkit-scrollbar {
          height: 11px;
        }

        .making-scroller::-webkit-scrollbar-track {
          background: #e3dbd0;
          border-radius: 999px;
        }

        .making-scroller::-webkit-scrollbar-thumb {
          background: #8a8175;
          border-radius: 999px;
          border: 2px solid #e3dbd0;
        }

        .making-rail {
          list-style: none;
          margin: 0;
          padding: 0 4px;
          min-width: max-content;
          display: flex;
          align-items: flex-start;
          gap: 38px;
        }

        .making-step {
          min-width: 186px;
        }

        .step-line {
          display: block;
          width: 136px;
          height: 1px;
          background: rgba(102, 92, 79, 0.36);
        }

        .step-number {
          margin-top: 10px;
          margin-bottom: 8px;
          color: #6b645a;
          font-size: 14px;
          letter-spacing: 0.16em;
        }

        .step-title {
          margin: 0;
          color: #2f2b26;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.15em;
          line-height: 1.65;
        }

        .step-description {
          margin-top: 9px;
          color: #686157;
          font-size: 14px;
          font-weight: 300;
          line-height: 1.7;
          max-width: 22ch;
        }

        .making-notes {
          margin-top: 36px;
          max-width: 600px;
          text-align: left;
          color: #575148;
          font-size: clamp(16px, 1.2vw, 17px);
          font-weight: 300;
          line-height: 1.84;
        }

        .making-notes p + p {
          margin-top: 2px;
        }

        .four-forms-shell {
          width: min(1180px, calc(100vw - 96px));
          margin-left: auto;
          margin-right: auto;
        }

        .four-forms-head {
          max-width: 760px;
          text-align: left;
        }

        .forms-grid {
          margin-top: 48px;
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 56px 40px;
        }

        @media (min-width: 1024px) {
          .forms-grid {
            grid-template-columns: 1fr 1fr;
            gap: 72px 56px;
          }
        }

        .form-card {
          display: flex;
          flex-direction: column;
          background: #faf6ec;
          border: 1px solid rgba(110, 95, 78, 0.16);
          overflow: hidden;
        }

        .form-card-media {
          width: 100%;
          aspect-ratio: 4 / 5;
          background: #ddd1c1;
          overflow: hidden;
        }

        .form-card-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .form-card:hover .form-card-image {
          transform: scale(1.02);
        }

        .form-card-body {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 28px 28px 24px;
        }

        @media (min-width: 768px) {
          .form-card-body {
            padding: 32px 32px 28px;
          }
        }

        .form-card-name {
          margin: 0;
          font-size: clamp(26px, 2.2vw, 34px);
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #1f1c19;
        }

        .form-card-philosophy {
          margin: 14px 0 0;
          font-family: var(--font-serif, Georgia, serif);
          font-size: 18px;
          line-height: 1.4;
          color: #2f2a24;
        }

        .form-card-scent {
          margin: 10px 0 0;
          font-size: 14px;
          font-weight: 300;
          line-height: 1.6;
          color: #5a5249;
          letter-spacing: 0.01em;
        }

        .form-card-disclosure {
          margin-top: 18px;
          border-top: 1px solid #d5cab9;
          border-bottom: 1px solid #d5cab9;
          padding: 12px 0;
        }

        .form-card-disclosure summary {
          cursor: pointer;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #3d3a35;
          list-style: none;
        }

        .form-card-disclosure summary::-webkit-details-marker {
          display: none;
        }

        .form-card-disclosure summary::after {
          content: "+";
          float: right;
          font-size: 14px;
          color: #7c715f;
        }

        .form-card-disclosure[open] summary::after {
          content: "−";
        }

        .form-card-disclosure ul {
          margin: 12px 0 0;
          padding: 0;
          list-style: none;
        }

        .form-card-disclosure li {
          font-size: 14px;
          font-weight: 300;
          line-height: 1.7;
          color: #59524a;
        }

        .form-card-footer {
          margin-top: auto;
          padding-top: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .form-card-price {
          font-size: 18px;
          line-height: 1.4;
          color: #1f1d1a;
          letter-spacing: 0.01em;
        }

        .form-card-cta {
          font-size: 12px;
          letter-spacing: 0.1em;
          padding: 10px 20px;
          border: 1px solid;
          background: transparent;
          cursor: pointer;
          transition: background 200ms, color 200ms, border-color 200ms;
        }

        .form-card-cta-active {
          color: #2d4535;
          border-color: #92806a;
        }

        .form-card-cta-active:hover {
          background: #2d4535;
          color: #f4efe8;
          border-color: #2d4535;
        }

        .form-card-cta-disabled {
          color: #8a7f73;
          border-color: #c8bdac;
          cursor: not-allowed;
          background: rgba(200, 189, 172, 0.18);
        }

        .mapping-section {
          padding-top: 64px;
          padding-bottom: 64px;
        }

        .mapping-shell {
          width: min(1180px, calc(100vw - 96px));
          margin-left: auto;
          margin-right: auto;
        }

        .mapping-grid {
          margin-top: 32px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-areas:
            "nandini raja"
            "ispani raja"
            "rishi rishi";
          gap: 20px;
        }

        .mapping-tile {
          position: relative;
          overflow: hidden;
          min-height: 280px;
          background: #1b1a18;
          isolation: isolate;
        }

        .mapping-media {
          position: absolute;
          inset: 0;
        }

        .mapping-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transform: scale(1.05);
          filter: saturate(1.02) brightness(0.94);
          animation: mappingImageDrift 18s cubic-bezier(0.22, 1, 0.36, 1) infinite alternate;
          will-change: transform, filter;
        }

        .mapping-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            linear-gradient(to top, rgba(10, 10, 9, 0.78) 0%, rgba(10, 10, 9, 0.24) 42%, transparent 70%),
            linear-gradient(180deg, rgba(10, 10, 9, 0.12) 0%, transparent 22%);
        }

        .mapping-label {
          position: absolute;
          left: 16px;
          bottom: 16px;
          z-index: 2;
          text-shadow: 0 3px 18px rgba(0, 0, 0, 0.42);
        }

        .mapping-name {
          margin: 0;
          color: #f4eddf;
          font-family: var(--font-playfair), "Times New Roman", serif;
          font-size: 23px;
          line-height: 1.06;
          letter-spacing: -0.01em;
        }

        .mapping-scent {
          margin: 5px 0 0;
          color: #ece2cf;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .mapping-nandini {
          grid-area: nandini;
          min-height: 420px;
        }

        .mapping-raja {
          grid-area: raja;
          min-height: 620px;
        }

        .mapping-ispani {
          grid-area: ispani;
          min-height: 500px;
        }

        .mapping-rishi {
          grid-area: rishi;
          min-height: 460px;
        }

        .mapping-nandini .mapping-image {
          animation-duration: 19s;
        }

        .mapping-raja .mapping-image {
          animation-duration: 22s;
        }

        .mapping-ispani .mapping-image {
          animation-duration: 17s;
          animation-delay: -3s;
        }

        .mapping-rishi .mapping-image {
          animation-duration: 24s;
          animation-delay: -4s;
        }

        [data-reveal] {
          opacity: 0;
          transform: translateY(20px);
          transition:
            opacity 0.72s ease,
            transform 0.72s cubic-bezier(0.23, 0.86, 0.32, 1);
          will-change: opacity, transform;
        }

        [data-reveal].is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-image {
          transform: translate3d(0, 0, 0) scale(1.04);
          transform-origin: center center;
          filter: saturate(1.02) brightness(0.98);
          animation: hemantaHeroZoom 30s cubic-bezier(0.22, 1, 0.36, 1) infinite alternate;
          will-change: transform, filter;
        }

        @media (max-width: 1024px) {
          .editorial-shell,
          .making-shell {
            width: min(1200px, calc(100vw - 72px));
          }

          .making-rail {
            gap: 34px;
          }

          .making-step {
            min-width: 182px;
          }

          .four-forms-shell {
            width: min(1180px, calc(100vw - 72px));
          }

          .mapping-shell {
            width: min(1180px, calc(100vw - 72px));
          }

          .mapping-grid {
            gap: 16px;
          }

          .mapping-nandini {
            min-height: 360px;
          }

          .mapping-raja {
            min-height: 520px;
          }

          .mapping-ispani {
            min-height: 300px;
          }

          .mapping-rishi {
            min-height: 270px;
          }

        }

        @media (max-width: 720px) {
          .editorial-shell,
          .making-shell {
            width: calc(100vw - 48px);
          }

          .editorial-column,
          .editorial-wide,
          .image-break-figure,
          .making-inner,
          .forms-grid {
            margin-left: 0;
            margin-right: 0;
          }

          .four-forms-shell {
            width: auto;
            padding-left: 24px;
            padding-right: 24px;
          }

          .mapping-section {
            padding-top: 56px;
            padding-bottom: 56px;
          }

          .mapping-shell {
            width: auto;
            padding-left: 24px;
            padding-right: 24px;
          }

          .mapping-grid {
            margin-top: 28px;
            grid-template-columns: 1fr;
            grid-template-areas:
              "nandini"
              "raja"
              "ispani"
              "rishi";
            gap: 14px;
          }

          .mapping-tile,
          .mapping-nandini,
          .mapping-raja,
          .mapping-ispani,
          .mapping-rishi {
            min-height: 280px;
          }

          .mapping-ispani {
            min-height: 420px;
          }

          .mapping-rishi {
            min-height: 360px;
          }

          .major-section {
            padding-top: 64px;
            padding-bottom: 64px;
          }

          .limited-section,
          .retreat-section {
            padding-top: 64px;
            padding-bottom: 56px;
          }

          .closing-block {
            padding-bottom: 0;
          }

          .closing-block-includes {
            padding-top: 56px;
          }

          .closing-block-limited,
          .closing-block-retreat {
            padding-top: 44px;
          }

          .final-section-divider {
            width: 56px;
            margin-top: 28px;
            margin-bottom: 28px;
          }

          .closing-cta-section {
            padding-top: 36px;
          }

          .image-break {
            margin-top: 48px;
            margin-bottom: 48px;
          }

          .making-section {
            padding-top: 72px;
            padding-bottom: 72px;
          }

          .making-heading {
            margin-bottom: 30px;
            font-size: clamp(30px, 8vw, 42px);
          }

          .making-rail {
            gap: 30px;
          }

          .making-step {
            min-width: 170px;
          }

          .step-line {
            width: 120px;
          }

          .making-notes {
            margin-top: 36px;
            font-size: 16px;
          }

          .forms-grid {
            margin-top: 36px;
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .archive-caption {
            font-size: 10px;
            bottom: 10px;
            padding-left: 10px;
            padding-right: 10px;
          }
        }

        @keyframes hemantaHeroZoom {
          0% {
            transform: translate3d(-1.2%, 0.4%, 0) scale(1.04);
            filter: saturate(1) brightness(0.96);
          }
          50% {
            transform: translate3d(0.4%, -0.2%, 0) scale(1.065);
            filter: saturate(1.04) brightness(0.99);
          }
          100% {
            transform: translate3d(1.4%, -0.8%, 0) scale(1.09);
            filter: saturate(1.07) brightness(1.02);
          }
        }

        @keyframes mappingImageDrift {
          0% {
            transform: translate3d(-1%, 0.8%, 0) scale(1.05);
            filter: saturate(1) brightness(0.93);
          }
          50% {
            transform: translate3d(0.2%, 0%, 0) scale(1.075);
            filter: saturate(1.03) brightness(0.97);
          }
          100% {
            transform: translate3d(1.2%, -0.9%, 0) scale(1.09);
            filter: saturate(1.06) brightness(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-reveal] {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .hero-image {
            animation: none;
            transform: scale(1.05);
            filter: none;
          }

          .archive-image-animated .archive-image-media {
            animation: none;
            transform: scale(1.04);
            filter: none;
          }

          .archive-image-muted::after {
            opacity: 0.45;
          }

          .mapping-image {
            transition: none;
            animation: none;
            transform: scale(1.04);
            filter: none;
          }
        }
      `}</style>
      </main>
    </>
  );
}
