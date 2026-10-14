"use client";

import type { ProductView } from "@/src/lib/product-types";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import ProductDrawer from "./ProductDrawer";
import { useShopState } from "@/src/components/shop/ShopStateProvider";
import {
    DEFAULT_MAX_GIFT_PRODUCTS,
    DEFAULT_MIN_GIFT_PRODUCTS,
    clearStoredGiftItems,
    generateInstanceId,
    getStoredGiftItems,
    setStoredGiftItems,
    type GiftItemSelection,
    type GiftStepKey,
    type ProductSelectionPayload,
} from "../utils";

const GIFT_STORAGE_KEY = "seijaku-bag";
const PACKAGING_BOX_IMAGE = "/images/packging box.png";
const REVIEW_LABEL = "Review";

type StepConfig = {
    key: GiftStepKey;
    label: string;
    shortLabel: string;
    routeSlug: string;
    title: [string, string];
    description: string;
    tagline: string[];
};

type ResolvedGiftItem = GiftItemSelection & {
    product: ProductView | null;
    stepConfig: StepConfig;
};

const STEPS: StepConfig[] = [
    {
        key: "scarves-and-squares",
        label: "Scarves & Squares",
        shortLabel: "Textiles",
        routeSlug: "scarves-and-squares",
        title: ["Choose", "Your Scarf & Square"],
        description:
            "Modal silk scarves and pocket squares crafted with quiet colour stories, soft drape, and hand-rolled finishes.",
        tagline: ["Cloth.", "Colour. A", "quieter gesture."],
    },
    {
        key: "perfumes",
        label: "Perfumes",
        shortLabel: "Perfumes",
        routeSlug: "perfumes",
        title: ["Choose", "Your Scent"],
        description:
            "Natural perfumes and botanical fragrance oils composed for skin, cloth, and quiet contemplation.",
        tagline: ["Scent.", "Memory.", "A slower you."],
    },
    {
        key: "dokra-ornaments",
        label: "Dokra Ornaments",
        shortLabel: "Dokra",
        routeSlug: "dokra-ornaments",
        title: ["Choose", "Your Dokra"],
        description:
            "Handcrafted lost-wax brass brooches from West Bengal — tactile ritual anchors for everyday stillness.",
        tagline: ["Small object.", "Bigger stories."],
    },
    {
        key: "diffusers",
        label: "Diffusers",
        shortLabel: "Diffusers",
        routeSlug: "diffusers",
        title: ["Choose", "Your Diffuser"],
        description:
            "Stone, reed, and brass diffusers with botanical fragrance refills to gently shape your room atmosphere.",
        tagline: ["Vessel.", "Diffusion.", "Still air."],
    },
];

const REVIEW_FEATURES = [
    { icon: "/images/Leaf Icon.png", label: "Artisanal & Ethical" },
    { icon: "/images/Gift Box Icon.png", label: "Festive Gift Packaging" },
    { icon: "/images/India Icon.png", label: "Made in India" },
    { icon: "/images/Heart.png", label: "Gifts with Meaning" },
] as const;

function formatPrice(amount: number) {
    return `₹${amount.toLocaleString("en-IN")}`;
}

function isProductForStep(product: ProductView, stepKey: GiftStepKey): boolean {
    if (product.bridgeCategory === stepKey) {
        return true;
    }

    const typeStr = (product.type || "").toLowerCase();
    const materialStr = (product.material || "").toLowerCase();
    const slugStr = (product.slug || "").toLowerCase();
    const titleStr = (product.title || "").toLowerCase();
    const descStr = (product.shortDescription || "").toLowerCase();
    const allText = `${typeStr} ${materialStr} ${slugStr} ${titleStr} ${descStr}`;

    switch (stepKey) {
        case "scarves-and-squares":
            return (
                typeStr.includes("scarf") ||
                typeStr.includes("square") ||
                slugStr.includes("scarf") ||
                slugStr.includes("square") ||
                slugStr.includes("modal-silk") ||
                materialStr.includes("textile")
            );

        case "perfumes":
            if (
                slugStr.includes("diffuser") ||
                typeStr.includes("diffuser") ||
                typeStr.includes("wax melt")
            ) {
                return false;
            }
            return (
                typeStr.includes("perfume") ||
                typeStr.includes("fragrance") ||
                slugStr.includes("perfume") ||
                slugStr.includes("trilogy") ||
                slugStr.includes("textile-oil") ||
                slugStr.includes("breath-of-pines") ||
                slugStr.includes("summer-held-close") ||
                slugStr.includes("morning-desk") ||
                materialStr.includes("botanical fragrance")
            );

        case "dokra-ornaments":
            return (
                typeStr.includes("dokra") ||
                typeStr.includes("ornament") ||
                materialStr.includes("dokra") ||
                slugStr.includes("dokra") ||
                slugStr.includes("brooch") ||
                slugStr.includes("handfan") ||
                slugStr.includes("bell-brooch") ||
                slugStr.includes("conch-brooch") ||
                allText.includes("dokra")
            );

        case "diffusers":
            return (
                typeStr.includes("diffuser") ||
                typeStr.includes("wax melt") ||
                slugStr.includes("diffuser") ||
                slugStr.includes("wax-melt") ||
                slugStr.includes("vessel") ||
                slugStr.includes("room-stone") ||
                slugStr.includes("stone-oil")
            );
    }
}

function productsForStep(products: ProductView[], step: GiftStepKey): ProductView[] {
    const matches = products.filter((product) => isProductForStep(product, step));
    return matches.length > 0 ? matches : products;
}

function Stepper({
    current,
    countsByStep,
    canAccessReview,
    onGo,
}: {
    current: number;
    countsByStep: Record<GiftStepKey, number>;
    canAccessReview: boolean;
    onGo: (index: number) => void;
}) {
    const stepsWithReview = [
        ...STEPS.map((step, idx) => ({
            label: step.shortLabel,
            fullLabel: step.label,
            isReview: false,
            count: countsByStep[step.key] ?? 0,
            index: idx,
        })),
        {
            label: REVIEW_LABEL,
            fullLabel: REVIEW_LABEL,
            isReview: true,
            count: 0,
            index: STEPS.length,
        },
    ];

    return (
        <ol className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 sm:gap-x-2.5">
            {stepsWithReview.map((item, index) => {
                const active = index === current;
                const hasSelections = !item.isReview && item.count > 0;
                const isClickable = !item.isReview || canAccessReview || current === STEPS.length;

                const content = (
                    <span className="flex items-center gap-1.5">
                        <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full font-sans text-[10px] font-medium transition-all duration-300 ${
                                active
                                    ? "bg-[#2B3B2F] text-[#F6EEE4] ring-4 ring-[#2B3B2F]/15"
                                    : hasSelections
                                        ? "bg-[#4A6350] text-[#F6EEE4]"
                                        : "bg-[#E8DDCD] text-[#8C7A6E]"
                            }`}
                        >
                            {hasSelections ? `${item.count}` : index + 1}
                        </span>
                        <span
                            className={`hidden font-sans text-[10px] tracking-wide sm:inline ${
                                active
                                    ? "font-medium text-[#2A1D1B]"
                                    : isClickable
                                        ? "text-[#54433D]"
                                        : "text-[#8C7A6E]/70"
                            }`}
                        >
                            {item.label}
                            {hasSelections && ` (${item.count})`}
                        </span>
                    </span>
                );

                return (
                    <Fragment key={item.label}>
                        {index > 0 && (
                            <span
                                aria-hidden
                                className={`h-px w-2.5 sm:w-4 ${
                                    index <= current
                                        ? "bg-[#4A6350]"
                                        : "bg-[#D8C8B7]"
                                }`}
                            />
                        )}
                        <li>
                            {isClickable ? (
                                <button
                                    type="button"
                                    onClick={() => onGo(index)}
                                    className={`transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6350] rounded-full ${
                                        active ? "cursor-default" : "cursor-pointer"
                                    }`}
                                    aria-label={`Go to ${item.fullLabel}`}
                                >
                                    {content}
                                </button>
                            ) : (
                                <span className="opacity-55 cursor-not-allowed">
                                    {content}
                                </span>
                            )}
                        </li>
                    </Fragment>
                );
            })}
        </ol>
    );
}

function GiftHeader({
    isReview,
    stepIndex,
    step,
    selectedCount,
    minProducts,
    maxProducts,
}: {
    isReview: boolean;
    stepIndex: number;
    step: StepConfig;
    selectedCount: number;
    minProducts: number;
    maxProducts: number;
}) {
    return (
        <header className="mx-auto mt-2 max-w-3xl text-center sm:mt-6">
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#8C7A6E]">
                {isReview
                    ? `Review & Checkout · ${selectedCount} of max ${maxProducts} Items Chosen`
                    : `Section ${stepIndex + 1} of ${STEPS.length} · ${selectedCount}/${maxProducts} items chosen (min. ${minProducts})`}
            </p>
            <h1 className="mt-4 text-[34px] font-normal leading-[1.05] sm:text-[46px] lg:text-[56px]">
                {isReview ? (
                    <>
                        Your Seijaku{" "}
                        <span className="italic text-[#4A6350]">Gift Box</span>
                    </>
                ) : (
                    <>
                        {step.title[0]}{" "}
                        <span className="italic text-[#4A6350]">
                            {step.title[1]}
                        </span>
                    </>
                )}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-[1.65] text-[#3A2B28] sm:text-[16px]">
                {isReview
                    ? "Carefully composed objects in festive packaging. Update or remove any item before checkout."
                    : step.description}
            </p>
            {!isReview && (
                <p className="mt-6 font-sans text-[11px] uppercase tracking-[0.2em] text-[#8C7A6E]">
                    {step.tagline.join("  ·  ")}
                </p>
            )}
            <div className="mx-auto mt-8 h-px w-16 bg-[#C9B9A6]" />
        </header>
    );
}

function GiftSidebar({
    items,
    currentStepIndex,
    selectedCount,
    minProducts,
    maxProducts,
    total,
    onContinue,
    onGoToStep,
    onRemoveItem,
    onProceedToReview,
}: {
    items: ResolvedGiftItem[];
    currentStepIndex: number;
    selectedCount: number;
    minProducts: number;
    maxProducts: number;
    total: number;
    onContinue: () => void;
    onGoToStep: (index: number) => void;
    onRemoveItem: (instanceId: string) => void;
    onProceedToReview: () => void;
}) {
    const currentStepConfig = STEPS[currentStepIndex];
    const canReview = selectedCount >= minProducts;
    const isFull = selectedCount >= maxProducts;

    return (
        <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-[#E3D4C4] bg-[#FAF4EC] shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E3D4C4] bg-[#EFE3D3] px-4 py-3">
                    <h3 className="text-[16px] font-normal">Your Gift Box</h3>
                    <span
                        className={`font-sans text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            canReview
                                ? "bg-[#4A6350]/15 text-[#2B3B2F]"
                                : "bg-[#8A483B]/10 text-[#8A483B]"
                        }`}
                    >
                        {selectedCount}/{maxProducts} items {isFull ? "(Full)" : `(min. ${minProducts})`}
                    </span>
                </div>

                <div className="space-y-3 px-4 py-4">
                    {items.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-[#E3D4C4] p-4 text-center font-sans text-[12px] text-[#7A6A5E]">
                            <p className="font-medium text-[#4C413A]">Box is empty</p>
                            <p className="mt-1 text-[11px]">
                                Add {minProducts} to {maxProducts} products from any section.
                            </p>
                        </div>
                    ) : (
                        items.map((item) => {
                            if (!item.product) return null;
                            const sectionIndex = STEPS.findIndex(
                                (s) => s.key === item.stepKey,
                            );
                            return (
                                <div
                                    key={item.instanceId}
                                    className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-[#F2E8DC]/60"
                                >
                                    <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#EFE5D8]">
                                        <img
                                            src={item.product.image ?? ""}
                                            alt={item.product.imageAlt ?? item.product.title}
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                    </span>
                                    <div className="min-w-0 flex-1 font-sans">
                                        <p className="truncate text-[12px] font-medium text-[#2A1D1B]">
                                            {item.product.title}
                                        </p>
                                        <p className="truncate text-[10px] text-[#8C7A6E]">
                                            {item.stepConfig.label}
                                            {item.options?.label ? ` · ${item.options.label}` : ""}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2 text-[10px]">
                                            {sectionIndex >= 0 && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => onGoToStep(sectionIndex)}
                                                        className="text-[#4A6350] underline hover:text-[#2B3B2F]"
                                                    >
                                                        View Section
                                                    </button>
                                                    <span className="text-[#C9B9A6]">·</span>
                                                </>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => onRemoveItem(item.instanceId)}
                                                className="text-[#8A483B] underline hover:text-[#64291F]"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    <span className="ml-auto shrink-0 font-sans text-[12px] font-medium text-[#2A1D1B]">
                                        {formatPrice(item.product.price)}
                                    </span>
                                </div>
                            );
                        })
                    )}

                    {!isFull && selectedCount > 0 && (
                        <p className="border-t border-[#E3D4C4]/50 pt-2 text-center font-sans text-[11px] text-[#7A6A5E]">
                            You can add {maxProducts - selectedCount} more product{maxProducts - selectedCount > 1 ? "s" : ""} from any section.
                        </p>
                    )}

                    <dl className="space-y-2 border-t border-[#E3D4C4] pt-3 font-sans text-[12px]">
                        <div className="flex justify-between text-[11px] text-[#6B564E]">
                            <dt>Festive Gift Box & Handwritten Card</dt>
                            <dd className="font-medium text-[#2B3B2F]">Free</dd>
                        </div>
                    </dl>
                </div>

                <div className="border-t border-[#E3D4C4] bg-[#F7EFE5]/50 px-4 py-4">
                    <div className="flex items-center justify-between font-sans text-[13px]">
                        <span>Subtotal</span>
                        <span className="text-[16px] font-medium text-[#2A1D1B]">
                            {formatPrice(total)}
                        </span>
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                        {canReview && (
                            <button
                                type="button"
                                onClick={onProceedToReview}
                                className="flex h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#2B3B2F] font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#F6EEE4] transition-all hover:bg-[#1E2B22] shadow-sm"
                            >
                                <span>Review Gift Box ({selectedCount} items)</span>
                                <span aria-hidden>→</span>
                            </button>
                        )}

                        {currentStepIndex < STEPS.length - 1 && (
                            <button
                                type="button"
                                onClick={onContinue}
                                className={`flex h-[42px] w-full items-center justify-center gap-2 rounded-lg font-sans text-[11px] font-medium uppercase tracking-[0.16em] transition-all ${
                                    canReview
                                        ? "border border-[#4A6350] bg-transparent text-[#2B3B2F] hover:bg-[#4A6350]/10"
                                        : "bg-[#4A6350] text-[#F6EEE4] hover:bg-[#3E5544]"
                                }`}
                            >
                                <span>Next: {STEPS[currentStepIndex + 1].shortLabel} →</span>
                            </button>
                        )}

                        {!canReview && (
                            <p className="text-center font-sans text-[10px] text-[#8A483B]">
                                Add {minProducts - selectedCount} more item{minProducts - selectedCount > 1 ? "s" : ""} to proceed to review
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}

function GiftReview({
    items,
    total,
    selectedCount,
    minProducts,
    maxProducts,
    added,
    isSubmitting,
    onAddToBag,
    onCheckout,
    onRemoveItem,
    onGoToStep,
}: {
    items: ResolvedGiftItem[];
    total: number;
    selectedCount: number;
    minProducts: number;
    maxProducts: number;
    added: boolean;
    isSubmitting: boolean;
    onAddToBag: () => void;
    onCheckout: () => void;
    onRemoveItem: (instanceId: string) => void;
    onGoToStep: (index: number) => void;
}) {
    const validItems = items.filter(
        (item): item is ResolvedGiftItem & { product: ProductView } => item.product !== null,
    );
    const canCheckout = selectedCount >= minProducts && selectedCount <= maxProducts;
    const canAddMore = selectedCount < maxProducts;

    const comboItems = [
        ...validItems.map((item) => ({
            instanceId: item.instanceId,
            image: item.product.image ?? "",
            name: item.product.title,
            sub: item.options?.label || item.stepConfig.label,
            stepIndex: STEPS.findIndex((s) => s.key === item.stepKey),
        })),
        {
            instanceId: "packaging",
            image: PACKAGING_BOX_IMAGE,
            name: "Festive Packaging",
            sub: "Seijaku gift box with a handwritten card",
            stepIndex: -1,
        },
    ];

    return (
        <div className="mx-auto mt-8 grid max-w-[1400px] grid-cols-1 gap-8 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
            <section className="min-w-0">
                {/* Visual Combo Presentation */}
                <div className="rounded-2xl border border-[#E3D4C4] bg-[#FAF4EC] p-5 sm:p-8 shadow-sm">
                    <div className="flex flex-wrap items-start justify-center gap-4 sm:flex-nowrap sm:gap-2">
                        {comboItems.map((item, index) => (
                            <Fragment key={item.instanceId}>
                                {index > 0 && (
                                    <span
                                        aria-hidden
                                        className="hidden shrink-0 self-center text-[22px] text-[#B8A898] sm:block"
                                    >
                                        +
                                    </span>
                                )}
                                <div className="group relative w-full min-w-0 flex-1 basis-[calc(50%-0.5rem)] text-center sm:basis-0">
                                    <span className="relative mx-auto block aspect-square w-full overflow-hidden rounded-lg bg-[#EFE5D8]">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                    </span>
                                    <p className="mt-3 text-[14px] leading-[1.25] text-[#2A1D1B]">
                                        {item.name}
                                    </p>
                                    <p className="mt-1 line-clamp-1 text-[11px] leading-[1.3] text-[#6B564E]">
                                        {item.sub}
                                    </p>
                                    {item.stepIndex >= 0 && (
                                        <div className="mt-2 flex items-center justify-center gap-2 font-sans text-[10px]">
                                            <button
                                                type="button"
                                                onClick={() => onRemoveItem(item.instanceId)}
                                                className="inline-flex items-center gap-1 text-[#8A483B] hover:underline"
                                            >
                                                <Trash2 size={11} />
                                                <span>Remove</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Fragment>
                        ))}
                    </div>
                </div>

                {/* Add more items if under max limit */}
                {canAddMore && (
                    <div className="mt-6 rounded-2xl border border-dashed border-[#D4C3B2] bg-[#F7EEE3]/70 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h4 className="font-serif text-[18px] text-[#2A1D1B]">
                                    Want to add more to your gift box?
                                </h4>
                                <p className="font-sans text-[13px] text-[#6B564E]">
                                    Currently {selectedCount} of {maxProducts} items selected. You can select multiple items from any category.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {STEPS.map((step, idx) => (
                                    <button
                                        key={step.key}
                                        type="button"
                                        onClick={() => onGoToStep(idx)}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-[#4A6350] bg-[#FAF4EC] px-3.5 py-1.5 font-sans text-[11px] font-medium text-[#2B3B2F] hover:bg-[#4A6350] hover:text-[#F6EEE4] transition-colors"
                                    >
                                        <Plus size={12} />
                                        <span>Add from {step.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Brand features */}
                <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {REVIEW_FEATURES.map((feature) => (
                        <li
                            key={feature.label}
                            className="flex flex-col items-center gap-2 text-center"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0E6D6]">
                                <img
                                    src={feature.icon}
                                    alt=""
                                    className="h-5 w-5 object-contain"
                                />
                            </span>
                            <span className="text-[12px] leading-[1.3] text-[#3A2B28]">
                                {feature.label}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Order Summary & Actions */}
            <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
                <div className="overflow-hidden rounded-2xl border border-[#E3D4C4] bg-[#FAF4EC] shadow-sm">
                    <h3 className="border-b border-[#E3D4C4] px-5 py-4 text-[17px] font-normal">
                        Order Summary
                    </h3>
                    <dl className="space-y-3.5 px-5 py-5 font-sans text-[12px]">
                        {validItems.map((item) => (
                            <div
                                key={item.instanceId}
                                className="flex items-start justify-between gap-3 border-b border-[#E3D4C4]/50 pb-3 last:border-b-0 last:pb-0"
                            >
                                <img
                                    src={item.product.image ?? ""}
                                    alt={item.product.imageAlt ?? item.product.title}
                                    className="h-12 w-12 shrink-0 rounded-md object-cover bg-[#EFE5D8]"
                                />
                                <div className="min-w-0 flex-1">
                                    <dt className="truncate font-medium text-[#2A1D1B]">
                                        {item.product.title}
                                    </dt>
                                    <dd className="text-[10px] text-[#8C7A6E]">
                                        {item.stepConfig.label}
                                    </dd>
                                    {item.options?.label ? (
                                        <dd className="mt-0.5 truncate text-[11px] font-medium text-[#4A6350]">
                                            {item.options.label}
                                        </dd>
                                    ) : null}
                                    <div className="mt-1 flex items-center gap-2 text-[10px]">
                                        <button
                                            type="button"
                                            onClick={() => onRemoveItem(item.instanceId)}
                                            className="text-[#8A483B] underline hover:text-[#64291F]"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <dd className="shrink-0 font-medium">
                                    {formatPrice(item.product.price)}
                                </dd>
                            </div>
                        ))}

                        <div className="flex justify-between gap-3 border-t border-[#E3D4C4] pt-3">
                            <dt className="text-[#4C413A]">
                                Festive Box & Handwritten Note
                            </dt>
                            <dd className="font-medium text-[#2B3B2F]">Free</dd>
                        </div>
                    </dl>

                    <div className="flex items-center justify-between border-t border-[#E3D4C4] px-5 py-4 font-sans text-[13px]">
                        <span>Subtotal</span>
                        <span className="text-[18px] font-medium text-[#2A1D1B]">
                            {formatPrice(total)}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2.5 px-5 pb-5">
                        {!canCheckout && (
                            <div className="rounded-lg border border-[#8A483B]/30 bg-[#8A483B]/10 p-3 text-center font-sans text-[11px] text-[#64291F]">
                                <p className="font-medium">
                                    {selectedCount < minProducts
                                        ? `Minimum ${minProducts} items required`
                                        : `Maximum ${maxProducts} items allowed`}
                                </p>
                                <p className="mt-0.5 text-[10px] text-[#7A3F33]">
                                    Currently {selectedCount} selected.
                                    {selectedCount < minProducts &&
                                        ` Please add at least ${minProducts - selectedCount} more item.`}
                                </p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={onCheckout}
                            disabled={!canCheckout || isSubmitting}
                            className="flex h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#2B3B2F] font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-[#F6EEE4] transition-all hover:bg-[#1F2C23] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span>
                                {isSubmitting ? "Processing..." : "Proceed to Checkout"}
                            </span>
                            <span aria-hidden>→</span>
                        </button>

                        <button
                            type="button"
                            onClick={onAddToBag}
                            disabled={!canCheckout || isSubmitting || added}
                            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#2B3B2F] bg-transparent font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-[#2B3B2F] transition-all hover:bg-[#2B3B2F]/5 disabled:cursor-default disabled:opacity-50"
                        >
                            {added ? "Added to bag ✓" : "Add to bag"}
                        </button>

                        <p className="mt-2 text-center font-sans text-[10px] text-[#6B564E]">
                            Free delivery across India · Usually ships in 3 to 5 working days
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
}

export default function BuildGiftClient({
    products,
    minProducts = DEFAULT_MIN_GIFT_PRODUCTS,
    maxProducts = DEFAULT_MAX_GIFT_PRODUCTS,
}: {
    products: ProductView[];
    minProducts?: number;
    maxProducts?: number;
}) {
    const router = useRouter();
    const { addToCart, openCart } = useShopState();

    const [stepIndex, setStepIndex] = useState(0);
    const [giftItems, setGiftItems] = useState<GiftItemSelection[]>([]);
    const [savedLoaded, setSavedLoaded] = useState(false);
    const [added, setAdded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isReview = stepIndex === STEPS.length;
    const step = STEPS[Math.min(stepIndex, STEPS.length - 1)];

    const productsById = useMemo(
        () => new Map(products.map((product) => [product.id, product])),
        [products],
    );

    /*
     * Hydrate saved selections once from storage.
     */
    useEffect(() => {
        if (savedLoaded || products.length === 0) return;

        const stored = getStoredGiftItems();
        // Discard any items with unknown product IDs
        const valid = stored.filter((item) => productsById.has(item.productId));

        setGiftItems(valid);
        if (valid.length >= minProducts && valid.length >= maxProducts) {
            setStepIndex(STEPS.length); // Open directly on Review if full
        }
        setSavedLoaded(true);
    }, [products, productsById, savedLoaded, minProducts, maxProducts]);

    /*
     * Keep storage in sync with active gift items.
     */
    useEffect(() => {
        if (!savedLoaded) return;
        setStoredGiftItems(giftItems);
    }, [savedLoaded, giftItems]);

    const selectedCount = giftItems.length;
    const canAddMore = selectedCount < maxProducts;
    const canAccessReview = selectedCount >= minProducts;

    const countsByStep = useMemo(() => {
        const counts: Record<GiftStepKey, number> = {
            "scarves-and-squares": 0,
            perfumes: 0,
            "dokra-ornaments": 0,
            diffusers: 0,
        };
        for (const item of giftItems) {
            if (counts[item.stepKey] !== undefined) {
                counts[item.stepKey]++;
            }
        }
        return counts;
    }, [giftItems]);

    const countsByProductId = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const item of giftItems) {
            counts[item.productId] = (counts[item.productId] ?? 0) + 1;
        }
        return counts;
    }, [giftItems]);

    const resolvedGiftItems: ResolvedGiftItem[] = useMemo(() => {
        return giftItems.map((item) => {
            const product = productsById.get(item.productId) ?? null;
            const stepConfig =
                STEPS.find((s) => s.key === item.stepKey) ?? STEPS[0];
            return {
                ...item,
                product,
                stepConfig,
            };
        });
    }, [giftItems, productsById]);

    const total = useMemo(() => {
        return resolvedGiftItems.reduce(
            (sum, item) => sum + (item.product?.price ?? 0),
            0,
        );
    }, [resolvedGiftItems]);

    const visibleProducts = productsForStep(products, step.key);

    function addProduct(
        product: ProductView,
        selection?: ProductSelectionPayload,
    ) {
        if (giftItems.length >= maxProducts) return;

        const newItem: GiftItemSelection = {
            instanceId: generateInstanceId(),
            productId: product.id,
            stepKey: step.key,
            options: selection ?? null,
        };

        setGiftItems((prev) => [...prev, newItem]);
        setAdded(false);
    }

    function removeProductOne(product: ProductView) {
        // Remove the most recently added instance of this product
        setGiftItems((prev) => {
            const lastIndex = prev
                .map((item) => item.productId)
                .lastIndexOf(product.id);
            if (lastIndex === -1) return prev;
            const next = [...prev];
            next.splice(lastIndex, 1);
            return next;
        });
        setAdded(false);
    }

    function removeItemByInstanceId(instanceId: string) {
        setGiftItems((prev) => prev.filter((i) => i.instanceId !== instanceId));
        setAdded(false);
    }

    function goTo(index: number) {
        if (index < 0 || index > STEPS.length) return;
        setStepIndex(index);
        setAdded(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function continueToNextStep() {
        if (stepIndex < STEPS.length - 1) {
            goTo(stepIndex + 1);
        } else if (canAccessReview) {
            goTo(STEPS.length);
        }
    }

    async function persistAndAddGiftItems() {
        const validItems = resolvedGiftItems.filter(
            (item): item is ResolvedGiftItem & { product: ProductView } => item.product !== null,
        );

        if (validItems.length < minProducts) {
            throw new Error(`Minimum ${minProducts} products required for a gift.`);
        }

        const items = validItems.map(({ stepConfig, product, options }) => ({
            type: stepConfig.key,
            id: product.id,
            slug: product.slug,
            name: product.title,
            price: product.price,
            variantLabel: options?.label,
            selectedOptions: options?.options,
        }));

        try {
            localStorage.setItem(
                GIFT_STORAGE_KEY,
                JSON.stringify({ items, packaging: "festive", total }),
            );
        } catch {
            // Optional local cache
        }

        // Add each chosen gift object to the cart with its selected options
        for (const item of validItems) {
            addToCart(
                {
                    productSlug: item.product.slug,
                    title: item.product.title,
                    unitPrice: item.product.price,
                    priceLabel: item.product.priceLabel,
                    quantity: 1,
                    image: item.product.image,
                    shortDescription: item.product.shortDescription,
                    variantLabel: item.options?.label || null,
                    selectedOptions: item.options?.options || null,
                },
                { openDrawer: false },
            );
        }

        clearStoredGiftItems();
    }

    async function addToBag() {
        if (!canAccessReview) return;
        setIsSubmitting(true);
        try {
            await persistAndAddGiftItems();
            setAdded(true);
            openCart();
        } catch (error) {
            console.error("Unable to save gift bundle.", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function proceedToCheckout() {
        if (!canAccessReview) return;
        setIsSubmitting(true);
        try {
            await persistAndAddGiftItems();
            router.push("/checkout");
        } catch (error) {
            console.error("Failed to proceed to checkout.", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main
            className="min-h-screen w-full bg-[#F7EFE5] px-4 pb-16 pt-24 text-[#2A1D1B] sm:px-6 sm:pt-28 lg:px-10 lg:pt-28 mt-8"
            style={{
                fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
            }}
        >
            <Stepper
                current={stepIndex}
                countsByStep={countsByStep}
                canAccessReview={canAccessReview}
                onGo={goTo}
            />

            <GiftHeader
                isReview={isReview}
                stepIndex={stepIndex}
                step={step}
                selectedCount={selectedCount}
                minProducts={minProducts}
                maxProducts={maxProducts}
            />

            {isReview ? (
                <GiftReview
                    items={resolvedGiftItems}
                    total={total}
                    selectedCount={selectedCount}
                    minProducts={minProducts}
                    maxProducts={maxProducts}
                    added={added}
                    isSubmitting={isSubmitting}
                    onAddToBag={addToBag}
                    onCheckout={proceedToCheckout}
                    onRemoveItem={removeItemByInstanceId}
                    onGoToStep={goTo}
                />
            ) : (
                <div className="mx-auto mt-8 grid max-w-[1640px] grid-cols-1 gap-8 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 xl:gap-10">
                    <section className="min-w-0">
                        <ProductDrawer
                            key={step.key}
                            products={visibleProducts}
                            selectedCountsByProductId={countsByProductId}
                            canAddMore={canAddMore}
                            onAddProduct={addProduct}
                            onRemoveProduct={removeProductOne}
                        />
                    </section>

                    <GiftSidebar
                        items={resolvedGiftItems}
                        currentStepIndex={stepIndex}
                        selectedCount={selectedCount}
                        minProducts={minProducts}
                        maxProducts={maxProducts}
                        total={total}
                        onContinue={continueToNextStep}
                        onGoToStep={goTo}
                        onRemoveItem={removeItemByInstanceId}
                        onProceedToReview={() => goTo(STEPS.length)}
                    />
                </div>
            )}
        </main>
    );
}