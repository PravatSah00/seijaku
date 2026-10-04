"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles } from "lucide-react";

import { getShopProductUseCase, hasVariantSelector, type ProductView } from "@/src/lib/product-types";
import { canonicalShopRoutes } from "@/src/lib/shop-routes";

import ShopProductActions from "./ShopProductActions";

type ProductDetailDrawerProps = {
  item: ProductView | null;
  isOpen: boolean;
  onClose: () => void;
};

const ENRICHMENT_TIMEOUT_MS = 8_000;

export default function ProductDetailDrawer({ item, isOpen, onClose }: ProductDetailDrawerProps) {
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
  const allRequiredSelected = customizationOptions
    .filter((option) => option.required)
    .every((option) => Boolean(selectedOptions[option.label]));
  const selectionLabel = Object.values(selectedOptions).filter(Boolean).join(" · ");
  // Prefer a hand-maintained videoUrl from the registry (so editors can
  // override), fall back to whatever the backend currently has attached.
  const resolvedVideoUrl = item?.videoUrl || enrichedVideoUrl || null;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset variant choices whenever the drawer closes OR the product changes
  // — reopening a drawer should always start from a clean selection.
  useEffect(() => {
    setShowFullDesc(false);
    if (!isOpen) {
      setSelectedOptions({});
      setActiveMedia(null);
    }
  }, [isOpen, item?.slug]);

  // Lazy video enrichment: when the drawer opens for a product, fetch the
  // matching backend record and pick up any VIDEO-kind media attached there.
  // Hand-maintained `item.videoUrl` wins when present; otherwise we fall back
  // to whatever the backend has.
  //
  // Contract: single attempt, 8s abort, silent fallback to image-only on any
  // failure. Hand-maintained `item.videoUrl` still wins — see resolvedVideoUrl.
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

        // Guard against stale responses if the user switched products mid-fetch.
        if (videoAsset?.asset?.url && slugAtFetch === item.slug) {
          setEnrichedVideoUrl(videoAsset.asset.url);
        }
      } catch (error) {
        if ((error as Error)?.name === "AbortError") {
          return;
        }
        console.warn("[drawer] video enrichment failed", error);
      }
    })();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
      setEnrichedVideoUrl(null);
    };
  }, [isOpen, item?.slug]);

  const hasLongDesc = Boolean(item?.longDescription);
  const hasShortDesc = Boolean(item?.shortDescription);
  const isDescriptionTruncated = hasLongDesc && !hasShortDesc && (item?.longDescription?.length ?? 0) > 200;
  const canToggleDescription = hasLongDesc && (hasShortDesc || isDescriptionTruncated);

  let displayedDescription = "Detailed product notes will appear here as the catalog evolves.";
  if (item) {
    if (showFullDesc) {
      displayedDescription = item.longDescription ?? item.shortDescription ?? displayedDescription;
    } else {
      if (item.shortDescription) {
        displayedDescription = item.shortDescription;
      } else if (isDescriptionTruncated && item.longDescription) {
        displayedDescription = `${item.longDescription.slice(0, 200).trim()}...`;
      } else {
        displayedDescription = item.longDescription ?? displayedDescription;
      }
    }
  }

  if (!item) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <button type="button" aria-label="Close details" className="absolute inset-0 bg-[rgba(21,18,15,0.36)]" onClick={onClose} />

      <aside className={`absolute inset-x-0 bottom-0 top-auto h-[88vh] w-full overflow-y-auto rounded-t-[28px] bg-[#f6f1e8] shadow-[0_-18px_40px_rgba(27,23,19,0.14)] transition-transform duration-300 md:inset-y-0 md:left-auto md:right-0 md:top-0 md:h-full md:max-w-[720px] md:rounded-none md:shadow-[-20px_0_45px_rgba(27,23,19,0.16)] ${isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full md:translate-y-0"}`}>
        <div className="flex items-center justify-between border-b border-black/6 px-5 py-4 sm:px-7">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f7a65]">{item.material ?? "Seijaku Object"}</p>
            <p className="mt-2 font-serif text-[24px] leading-[1.1] tracking-[-0.02em] text-[#1f1a16]">{item.title}</p>
          </div>
          <button type="button" onClick={onClose} className="text-[11px] uppercase tracking-[0.18em] text-[#5b5247]">
            Close
          </button>
        </div>

        <div className="p-5 sm:p-7">
          <div className="relative aspect-[4/4.3] overflow-hidden rounded-[26px] bg-[#ddd1c1]">
            {resolvedVideoUrl ? (
              <video className="h-full w-full object-cover" controls playsInline poster={activeImage}>
                <source src={resolvedVideoUrl} />
              </video>
            ) : activeImage ? (
              <Image src={activeImage} alt={item.imageAlt ?? item.title} fill sizes="(min-width: 768px) 48vw, 100vw" className="object-cover" />
            ) : null}
          </div>

          {gallery.length > 1 ? (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {gallery.map((image, index) => (
                <button
                  key={`${item.slug}-${image}`}
                  type="button"
                  onClick={() => setActiveMedia(index)}
                  className={`relative aspect-[4/3] overflow-hidden rounded-[18px] border ${activeIndex === index ? "border-[#2e4a36]" : "border-[#d8cec1]"}`}
                >
                  <Image src={image} alt={item.imageAlt ? `${item.imageAlt} View ${index + 1}` : `${item.title} view ${index + 1}`} fill sizes="30vw" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-8 grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-start">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f7a65]">Type</p>
              <p className="mt-2 text-[14px] leading-[1.8] text-[#5f5850]">{item.type}</p>
              <p className="mt-5 text-[10px] uppercase tracking-[0.22em] text-[#8f7a65]">Material</p>
              <p className="mt-2 text-[14px] leading-[1.8] text-[#5f5850]">{item.material ?? "Not specified"}</p>
              {useCase ? (
                <>
                  <p className="mt-5 text-[10px] uppercase tracking-[0.22em] text-[#8f7a65]">Use Case</p>
                  <p className="mt-2 text-[14px] leading-[1.8] text-[#5f5850]">{useCase}</p>
                </>
              ) : null}
              <p className="mt-5 text-[10px] uppercase tracking-[0.22em] text-[#8f7a65]">Price</p>
              <p className="mt-2 text-[18px] text-[#2f2924]">{item.priceLabel}</p>
              {item.status ? (
                <>
                  <p className="mt-5 text-[10px] uppercase tracking-[0.22em] text-[#8f7a65]">Status</p>
                  <p className="mt-2 text-[14px] leading-[1.8] text-[#5f5850]">{item.status}</p>
                </>
              ) : null}
            </div>

            <div>
              <div className="text-[15px] leading-[1.85] text-[#5f5850] [&_p]:mt-3 [&_p]:first:mt-0 [&_h3]:mt-6 [&_h3]:font-serif [&_h3]:text-[18px] [&_h3]:leading-[1.3] [&_h3]:text-[#1c1c1c] [&_h3]:first:mt-0 [&_ul]:mt-3 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:marker:text-[#8f7a65] [&_ol]:mt-3 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:marker:text-[#8f7a65] [&_li]:mt-1 [&_a]:text-[#2e4a36] [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-[#243c2c] [&_strong]:font-semibold [&_strong]:text-[#1c1c1c] [&_em]:italic">
                <ReactMarkdown>{displayedDescription}</ReactMarkdown>
              </div>
              {canToggleDescription ? (
                <button
                  type="button"
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8f7a65] hover:text-[#564c40] transition-colors"
                >
                  {showFullDesc ? "See less" : "See more"}
                </button>
              ) : null}

              {customizationOptions.length > 0 ? (
                <div className="mt-7 space-y-4">
                  {customizationOptions.map((option) => {
                    const selectId = `${item.slug}-${option.label.replace(/\s+/g, "-").toLowerCase()}`;
                    const selected = selectedOptions[option.label] ?? "";
                    return (
                      <div key={option.label}>
                        <label
                          htmlFor={selectId}
                          className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-[#837260]"
                        >
                          {option.label}
                          {option.required ? <span className="ml-1 text-[#9a785d]" aria-hidden>*</span> : null}
                        </label>
                        <select
                          id={selectId}
                          value={selected}
                          onChange={(event) =>
                            setSelectedOptions((current) => ({
                              ...current,
                              [option.label]: event.target.value,
                            }))
                          }
                          className="w-full rounded-[16px] border border-[rgba(86,76,64,0.14)] bg-[#fbf8f3] px-4 py-3 text-[14px] text-[#3f3831] outline-none transition-colors focus:border-[#2e4a36] focus:ring-2 focus:ring-[#2e4a36]/15"
                        >
                          <option value="">Select an option</option>
                          {option.values.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-8">
                <ShopProductActions
                  item={item}
                  onViewDetails={onClose}
                  isBuyDisabled={!allRequiredSelected}
                  selection={{
                    label: selectionLabel || null,
                    options: customizationOptions.length > 0 ? selectedOptions : null,
                  }}
                />
              </div>

              <div className="mt-6 border-t border-[#d8cec1]/60 pt-4">
                <Link
                  href={canonicalShopRoutes.bulkOrders}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#7a6448] underline decoration-[#7a6448]/30 underline-offset-4 transition hover:text-[#5a4630]"
                >
                  <Sparkles size={13} />
                  <span>Planning for an event or corporate gifting? Inquire in bulk →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

