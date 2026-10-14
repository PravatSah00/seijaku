"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles } from "lucide-react";

import { getShopProductUseCase, hasVariantSelector, type ProductView } from "@/src/lib/product-types";
import { canonicalShopRoutes } from "@/src/lib/shop-routes";
import type { ProductSelectionPayload } from "../utils";

type ProductDetailDrawerProps = {
  item: ProductView | null;
  isOpen: boolean;
  onClose: () => void;
  selectedCountForProduct?: number;
  canAddMore?: boolean;
  onAddGiftProduct?: (product: ProductView, selection?: ProductSelectionPayload) => void;
  onRemoveGiftProduct?: (product: ProductView) => void;
};

const ENRICHMENT_TIMEOUT_MS = 8_000;

export default function ProductDetailDrawer({
  item,
  isOpen,
  onClose,
  selectedCountForProduct = 0,
  canAddMore = true,
  onAddGiftProduct,
  onRemoveGiftProduct,
}: ProductDetailDrawerProps) {
  const [activeMedia, setActiveMedia] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [enrichedVideoUrl, setEnrichedVideoUrl] = useState<string | null>(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const gallery = item?.gallery ?? (item?.image ? [item.image] : []);
  const activeIndex = activeMedia !== null && gallery[activeMedia] ? activeMedia : 0;
  const activeImage = gallery[activeIndex] ?? item?.image;
  const useCase = item ? getShopProductUseCase(item) : undefined;
  const showVariants = item ? hasVariantSelector(item) : false;
  const customizationOptions = showVariants ? item?.customizationOptions ?? [] : [];
  const allRequiredSelected = customizationOptions.length === 0 || customizationOptions
    .every((option) => Boolean(selectedOptions[option.label]));
  const selectionLabel = Object.values(selectedOptions).filter(Boolean).join(" · ");
  const resolvedVideoUrl = item?.videoUrl || enrichedVideoUrl || null;
  const isAlreadyInGift = selectedCountForProduct > 0;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    setShowFullDesc(false);
    if (!isOpen) {
      setSelectedOptions({});
      setActiveMedia(null);
    }
  }, [isOpen, item?.slug]);

  useEffect(() => {
    if (!isOpen || !item?.slug) {
      setEnrichedVideoUrl(null);
      return undefined;
    }

    const controller = new AbortController();
    const slugAtFetch = item.slug;
    const timeoutId = window.setTimeout(() => controller.abort(), ENRICHMENT_TIMEOUT_MS);

    (async () => {
      try {
        const response = await fetch(
          `/api/public/catalog/products/${encodeURIComponent(slugAtFetch)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          return;
        }
        const data = (await response.json().catch(() => null)) as
          | { item?: { media?: Array<{ asset?: { url?: string; kind?: string } }> } }
          | null;

        const videoAsset = data?.item?.media?.find(
          (entry) => entry?.asset?.kind === "VIDEO" && Boolean(entry?.asset?.url),
        );

        if (videoAsset?.asset?.url && slugAtFetch === item.slug) {
          setEnrichedVideoUrl(videoAsset.asset.url);
        }
      } catch (error) {
        if ((error as Error)?.name === "AbortError") {
          return;
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    })();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [isOpen, item?.slug]);

  if (!isOpen || !item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-[#1f1a16]/45 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className="relative z-10 flex h-full w-full max-w-[620px] flex-col bg-[#FAF4EC] shadow-2xl overflow-y-auto"
      >
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E3D4C4] bg-[#FAF4EC]/95 px-6 py-4 backdrop-blur-md">
          <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-[#8C7A6E]">
            {item.type} {useCase ? `· ${useCase}` : ""}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#5F5448] hover:bg-[#EFE3D3] transition-colors"
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#EFE5D8]">
            {resolvedVideoUrl && activeIndex === 0 ? (
              <video
                src={resolvedVideoUrl}
                controls
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={activeImage || "/images/Home Page hero image 1.png"}
                alt={item.imageAlt ?? item.title}
                fill
                sizes="(min-width: 640px) 560px, 100vw"
                className="object-cover"
              />
            )}
          </div>

          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {gallery.map((img, idx) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveMedia(idx)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    activeIndex === idx
                      ? "border-[#4A6350]"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-[26px] sm:text-[30px] leading-tight text-[#1F1A16]">
                {item.title}
              </h2>
              <span className="font-sans text-[18px] font-medium text-[#2A1D1B] shrink-0">
                {item.priceLabel}
              </span>
            </div>

            {isAlreadyInGift && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#4A6350]/15 px-3 py-1 font-sans text-[11px] font-medium text-[#2B3B2F]">
                <span>✓ Currently in Gift Box: {selectedCountForProduct}</span>
              </div>
            )}

            <p className="mt-3 text-[14px] leading-relaxed text-[#5F5448]">
              {item.shortDescription}
            </p>

            {item.longDescription && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowFullDesc((prev) => !prev)}
                  className="font-sans text-[11px] uppercase tracking-wider text-[#4A6350] underline hover:text-[#2B3B2F]"
                >
                  {showFullDesc ? "Show less" : "Read more"}
                </button>
                {showFullDesc && (
                  <div className="mt-3 border-t border-[#E3D4C4] pt-3 text-[13px] leading-relaxed text-[#5F5448]">
                    <ReactMarkdown>{item.longDescription}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Variants / Customization Options */}
          {customizationOptions.length > 0 && (
            <div className="space-y-4 border-t border-[#E3D4C4] pt-4 font-sans">
              <h3 className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#8C7A6E]">
                Select Options
              </h3>
              {customizationOptions.map((opt) => (
                <div key={opt.label} className="space-y-2">
                  <label className="block text-[12px] font-medium text-[#2A1D1B]">
                    {opt.label} {opt.required && <span className="text-[#8A483B]">*</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val) => {
                      const active = selectedOptions[opt.label] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [opt.label]: val,
                            }))
                          }
                          className={`rounded-lg px-3.5 py-2 text-[12px] font-medium transition-all ${
                            active
                              ? "bg-[#2B3B2F] text-[#F6EEE4] shadow-sm ring-2 ring-[#2B3B2F]/20"
                              : "border border-[#D4C3B2] bg-[#FAF4EC] text-[#4C413A] hover:bg-[#EFE3D3]"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Row */}
          <div className="border-t border-[#E3D4C4] pt-4 font-sans">
            <button
              type="button"
              disabled={!allRequiredSelected || !canAddMore}
              onClick={() => {
                onAddGiftProduct?.(item, {
                  label: selectionLabel || null,
                  options: customizationOptions.length > 0 ? selectedOptions : null,
                });
                onClose();
              }}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-[#2B3B2F] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#F6EEE4] transition-all hover:bg-[#1E2B22] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>
                {!canAddMore
                  ? "Gift Box Full (Max Items Reached)"
                  : isAlreadyInGift
                    ? `+ Add Another with Selected Options`
                    : `+ Add to Gift Box`}
              </span>
            </button>

            {isAlreadyInGift && (
              <button
                type="button"
                onClick={() => {
                  onRemoveGiftProduct?.(item);
                  onClose();
                }}
                className="mt-2.5 flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg border border-[#8A483B]/40 bg-transparent px-6 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#8A483B] transition-colors hover:bg-[#8A483B]/10"
              >
                Remove one from Gift Box
              </button>
            )}

            {!allRequiredSelected && customizationOptions.length > 0 && (
              <p className="mt-2 text-center text-[11px] text-[#8A483B]">
                Please choose all required options above.
              </p>
            )}
          </div>

          <div className="border-t border-[#E3D4C4] pt-4">
            <Link
              href={canonicalShopRoutes.bulkOrders}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium text-[#7A6448] underline decoration-[#7A6448]/30 underline-offset-4 hover:text-[#5A4630]"
            >
              <Sparkles size={13} />
              <span>Looking for corporate or wedding gifting? Inquire in bulk →</span>
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
