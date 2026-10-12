"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  Heart,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  Share2,
  Minus,
  Plus,
  Info,
  Gift,
} from "lucide-react";

import type { ProductView } from "@/src/lib/product-types";
import { hasVariantSelector } from "@/src/lib/product-types";
import { canonicalShopRoutes } from "@/src/lib/shop-routes";
import { useShopState } from "./ShopStateProvider";
import CompactProductCard from "./CompactProductCard";

type ProductDetailPageClientProps = {
  product: ProductView;
  relatedProducts?: ProductView[];
};

function formatPrice(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function ProductDetailPageClient({
  product,
  relatedProducts = [],
}: ProductDetailPageClientProps) {
  const router = useRouter();
  const { addToCart, beginCheckout, isCollected, toggleCollection } = useShopState();
  const collected = isCollected(product.slug);

  // Gallery
  const gallery = useMemo(() => {
    if (product.gallery && product.gallery.length > 0) {
      return product.gallery;
    }
    return product.image ? [product.image] : [];
  }, [product.gallery, product.image]);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedRecently, setAddedRecently] = useState(false);
  const [activeTab, setActiveTab] = useState<"story" | "specs" | "shipping">("story");
  const [copiedLink, setCopiedLink] = useState(false);

  const customizationOptions = product.customizationOptions ?? [];
  const hasVariants = hasVariantSelector(product);

  // Check if all required options are selected
  const allRequiredSelected = useMemo(() => {
    if (!hasVariants || customizationOptions.length === 0) return true;
    return customizationOptions.every((opt) => Boolean(selectedOptions[opt.label]));
  }, [hasVariants, customizationOptions, selectedOptions]);

  // Variant label for cart / order line items
  const activeVariantLabel = useMemo(() => {
    const values = Object.values(selectedOptions).filter(Boolean);
    return values.length > 0 ? values.join(" · ") : null;
  }, [selectedOptions]);

  // Calculate dynamic variant-wise price
  const { currentPrice, totalDelta } = useMemo(() => {
    const base = product.price;
    let deltaSum = 0;

    customizationOptions.forEach((opt) => {
      const chosenValue = selectedOptions[opt.label];
      if (chosenValue && opt.valuesWithPricing) {
        const pricing = opt.valuesWithPricing.find((vp) => vp.label === chosenValue);
        if (pricing && pricing.priceDelta) {
          deltaSum += pricing.priceDelta;
        }
      }
    });

    return {
      currentPrice: Math.max(0, base + deltaSum),
      totalDelta: deltaSum,
    };
  }, [product.price, customizationOptions, selectedOptions]);

  const handleSelectOption = (optionLabel: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionLabel]: value,
    }));
  };

  const handleAddToCart = () => {
    if (!allRequiredSelected) {
      setValidationAttempted(true);
      return;
    }

    addToCart(
      {
        productSlug: product.slug,
        title: product.title,
        unitPrice: currentPrice,
        priceLabel: formatPrice(currentPrice),
        quantity,
        image: product.image,
        shortDescription: product.shortDescription,
        variantLabel: activeVariantLabel,
        selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : null,
        weightGrams: product.weightGrams,
        lengthCm: product.lengthCm,
        breadthCm: product.breadthCm,
        heightCm: product.heightCm,
      },
      { openDrawer: true }
    );

    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 2500);
  };

  const handleBuyNow = () => {
    if (!allRequiredSelected) {
      setValidationAttempted(true);
      return;
    }

    beginCheckout(product.slug, {
      label: activeVariantLabel,
      options: selectedOptions,
    });

    router.push(`${canonicalShopRoutes.checkout}?item=${encodeURIComponent(product.slug)}`);
  };

  const handleShare = async () => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // Fallback ignored
    }
  };

  const activeImage = gallery[activeMediaIndex] ?? product.image;

  return (
    <div
      className="min-h-screen bg-[#fbf8f2] text-[#2A1D1B] pt-24 pb-20 sm:pt-28 sm:pb-28"
      style={{
        fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
      }}
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#8C7A6E]"
        >
          <Link href="/" className="hover:text-[#2A1D1B] transition-colors">
            Home
          </Link>
          <ChevronRight size={11} strokeWidth={1.8} className="text-[#B8A898]" />
          <Link href="/shop" className="hover:text-[#2A1D1B] transition-colors">
            Shop
          </Link>
          {product.type && (
            <>
              <ChevronRight size={11} strokeWidth={1.8} className="text-[#B8A898]" />
              <span className="text-[#8C7A6E] truncate max-w-[150px]">{product.type}</span>
            </>
          )}
          <ChevronRight size={11} strokeWidth={1.8} className="text-[#B8A898]" />
          <span className="text-[#2A1D1B] font-medium truncate max-w-[200px]">{product.title}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Visual Showcase (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Image Viewport */}
            <div className="relative aspect-[4/4.5] w-full overflow-hidden rounded-3xl border border-[rgba(111,100,86,0.12)] bg-[#f3ede3] shadow-sm">
              <Image
                src={activeImage}
                alt={product.imageAlt ?? product.title}
                fill
                priority
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover transition-all duration-700 hover:scale-[1.02]"
              />
              {/* Wishlist Quick Action */}
              <button
                type="button"
                onClick={() => toggleCollection(product.slug)}
                aria-label={collected ? "Remove from wishlist" : "Add to wishlist"}
                className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c7b68] ${
                  collected
                    ? "bg-[#294536] text-[#f4efe8] shadow-md scale-105"
                    : "bg-white/85 text-[#5d5449] hover:bg-white hover:text-[#1d1a17] shadow-sm"
                }`}
              >
                <Heart size={16} fill={collected ? "currentColor" : "none"} strokeWidth={2.2} />
              </button>

              {/* Status pill on image */}
              {product.status && product.status !== "In Stock" && (
                <div className="absolute left-4 top-4 z-10 rounded-full bg-[#1f1a16]/80 px-3.5 py-1 backdrop-blur-md">
                  <span className="text-[10px] font-sans uppercase tracking-[0.22em] text-[#faf6ee]">
                    {product.status}
                  </span>
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {gallery.map((imgUrl, index) => {
                  const isActive = index === activeMediaIndex;
                  return (
                    <button
                      key={imgUrl}
                      type="button"
                      onClick={() => setActiveMediaIndex(index)}
                      className={`relative h-20 w-20 overflow-hidden rounded-xl border transition-all duration-200 ${
                        isActive
                          ? "border-[#294536] ring-2 ring-[#294536]/25 scale-105"
                          : "border-[rgba(111,100,86,0.14)] opacity-75 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`${product.title} view ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Embedded Video If Present */}
            {product.videoUrl && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-[rgba(111,100,86,0.12)] bg-[#1e1b18] shadow-sm">
                <video
                  src={product.videoUrl}
                  controls
                  playsInline
                  className="w-full max-h-[460px] object-cover"
                  poster={product.image}
                />
              </div>
            )}

            {/* Editorial Story & Tabs for Desktop */}
            <div className="mt-12 rounded-3xl border border-[rgba(111,100,86,0.12)] bg-[#FAF4EC] p-6 sm:p-8">
              <div className="flex border-b border-[rgba(111,100,86,0.12)] pb-3 gap-6 font-sans text-[11px] uppercase tracking-[0.2em]">
                <button
                  type="button"
                  onClick={() => setActiveTab("story")}
                  className={`pb-3 transition-colors ${
                    activeTab === "story"
                      ? "border-b-2 border-[#294536] font-semibold text-[#2A1D1B]"
                      : "text-[#8C7A6E] hover:text-[#2A1D1B]"
                  }`}
                >
                  Ritual & Notes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("specs")}
                  className={`pb-3 transition-colors ${
                    activeTab === "specs"
                      ? "border-b-2 border-[#294536] font-semibold text-[#2A1D1B]"
                      : "text-[#8C7A6E] hover:text-[#2A1D1B]"
                  }`}
                >
                  Craft & Dimensions
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("shipping")}
                  className={`pb-3 transition-colors ${
                    activeTab === "shipping"
                      ? "border-b-2 border-[#294536] font-semibold text-[#2A1D1B]"
                      : "text-[#8C7A6E] hover:text-[#2A1D1B]"
                  }`}
                >
                  Delivery & Packaging
                </button>
              </div>

              <div className="pt-6">
                {activeTab === "story" && (
                  <div className="space-y-4 text-[16px] leading-[1.8] text-[#423632] [&_p]:mt-3 [&_p]:first:mt-0 [&_h3]:font-serif [&_h3]:text-[20px] [&_h3]:text-[#1f1a16] [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1.5">
                    {product.longDescription ? (
                      <ReactMarkdown>{product.longDescription}</ReactMarkdown>
                    ) : (
                      <p>{product.shortDescription ?? "Composed for intentional rituals and quiet contemplation."}</p>
                    )}
                  </div>
                )}

                {activeTab === "specs" && (
                  <dl className="grid grid-cols-2 gap-4 font-sans text-[13px]">
                    <div className="rounded-xl bg-[#f4ebe0] p-4">
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6E]">Material</dt>
                      <dd className="mt-1 font-medium text-[#2A1D1B]">{product.material ?? "Artisanal Composite"}</dd>
                    </div>
                    <div className="rounded-xl bg-[#f4ebe0] p-4">
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6E]">Object Type</dt>
                      <dd className="mt-1 font-medium text-[#2A1D1B]">{product.type ?? "Ritual Companion"}</dd>
                    </div>
                    <div className="rounded-xl bg-[#f4ebe0] p-4">
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6E]">Weight</dt>
                      <dd className="mt-1 font-medium text-[#2A1D1B]">
                        {product.weightGrams ? `${product.weightGrams} grams` : "Craft weight vary slightly"}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-[#f4ebe0] p-4">
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6E]">Dimensions</dt>
                      <dd className="mt-1 font-medium text-[#2A1D1B]">
                        {product.lengthCm && product.breadthCm
                          ? `${product.lengthCm} × ${product.breadthCm} × ${product.heightCm} cm`
                          : "Standard artisanal sizing"}
                      </dd>
                    </div>
                  </dl>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-3 font-sans text-[13px] leading-[1.7] text-[#423632]">
                    <div className="flex items-start gap-3">
                      <Truck size={16} className="mt-1 shrink-0 text-[#294536]" />
                      <p>
                        <strong>Safe Transit Across India:</strong> Dispatched from Kolkata within 24 to 48 hours. Typical
                        delivery takes 3 to 5 business days with live courier tracking.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Gift size={16} className="mt-1 shrink-0 text-[#294536]" />
                      <p>
                        <strong>Signature Festive Packaging:</strong> Each piece arrives individually enclosed in custom
                        Seijaku gift packaging with an embossed seal and a handwritten care card.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={16} className="mt-1 shrink-0 text-[#294536]" />
                      <p>
                        <strong>Damaged on Arrival Guarantee:</strong> Artisanal objects are insured during transit. In the
                        rare event of courier damage, we issue an immediate replacement.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Purchase Panel (5 cols on lg) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 rounded-3xl border border-[rgba(111,100,86,0.14)] bg-[#FAF4EC] p-6 sm:p-8 shadow-sm space-y-6">
              {/* Type Eyebrow & Share */}
              <div className="flex items-center justify-between">
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8C7A6E]">
                  {product.type ?? "SEIJAKU OBJECT"}
                </span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1 font-sans text-[10px] uppercase tracking-[0.18em] text-[#8C7A6E] hover:text-[#2A1D1B] transition-colors"
                >
                  <Share2 size={12} />
                  <span>{copiedLink ? "Link Copied ✓" : "Share"}</span>
                </button>
              </div>

              {/* Title */}
              <h1 className="text-[32px] sm:text-[40px] font-normal leading-[1.08] tracking-[-0.02em] text-[#1f1a16]">
                {product.title}
              </h1>

              {/* Short Hook */}
              {product.shortDescription && (
                <p className="text-[16px] leading-[1.65] text-[#5A4841]">{product.shortDescription}</p>
              )}

              {/* Dynamic Live Price Block */}
              <div className="border-y border-[rgba(111,100,86,0.12)] py-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-[30px] sm:text-[34px] font-medium tracking-tight text-[#1f1a16]">
                    {formatPrice(currentPrice)}
                  </span>
                  {totalDelta !== 0 && (
                    <span className="font-sans text-[12px] font-medium text-[#4A6350] bg-[#4A6350]/10 rounded-full px-2.5 py-0.5">
                      {totalDelta > 0 ? `+${formatPrice(totalDelta)} for selected variant` : `${formatPrice(totalDelta)}`}
                    </span>
                  )}
                </div>
                <p className="mt-1 font-sans text-[11px] text-[#8C7A6E]">
                  Inclusive of all taxes · Complimentary festive gift packaging
                </p>
              </div>

              {/* Dynamic Variants & Customization Options */}
              {customizationOptions.length > 0 && (
                <div className="space-y-5 rounded-2xl border border-[rgba(86,76,64,0.14)] bg-[#f5ede1]/80 p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3D302C]">
                      Select Options & Variants
                    </span>
                    <span className="font-sans text-[10px] text-[#8C7A6E]">* Required before purchase</span>
                  </div>

                  {customizationOptions.map((option) => {
                    const isSelected = Boolean(selectedOptions[option.label]);
                    const currentSelectedValue = selectedOptions[option.label] ?? "";

                    return (
                      <div key={option.label} className="space-y-2.5">
                        <div className="flex items-center justify-between font-sans text-[11px]">
                          <span className="font-medium uppercase tracking-[0.14em] text-[#3D302C]">
                            {option.label}
                            <span className="ml-1 text-[#9a785d]">*</span>
                          </span>
                          {currentSelectedValue ? (
                            <span className="font-medium text-[#294536] truncate max-w-[180px]">
                              {currentSelectedValue}
                            </span>
                          ) : (
                            <span className="text-[#a46450] italic text-[10px]">Select an option</span>
                          )}
                        </div>

                        {/* Variant Pills with Price Delta Indicators */}
                        <div className="flex flex-wrap gap-2">
                          {option.values.map((val) => {
                            const isChosen = currentSelectedValue === val;
                            const pricingInfo = option.valuesWithPricing?.find((vp) => vp.label === val);
                            const priceDelta = pricingInfo?.priceDelta ?? 0;

                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleSelectOption(option.label, val)}
                                className={`group flex items-center gap-2 rounded-xl px-3.5 py-2.5 font-sans text-[12px] transition-all ${
                                  isChosen
                                    ? "bg-[#294536] text-[#FAF4EC] shadow-md ring-2 ring-[#294536]/30 font-medium"
                                    : "border border-[rgba(111,100,86,0.2)] bg-white/90 text-[#3D302C] hover:border-[#294536] hover:bg-white"
                                }`}
                              >
                                <span>{val}</span>
                                {priceDelta !== 0 && (
                                  <span
                                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                      isChosen
                                        ? "bg-white/20 text-[#FAF4EC]"
                                        : priceDelta > 0
                                        ? "bg-[#4A6350]/15 text-[#2B3B2F]"
                                        : "bg-[#8C7A6E]/15 text-[#6B564E]"
                                    }`}
                                  >
                                    {priceDelta > 0 ? `+${formatPrice(priceDelta)}` : `${formatPrice(priceDelta)}`}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {validationAttempted && !allRequiredSelected && (
                    <div className="flex items-center gap-2 rounded-xl bg-[#c9533f]/10 p-3 text-[11px] font-sans text-[#a43b29]">
                      <Info size={14} className="shrink-0" />
                      <span>Please choose your desired variant options before adding to bag or buying.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center justify-between border-b border-[rgba(111,100,86,0.12)] pb-5 font-sans">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#3D302C]">Quantity</span>
                <div className="flex items-center gap-3 rounded-full border border-[rgba(111,100,86,0.2)] bg-white px-3 py-1.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="text-[#6B564E] hover:text-[#1f1a16] disabled:opacity-30 p-1"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-6 text-center text-[13px] font-medium text-[#1f1a16]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="text-[#6B564E] hover:text-[#1f1a16] p-1"
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Primary Buying Action Buttons */}
              <div className="space-y-3 pt-2 font-sans">
                {/* Buy Now Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#294536] text-[11px] font-medium uppercase tracking-[0.22em] text-[#FAF4EC] shadow-md transition-all hover:bg-[#20362a] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294536]"
                >
                  <span>Buy Now</span>
                  <span aria-hidden>→</span>
                </button>

                {/* Add to Bag Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[#294536] text-[11px] font-medium uppercase tracking-[0.2em] transition-all ${
                    addedRecently
                      ? "bg-[#294536]/10 text-[#294536] font-semibold"
                      : "bg-transparent text-[#294536] hover:bg-[#294536]/5"
                  }`}
                >
                  {addedRecently ? (
                    <>
                      <Check size={14} strokeWidth={2.5} />
                      <span>Added to Bag ✓</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              </div>

              {/* Reassurances */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[rgba(111,100,86,0.12)] font-sans text-[11px] text-[#6B564E]">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#8C7A6E]" />
                  <span>Artisanal & Ethical</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift size={14} className="text-[#8C7A6E]" />
                  <span>Free Gift Box</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-[#8C7A6E]" />
                  <span>Pan-India Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={14} className="text-[#8C7A6E]" />
                  <span>Insured Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Companion / Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 border-t border-[rgba(111,100,86,0.14)] pt-16">
            <div className="text-center mb-12">
              <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#8C7A6E]">Curated Pairings</p>
              <h2 className="mt-2 text-[32px] sm:text-[40px] font-normal text-[#1f1a16]">
                Pairs Well With This <span className="italic text-[#4A6350]">Ritual</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.slice(0, 4).map((item) => (
                <CompactProductCard
                  key={item.slug}
                  item={item}
                  onViewDetails={(slug) => router.push(`/shop/${slug}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
