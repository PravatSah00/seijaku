"use client";

import type { ProductView } from "@/src/lib/product-types";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Plus, Trash2 } from "lucide-react";
import ProductDrawer from "./ProductDrawer";
import { useShopState, isGiftCartItem } from "@/src/components/shop/ShopStateProvider";
import {
    clearStoredGiftItems,
    clearGiftCheckoutBundle,
    generateInstanceId,
    getGiftCheckoutBundle,
    getStoredGiftItems,
    setStoredGiftItems,
    setGiftCheckoutBundle,
    type GiftCheckoutBundle,
    type GiftCheckoutItem,
    type GiftItemSelection,
    type GiftStepKey,
    type ProductSelectionPayload,
} from "../utils";
import {
    DEFAULT_GIFT_PRESETS,
    isProductForCategory,
    type GiftCategoryKey,
    type GiftPreset,
    type GiftPresetStep,
} from "@/src/lib/gift-presets";

const PACKAGING_BOX_IMAGE = "/images/packging box.png";

type ResolvedGiftItem = GiftItemSelection & {
    product: ProductView | null;
    stepConfig: GiftPresetStep;
};

const REVIEW_FEATURES = [
    { icon: "/images/Leaf Icon.png", label: "Artisanal & Ethical" },
    { icon: "/images/Gift Box Icon.png", label: "Festive Gift Packaging" },
    { icon: "/images/India Icon.png", label: "Made in India" },
    { icon: "/images/Heart.png", label: "Gifts with Meaning" },
] as const;

function formatPrice(amount: number) {
    return `₹${amount.toLocaleString("en-IN")}`;
}

function productsForStep(products: ProductView[], stepKey: GiftCategoryKey): ProductView[] {
    // 1. Curated products specifically enabled by admin for this section
    const curated = products.filter(
        (product) => product.buildGift?.enabled && product.buildGift.section === stepKey,
    );
    if (curated.length > 0) {
        return curated;
    }
    // 2. Fallback to smart categorization across published products
    return products.filter((product) => isProductForCategory(product, stepKey));
}

function PresetSwitcher({
    presets,
    activePresetId,
    onSelect,
}: {
    presets: GiftPreset[];
    activePresetId: string;
    onSelect: (preset: GiftPreset) => void;
}) {
    return (
        <section aria-label="Curated Gift Rituals" className="mt-3 sm:mt-4 rounded-xl border border-[#E7DCCD] bg-[#FAF5EC] p-3 sm:p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-[#E7DCCD]/60 pb-2.5 mb-3">
                <div>
                    <span className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-[#8C7A6E]">
                        Choose Your Gift Ritual
                    </span>
                    <h2 className="text-[16px] sm:text-[18px] font-normal text-[#2A1D1B]">
                        Three ways to gift. Endless ways to make it personal.
                    </h2>
                </div>
                <span className="font-sans text-[11px] text-[#6E5A4E] shrink-0">
                    Curated Seijaku Rituals
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {presets.map((preset) => {
                    const isActive = preset.id === activePresetId;
                    return (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => onSelect(preset)}
                            className={`group flex flex-col items-start p-3 text-left rounded-lg border transition-all cursor-pointer ${
                                isActive
                                    ? "border-[#2B3B2F] bg-[#2B3B2F] text-[#FAF5EC] shadow-sm"
                                    : "border-[#E3D4C4] bg-[#FBF8F2] hover:bg-[#F2E8DC]/80 hover:border-[#C9B9A6] text-[#2A1D1B]"
                            }`}
                        >
                            <span className="flex items-center justify-between w-full">
                                <span className={`text-[15px] font-normal font-serif ${isActive ? "text-[#FAF5EC]" : "text-[#2A1D1B]"}`}>
                                    {preset.title}
                                </span>
                                {isActive && (
                                    <span className="h-2 w-2 rounded-full bg-[#E5D7C2]" />
                                )}
                            </span>
                            <span className={`text-[11px] font-sans mt-0.5 line-clamp-1 ${isActive ? "text-[#D8C7B5]" : "text-[#7A6A5E]"}`}>
                                {preset.subtitle}
                            </span>
                            <span className={`text-[10px] font-sans mt-2 pt-1.5 border-t w-full flex flex-wrap gap-1 ${
                                isActive ? "border-[#FAF5EC]/20 text-[#E5D7C2]" : "border-[#E7DCCD] text-[#6E5A4E]"
                            }`}>
                                {preset.steps.map((st, i) => (
                                    <span key={st.key}>
                                        {st.requiredCount > 1 ? `${st.requiredCount}× ` : ""}{st.shortLabel}
                                        {i < preset.steps.length - 1 ? " · " : ""}
                                    </span>
                                ))}
                                {preset.hasPackaging && (
                                    <span>· {preset.packagingLabel || "Gift Packaging"}</span>
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function Stepper({
    current,
    steps,
    countsByStep,
    onGo,
}: {
    current: number;
    steps: GiftPresetStep[];
    countsByStep: Record<string, number>;
    onGo: (index: number) => void;
}) {
    return (
        <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:gap-x-3">
            {steps.map((item, index) => {
                const active = index === current;
                const count = countsByStep[item.key] ?? 0;
                const req = item.requiredCount ?? 1;
                const isComplete = count >= req;
                const content = (
                    <span className="flex items-center gap-1.5">
                        <span
                            className={`flex h-7 min-w-7 px-1.5 items-center justify-center rounded-full font-sans text-[10px] font-medium transition-all duration-300 ${
                                active
                                    ? "bg-[#2B3B2F] text-[#F6EEE4] ring-4 ring-[#2B3B2F]/15"
                                    : isComplete
                                        ? "bg-[#4A6350] text-[#F6EEE4]"
                                        : count > 0
                                            ? "bg-[#7D6B5D] text-[#F6EEE4]"
                                            : "bg-[#E8DDCD] text-[#8C7A6E]"
                            }`}
                        >
                            {isComplete ? (
                                <span className="inline-flex items-center gap-0.5">
                                    <Check size={11} strokeWidth={2.5} />
                                </span>
                            ) : count > 0 ? (
                                `${count}/${req}`
                            ) : (
                                index + 1
                            )}
                        </span>
                        <span
                            className={`hidden font-sans text-[10px] tracking-wide sm:inline ${
                                active
                                    ? "font-medium text-[#2A1D1B]"
                                    : "text-[#54433D]"
                            }`}
                        >
                            {item.shortLabel}
                            {req > 1 ? ` (${count}/${req})` : count > 0 ? ` (${count})` : ""}
                        </span>
                    </span>
                );
                return (
                    <Fragment key={item.key}>
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
                            <button
                                type="button"
                                onClick={() => onGo(index)}
                                className={`transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6350] rounded-full ${
                                    active ? "cursor-default" : "cursor-pointer"
                                }`}
                                aria-label={`Go to ${item.label}`}
                            >
                                {content}
                            </button>
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
    totalSteps,
    activePresetTitle,
    selectedCount,
    stepCount,
    maxProducts,
}: {
    isReview: boolean;
    stepIndex: number;
    step: GiftPresetStep;
    totalSteps: number;
    activePresetTitle: string;
    selectedCount: number;
    stepCount: number;
    minProducts: number;
    maxProducts: number;
}) {
    const stepReq = step?.requiredCount ?? 1;
    return (
        <header className={isReview
            ? "mx-auto mt-8 max-w-3xl text-center sm:mt-12"
            : "min-w-0 text-left xl:border-r xl:border-[#E7DDD1] xl:pr-5 2xl:pr-7"}
        >
            <p className="font-sans text-[11px] font-medium tracking-[0.06em] text-[#917A67]">
                {isReview
                    ? `Review & Checkout · ${selectedCount} of ${maxProducts} Items Chosen`
                    : `Section ${stepIndex + 1} of ${totalSteps} · ${activePresetTitle}`}
            </p>
            <h1 className={isReview
                ? "mt-4 text-[34px] font-normal leading-[1.05] sm:text-[46px] lg:text-[56px]"
                : "mt-3 max-w-[14ch] text-[34px] font-normal leading-[1.05] text-[#51392F] sm:text-[42px] xl:text-[36px] 2xl:text-[46px]"}
            >
                {isReview ? (
                    <>
                        Your Seijaku{" "}
                        <span className="italic text-[#4A6350]">Gift Box</span>
                    </>
                ) : (
                    <>
                        {step?.title[0]}{" "}
                        <span className="italic text-[#4A6350]">{step?.title[1]}</span>
                    </>
                )}
            </h1>
            {!isReview && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#EFE6D8] px-2.5 py-0.5 font-sans text-[11px] text-[#554339]">
                    <span>Requirement:</span>
                    <strong className="font-medium text-[#2B3B2F]">
                        {stepCount >= stepReq ? `${stepCount}/${stepReq} selected ✓` : `Select ${stepReq - stepCount} more`}
                    </strong>
                </div>
            )}
            <p className={isReview
                ? "mx-auto mt-5 max-w-xl text-[15px] leading-[1.65] text-[#3A2B28] sm:text-[16px]"
                : "mt-4 max-w-[35ch] text-[14px] leading-[1.6] text-[#594A42]"}
            >
                {isReview
                    ? "Carefully composed objects in festive packaging. Update or remove any item before checkout."
                    : step?.description}
            </p>
            {!isReview && step?.tagline && (
                <div className="mt-7 flex items-center gap-3 xl:mt-10 xl:block">
                    <svg aria-hidden="true" className="h-12 w-12 shrink-0 text-[#AA9179] xl:h-16 xl:w-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
                        <path d="M31 59V15M31 45C18 44 13 33 13 25c11 1 18 8 18 20ZM31 35c12-1 20-9 20-19-11 1-20 9-20 19ZM31 24C22 22 20 16 20 10c7 1 11 6 11 14ZM31 52c8-2 15-7 18-15-10 1-16 5-18 15Z" />
                        <path d="M24 56c-6-3-12-9-13-16M37 57c7-4 12-11 14-16" />
                    </svg>
                    <p className="max-w-[22ch] font-sans text-[10px] font-medium uppercase leading-[1.75] tracking-[0.17em] text-[#897768] xl:mt-5">
                        {step.tagline.join("  ·  ")}
                    </p>
                </div>
            )}
            {isReview && <div className="mx-auto mt-8 h-px w-16 bg-[#C9B9A6]" />}
        </header>
    );
}

function GiftSidebar({
    items,
    steps,
    currentStepIndex,
    countsByStep,
    selectedCount,
    minProducts,
    maxProducts,
    total,
    isSubmitting,
    packagingLabel,
    canCheckout,
    onContinue,
    onGoToStep,
    onRemoveItem,
    onCheckout,
}: {
    items: ResolvedGiftItem[];
    steps: GiftPresetStep[];
    currentStepIndex: number;
    countsByStep: Record<string, number>;
    selectedCount: number;
    minProducts: number;
    maxProducts: number;
    total: number;
    isSubmitting: boolean;
    packagingLabel?: string;
    canCheckout: boolean;
    onContinue: () => void;
    onGoToStep: (index: number) => void;
    onRemoveItem: (instanceId: string, fallbackProductId?: string) => void;
    onCheckout: () => void;
}) {
    const isFull = selectedCount >= maxProducts;
    const missingSteps = steps
        .filter((s) => (countsByStep[s.key] ?? 0) < s.requiredCount)
        .map((s) => {
            const diff = s.requiredCount - (countsByStep[s.key] ?? 0);
            return `${diff} ${s.shortLabel}`;
        });

    return (
        <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-24 xl:self-start">
            <div className="overflow-hidden rounded-sm border border-[#E9DED1] bg-[#FBF8F2] shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E8DCCE] bg-[#F0E9DF] px-4 py-3">
                    <h3 className="text-[18px] font-normal">Your Gift Box</h3>
                    <span
                        className={`font-sans text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            canCheckout
                                ? "bg-[#4A6350]/15 text-[#2B3B2F]"
                                : "bg-[#8A483B]/10 text-[#8A483B]"
                        }`}
                    >
                        {selectedCount}/{maxProducts} items {isFull ? "(Ready)" : `(min. ${minProducts})`}
                    </span>
                </div>

                <div className="space-y-3 px-4 py-4">
                    {/* Step Requirements Checklist */}
                    <div className="rounded-md border border-[#E7DCCD] bg-[#FAF5EC]/80 p-2.5 space-y-1.5 font-sans text-[11px]">
                        <p className="font-medium text-[#4C413A] text-[10px] uppercase tracking-wider">
                            Box Composition
                        </p>
                        {steps.map((s, idx) => {
                            const count = countsByStep[s.key] ?? 0;
                            const met = count >= s.requiredCount;
                            return (
                                <button
                                    key={s.key}
                                    type="button"
                                    onClick={() => onGoToStep(idx)}
                                    className={`flex w-full items-center justify-between cursor-pointer rounded px-2 py-1 text-left transition-colors ${
                                        idx === currentStepIndex
                                            ? "bg-[#EFE5D8] font-medium"
                                            : "hover:bg-[#F2E8DC]"
                                    }`}
                                >
                                    <span className="flex items-center gap-1.5 text-[#54433D]">
                                        <span className={`h-1.5 w-1.5 rounded-full ${met ? "bg-[#4A6350]" : "bg-[#B8A898]"}`} />
                                        {s.requiredCount > 1 ? `${s.requiredCount}× ` : ""}{s.label}
                                    </span>
                                    <span className={`text-[10px] font-medium ${met ? "text-[#4A6350]" : "text-[#8C7A6E]"}`}>
                                        {met ? "Added ✓" : `${count}/${s.requiredCount}`}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected items list */}
                    {items.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-[#E3D4C4] p-4 text-center font-sans text-[12px] text-[#7A6A5E]">
                            <p className="font-medium text-[#4C413A]">Box is empty</p>
                            <p className="mt-1 text-[11px]">
                                Add {minProducts} products following the steps above to complete this ritual.
                            </p>
                        </div>
                    ) : (
                        items.map((item) => {
                            if (!item.product) return null;
                            const sectionIndex = steps.findIndex(
                                (s) => s.key === item.stepKey,
                            );
                            return (
                                <div
                                    key={item.instanceId}
                                    className="group flex items-start gap-3 border-b border-[#EBE1D6] p-2 last:border-b-0 transition-colors hover:bg-[#F2E8DC]/60"
                                >
                                    <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-[#EFE5D8]">
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
                                                        View Step
                                                    </button>
                                                    <span className="text-[#C9B9A6]">·</span>
                                                </>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => onRemoveItem(item.instanceId, item.productId)}
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

                    <dl className="space-y-2 border-t border-[#E3D4C4] pt-3 font-sans text-[12px]">
                        <div className="flex justify-between text-[11px] text-[#6B564E]">
                            <dt>{packagingLabel || "Festive Gift Box & Handwritten Card"}</dt>
                            <dd className="font-medium text-[#2B3B2F]">Included</dd>
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
                        {canCheckout ? (
                            <button
                                type="button"
                                onClick={onCheckout}
                                disabled={isSubmitting}
                                className="flex h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#2B3B2F] font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#F6EEE4] transition-all hover:bg-[#1E2B22] shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span>
                                    {isSubmitting ? "Processing..." : "Proceed to Checkout"}
                                </span>
                                <span aria-hidden>→</span>
                            </button>
                        ) : null}

                        {currentStepIndex < steps.length - 1 && (
                            <button
                                type="button"
                                onClick={onContinue}
                                className={`flex h-[42px] w-full items-center justify-center gap-2 rounded-lg font-sans text-[11px] font-medium uppercase tracking-[0.16em] transition-all ${
                                    canCheckout
                                        ? "border border-[#4A6350] bg-transparent text-[#2B3B2F] hover:bg-[#4A6350]/10"
                                        : "bg-[#4A6350] text-[#F6EEE4] hover:bg-[#3E5544]"
                                }`}
                            >
                                <span>Next: {steps[currentStepIndex + 1].shortLabel} →</span>
                            </button>
                        )}

                        {!canCheckout && currentStepIndex === steps.length - 1 && (
                            <button
                                type="button"
                                disabled
                                className="flex h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#2B3B2F] font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#F6EEE4] opacity-50 cursor-not-allowed shadow-sm"
                            >
                                <span>Proceed to Checkout</span>
                                <span aria-hidden>→</span>
                            </button>
                        )}

                        {!canCheckout && missingSteps.length > 0 && (
                            <p className="text-center font-sans text-[10px] text-[#8A483B] mt-1">
                                Please choose: {missingSteps.join(", ")}
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
    steps,
    countsByStep,
    total,
    selectedCount,
    minProducts,
    maxProducts,
    added,
    isSubmitting,
    packagingLabel,
    canCheckout,
    onAddToBag,
    onCheckout,
    onRemoveItem,
    onGoToStep,
}: {
    items: ResolvedGiftItem[];
    steps: GiftPresetStep[];
    countsByStep: Record<string, number>;
    total: number;
    selectedCount: number;
    minProducts: number;
    maxProducts: number;
    added: boolean;
    isSubmitting: boolean;
    packagingLabel?: string;
    canCheckout: boolean;
    onAddToBag: () => void;
    onCheckout: () => void;
    onRemoveItem: (instanceId: string, fallbackProductId?: string) => void;
    onGoToStep: (index: number) => void;
}) {
    const validItems = items.filter(
        (item): item is ResolvedGiftItem & { product: ProductView } => item.product !== null,
    );
    const canAddMore = selectedCount < maxProducts;
    const comboItems = [
        ...validItems.map((item) => ({
            instanceId: item.instanceId,
            image: item.product.image ?? "",
            name: item.product.title,
            sub: item.options?.label || item.stepConfig.label,
            stepIndex: steps.findIndex((s) => s.key === item.stepKey),
        })),
        {
            instanceId: "packaging",
            image: PACKAGING_BOX_IMAGE,
            name: packagingLabel || "Festive Gift Packaging",
            sub: "Seijaku ritual box with a handwritten card",
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
                                                onClick={() => onRemoveItem(item.instanceId, validItems[index]?.productId)}
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
                                    Want to adjust your gift box?
                                </h4>
                                <p className="font-sans text-[13px] text-[#6B564E]">
                                    Currently {selectedCount} of {maxProducts} items selected.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {steps.map((s, idx) => {
                                    const count = countsByStep[s.key] ?? 0;
                                    const isStepFull = count >= s.requiredCount;
                                    return (
                                        <button
                                            key={s.key}
                                            type="button"
                                            onClick={() => onGoToStep(idx)}
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-sans text-[11px] font-medium transition-colors ${
                                                isStepFull
                                                    ? "border-[#D8C8B7] bg-[#FAF5EC] text-[#6E5A4E] hover:bg-[#F0E6D6]"
                                                    : "border-[#4A6350] bg-[#FAF4EC] text-[#2B3B2F] hover:bg-[#4A6350] hover:text-[#F6EEE4]"
                                            }`}
                                        >
                                            {isStepFull ? (
                                                <span>Edit {s.shortLabel}</span>
                                            ) : (
                                                <>
                                                    <Plus size={12} />
                                                    <span>Choose {s.shortLabel}</span>
                                                </>
                                            )}
                                        </button>
                                    );
                                })}
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
                                            onClick={() => onRemoveItem(item.instanceId, item.productId)}
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
                                {packagingLabel || "Festive Box & Handwritten Note"}
                            </dt>
                            <dd className="font-medium text-[#2B3B2F]">Included</dd>
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
                                    Gift box requirements not yet satisfied
                                </p>
                                <p className="mt-0.5 text-[10px] text-[#7A3F33]">
                                    Currently {selectedCount} of {minProducts} items selected.
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

function buildGiftCheckoutItems(
    validItems: (ResolvedGiftItem & { product: ProductView })[],
    activePreset: GiftPreset,
): GiftCheckoutItem[] {
    return validItems.map((item) => {
        const categoryLabel = item.stepConfig.label;
        const optionLabel = item.options?.label;
        const variantLabel = optionLabel
            ? `[${activePreset.title} · ${categoryLabel}] ${optionLabel}`
            : `[${activePreset.title} · ${categoryLabel}]`;
        const selectedOptions: Record<string, string> = {
            ...(item.options?.options || {}),
            "Gift Box": activePreset.title,
            "Gift Category": categoryLabel,
            "Gift Packaging": activePreset.packagingLabel || "Festive Gift Box & Handwritten Card",
        };
        return {
            productSlug: item.product.slug,
            title: item.product.title,
            unitPrice: item.product.price,
            priceLabel: item.product.priceLabel,
            quantity: 1,
            image: item.product.image,
            shortDescription: item.product.shortDescription,
            variantLabel,
            selectedOptions,
            categoryName: categoryLabel,
            weightGrams: item.product.weightGrams,
            lengthCm: item.product.lengthCm,
            breadthCm: item.product.breadthCm,
            heightCm: item.product.heightCm,
        };
    });
}

export default function BuildGiftClient({
    products,
    presets = DEFAULT_GIFT_PRESETS,
    initialPresetId,
    minProducts: propMinProducts,
    maxProducts: propMaxProducts,
}: {
    products: ProductView[];
    presets?: GiftPreset[];
    initialPresetId?: string;
    minProducts?: number;
    maxProducts?: number;
}) {
    const router = useRouter();
    const { addToCart, openCart, clearCheckout, cart, syncGiftBundleToCart } = useShopState();
    const hydratedRef = useRef(false);
    const cartRef = useRef(cart);
    cartRef.current = cart;

    const availablePresets = useMemo(() => {
        return presets && presets.length > 0 ? presets : DEFAULT_GIFT_PRESETS;
    }, [presets]);

    const initialId = useMemo(() => {
        if (initialPresetId) {
            const matched = availablePresets.find(
                (p) => p.id.toLowerCase() === initialPresetId.trim().toLowerCase(),
            );
            if (matched) return matched.id;
        }
        return availablePresets[0]?.id || "ritual-box";
    }, [initialPresetId, availablePresets]);

    const [presetId, setPresetId] = useState(initialId);
    const [stepIndex, setStepIndex] = useState(0);
    const [giftItems, setGiftItems] = useState<GiftItemSelection[]>([]);
    const [savedLoaded, setSavedLoaded] = useState(false);
    const [added, setAdded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync presetId if initialPresetId changes from external navigation
    useEffect(() => {
        if (initialPresetId) {
            const matched = availablePresets.find(
                (p) => p.id.toLowerCase() === initialPresetId.trim().toLowerCase(),
            );
            if (matched && matched.id !== presetId) {
                setPresetId(matched.id);
                setStepIndex(0);
            }
        }
    }, [initialPresetId, availablePresets, presetId]);

    const activePreset = useMemo(() => {
        return (
            availablePresets.find((p) => p.id.toLowerCase() === presetId.toLowerCase()) ||
            availablePresets[0] ||
            DEFAULT_GIFT_PRESETS[1]
        );
    }, [availablePresets, presetId]);

    const steps = activePreset.steps;

    const minProducts = useMemo(() => {
        if (typeof propMinProducts === "number") return propMinProducts;
        if (typeof activePreset.minProducts === "number") return activePreset.minProducts;
        return steps.reduce((sum, s) => sum + s.requiredCount, 0);
    }, [propMinProducts, activePreset, steps]);

    const maxProducts = useMemo(() => {
        if (typeof propMaxProducts === "number") return propMaxProducts;
        if (typeof activePreset.maxProducts === "number") return activePreset.maxProducts;
        return minProducts;
    }, [propMaxProducts, activePreset, minProducts]);

    const isReview = stepIndex === steps.length;
    const step = steps[Math.min(stepIndex, steps.length - 1)];

    const productsById = useMemo(
        () => new Map(products.map((product) => [product.id, product])),
        [products],
    );

    /*
     * Hydrate saved selections once from storage or active cart.
     */
    useEffect(() => {
        if (hydratedRef.current || products.length === 0) return;
        hydratedRef.current = true;

        let stored = getStoredGiftItems();
        let valid = stored.filter((item) => productsById.has(item.productId));

        // Fallback 1: Recover selections from active gift checkout bundle
        if (valid.length === 0) {
            const bundle = getGiftCheckoutBundle();
            if (bundle && bundle.items && bundle.items.length > 0) {
                const recovered: GiftItemSelection[] = [];
                for (const bItem of bundle.items) {
                    const matchProduct = products.find((p) => p.slug === bItem.productSlug);
                    if (matchProduct) {
                        const stepKey =
                            steps.find((s) => s.label === bItem.categoryName)?.key ?? steps[0].key;
                        recovered.push({
                            instanceId: generateInstanceId(),
                            productId: matchProduct.id,
                            stepKey,
                            options: bItem.selectedOptions
                                ? { label: bItem.variantLabel, options: bItem.selectedOptions }
                                : null,
                        });
                    }
                }
                if (recovered.length > 0) {
                    valid = recovered;
                }
            }
        }

        // Fallback 2: Recover from cart
        const currentCart = cartRef.current;
        if (valid.length === 0 && currentCart && currentCart.length > 0) {
            const giftCartItems = currentCart.filter(isGiftCartItem);
            if (giftCartItems.length > 0) {
                const recoveredFromCart: GiftItemSelection[] = [];
                for (const cItem of giftCartItems) {
                    const matchProduct = products.find((p) => p.slug === cItem.productSlug);
                    if (matchProduct) {
                        const stepKey =
                            steps.find((s) => s.label === cItem.selectedOptions?.["Gift Category"])?.key ?? steps[0].key;
                        for (let q = 0; q < (cItem.quantity || 1); q++) {
                            recoveredFromCart.push({
                                instanceId: generateInstanceId(),
                                productId: matchProduct.id,
                                stepKey,
                                options: cItem.selectedOptions
                                    ? { label: cItem.variantLabel || "", options: cItem.selectedOptions }
                                    : null,
                            });
                        }
                    }
                }
                if (recoveredFromCart.length > 0) {
                    valid = recoveredFromCart;
                }
            }
        }

        valid = valid.map((item) => ({
            ...item,
            instanceId: item.instanceId || generateInstanceId(),
        }));
        setGiftItems(valid);
        setSavedLoaded(true);
    }, [products, productsById, steps]);

    /*
     * Listen for gift items removed or cleared from global CartDrawer
     */
    useEffect(() => {
        function handleGiftCartRemoved(e: Event) {
            const customEvent = e as CustomEvent<{ productSlug?: string }>;
            const slug = customEvent.detail?.productSlug;
            if (!slug) return;
            const matchingProduct = products.find((p) => p.slug === slug);
            if (matchingProduct) {
                removeProductOne(matchingProduct);
            }
        }
        function handleGiftCartCleared() {
            setGiftItems([]);
            clearGiftCheckoutBundle();
        }
        if (typeof window !== "undefined") {
            window.addEventListener("seijaku-gift-cart-removed", handleGiftCartRemoved);
            window.addEventListener("seijaku-gift-cart-cleared", handleGiftCartCleared);
            return () => {
                window.removeEventListener("seijaku-gift-cart-removed", handleGiftCartRemoved);
                window.removeEventListener("seijaku-gift-cart-cleared", handleGiftCartCleared);
            };
        }
    }, [products]);

    /*
     * Keep storage, gift checkout bundle, and global cart in sync with active gift items.
     */
    useEffect(() => {
        if (!savedLoaded) return;

        setStoredGiftItems(giftItems);

        const validItems = giftItems
            .map((item) => ({
                ...item,
                product: productsById.get(item.productId) ?? null,
                stepConfig: steps.find((s) => s.key === item.stepKey) ?? steps[0],
            }))
            .filter((item): item is ResolvedGiftItem & { product: ProductView } => item.product !== null);

        if (validItems.length === 0) {
            clearGiftCheckoutBundle();
            syncGiftBundleToCart([]);
            return;
        }

        const checkoutItems = buildGiftCheckoutItems(validItems, activePreset);
        const currentTotal = validItems.reduce((sum, item) => sum + item.product.price, 0);
        const bundle: GiftCheckoutBundle = {
            isGift: true,
            packaging: "festive",
            packagingTitle: `${activePreset.title} Packaging & Handwritten Card`,
            total: currentTotal,
            items: checkoutItems,
        };
        setGiftCheckoutBundle(bundle);

        const cartPayloads = checkoutItems.map((item) => ({
            productSlug: item.productSlug,
            title: item.title,
            unitPrice: item.unitPrice,
            priceLabel: item.priceLabel,
            quantity: 1,
            image: item.image,
            shortDescription: item.shortDescription,
            variantLabel: item.variantLabel,
            selectedOptions: item.selectedOptions,
            weightGrams: item.weightGrams,
            lengthCm: item.lengthCm,
            breadthCm: item.breadthCm,
            heightCm: item.heightCm,
        }));
        syncGiftBundleToCart(cartPayloads);
    }, [savedLoaded, giftItems, productsById, syncGiftBundleToCart, steps, activePreset]);

    const selectedCount = giftItems.length;

    const countsByStep = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const s of steps) {
            counts[s.key] = 0;
        }
        for (const item of giftItems) {
            counts[item.stepKey] = (counts[item.stepKey] ?? 0) + 1;
        }
        return counts;
    }, [steps, giftItems]);

    const stepCount = countsByStep[step?.key] ?? 0;
    const stepReq = step?.requiredCount ?? 1;
    const categoryLimitReached = stepCount >= stepReq;
    const isBoxFull = selectedCount >= maxProducts;
    const canAddMoreInStep = !categoryLimitReached && !isBoxFull;
    const canAddMore = !isBoxFull;

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
                steps.find((s) => s.key === item.stepKey) ?? steps[0];
            return {
                ...item,
                product,
                stepConfig,
            };
        });
    }, [giftItems, productsById, steps]);

    const total = useMemo(() => {
        return resolvedGiftItems.reduce(
            (sum, item) => sum + (item.product?.price ?? 0),
            0,
        );
    }, [resolvedGiftItems]);

    const visibleProducts = useMemo(() => {
        if (!step) return [];
        return productsForStep(products, step.key as GiftCategoryKey);
    }, [products, step]);

    const stepRequirementsMet = useMemo(() => {
        return steps.every((s) => (countsByStep[s.key] ?? 0) >= s.requiredCount);
    }, [steps, countsByStep]);

    const canCheckout = stepRequirementsMet && selectedCount >= minProducts && selectedCount <= maxProducts;
    const canAccessReview = canCheckout;

    function handleSelectPreset(preset: GiftPreset) {
        if (preset.id === presetId) return;
        setPresetId(preset.id);
        setStepIndex(0);
        // Retain only items whose stepKey matches one of the new preset's steps
        const allowedKeys = new Set(preset.steps.map((s) => s.key as string));
        setGiftItems((prev) => prev.filter((i) => allowedKeys.has(i.stepKey)));
        router.replace(`/build-gift?type=${encodeURIComponent(preset.id)}`, { scroll: false });
    }

    function addProduct(
        product: ProductView,
        selection?: ProductSelectionPayload,
    ) {
        if (giftItems.length >= maxProducts) return;
        const currentCountInStep = countsByStep[step.key] ?? 0;
        const limitInStep = step.requiredCount ?? 1;
        // Strictly resist selecting more than the allowed product number for this category
        if (currentCountInStep >= limitInStep) return;

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

    function removeItemByInstanceId(instanceId: string, fallbackProductId?: string) {
        setGiftItems((prev) => {
            if (instanceId) {
                const next = prev.filter((i) => i.instanceId && i.instanceId !== instanceId);
                if (next.length < prev.length) {
                    return next;
                }
            }
            if (fallbackProductId) {
                const index = prev.findIndex((i) => i.productId === fallbackProductId);
                if (index !== -1) {
                    const copy = [...prev];
                    copy.splice(index, 1);
                    return copy;
                }
            }
            return prev;
        });
        setAdded(false);
    }

    function goTo(index: number) {
        if (index < 0 || index >= steps.length) return;
        setStepIndex(index);
        setAdded(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function continueToNextStep() {
        if (stepIndex < steps.length - 1) {
            goTo(stepIndex + 1);
        } else if (canAccessReview) {
            proceedToCheckout();
        }
    }

    async function addToBag() {
        if (!canCheckout) return;
        setIsSubmitting(true);
        try {
            const validItems = resolvedGiftItems.filter(
                (item): item is ResolvedGiftItem & { product: ProductView } => item.product !== null,
            );
            if (validItems.length < minProducts) {
                throw new Error(`Minimum ${minProducts} products required for this gift box.`);
            }
            const checkoutItems = buildGiftCheckoutItems(validItems, activePreset);
            const cartPayloads = checkoutItems.map((item) => ({
                productSlug: item.productSlug,
                title: item.title,
                unitPrice: item.unitPrice,
                priceLabel: item.priceLabel,
                quantity: 1,
                image: item.image,
                shortDescription: item.shortDescription,
                variantLabel: item.variantLabel,
                selectedOptions: item.selectedOptions,
                weightGrams: item.weightGrams,
                lengthCm: item.lengthCm,
                breadthCm: item.breadthCm,
                heightCm: item.heightCm,
            }));
            syncGiftBundleToCart(cartPayloads);
            setAdded(true);
            openCart();
        } catch (error) {
            console.error("Unable to save gift bundle to bag.", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function proceedToCheckout() {
        if (!canCheckout) return;
        setIsSubmitting(true);
        try {
            const validItems = resolvedGiftItems.filter(
                (item): item is ResolvedGiftItem & { product: ProductView } => item.product !== null,
            );
            if (validItems.length < minProducts) {
                throw new Error(`Minimum ${minProducts} products required for this gift box.`);
            }
            const checkoutItems = buildGiftCheckoutItems(validItems, activePreset);
            const bundle: GiftCheckoutBundle = {
                isGift: true,
                packaging: "festive",
                packagingTitle: `${activePreset.title} Packaging & Handwritten Card`,
                total,
                items: checkoutItems,
            };
            // 1. Store gift bundle for checkout
            setGiftCheckoutBundle(bundle);
            // 2. Clear single-item Buy Now checkout state
            clearCheckout();
            if (typeof window !== "undefined") {
                try {
                    window.localStorage.removeItem("seijaku-checkout-item");
                    window.localStorage.removeItem("seijaku-checkout-variant");
                    window.localStorage.removeItem("seijaku-checkout-options");
                } catch {}
            }
            // 3. Ensure cart has the exact current gift bundle
            const cartPayloads = checkoutItems.map((item) => ({
                productSlug: item.productSlug,
                title: item.title,
                unitPrice: item.unitPrice,
                priceLabel: item.priceLabel,
                quantity: 1,
                image: item.image,
                shortDescription: item.shortDescription,
                variantLabel: item.variantLabel,
                selectedOptions: item.selectedOptions,
                weightGrams: item.weightGrams,
                lengthCm: item.lengthCm,
                breadthCm: item.breadthCm,
                heightCm: item.heightCm,
            }));
            syncGiftBundleToCart(cartPayloads);
            // 4. Navigate to checkout with gift query parameter
            router.push("/checkout?gift=true");
        } catch (error) {
            console.error("Failed to proceed to checkout.", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main
            className="min-h-screen w-full bg-[#F9F5EE] px-4 pb-16 pt-24 text-[#2A1D1B] sm:px-6 sm:pt-28 xl:px-8 2xl:px-12"
            style={{
                fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
            }}
        >
            <div className="mx-auto max-w-[1750px]">
                {/* Top Bar: Back button, Stepper, and Slogan */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7DCCD] pb-4">
                    <Link
                        href="/gifts"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#D7CABA] bg-[#FAF5EC] px-3.5 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[#554339] shadow-xs transition-all hover:border-[#2B3B2F] hover:bg-[#2B3B2F] hover:text-[#F6EEE4]"
                        aria-label="Back to gifts page"
                    >
                        <ArrowLeft size={13} />
                        <span>Back to Gifts</span>
                    </Link>
                    <Stepper
                        current={stepIndex}
                        steps={steps}
                        countsByStep={countsByStep}
                        onGo={goTo}
                    />
                    <span className="hidden font-serif text-[12px] italic text-[#9A8574] 2xl:block">
                        Small objects. Deeper connections.
                    </span>
                </div>

                {/* Preset Switcher Header: 3 Ways to Gift */}
                <PresetSwitcher
                    presets={availablePresets}
                    activePresetId={activePreset.id}
                    onSelect={handleSelectPreset}
                />

                {isReview ? (
                    <>
                        <GiftHeader
                            isReview={isReview}
                            stepIndex={stepIndex}
                            step={step}
                            totalSteps={steps.length}
                            activePresetTitle={activePreset.title}
                            selectedCount={selectedCount}
                            stepCount={countsByStep[step?.key] ?? 0}
                            minProducts={minProducts}
                            maxProducts={maxProducts}
                        />
                        <GiftReview
                            items={resolvedGiftItems}
                            steps={steps}
                            countsByStep={countsByStep}
                            total={total}
                            selectedCount={selectedCount}
                            minProducts={minProducts}
                            maxProducts={maxProducts}
                            added={added}
                            isSubmitting={isSubmitting}
                            packagingLabel={activePreset.packagingLabel}
                            canCheckout={canCheckout}
                            onAddToBag={addToBag}
                            onCheckout={proceedToCheckout}
                            onRemoveItem={removeItemByInstanceId}
                            onGoToStep={goTo}
                        />
                    </>
                ) : (
                    <div className="mt-7 grid grid-cols-1 items-start gap-6 md:gap-7 xl:grid-cols-[200px_minmax(0,1fr)_310px] 2xl:grid-cols-[230px_minmax(0,1fr)_320px] 2xl:gap-8">
                        {/* Left: Section guidance and requirements */}
                        <GiftHeader
                            isReview={isReview}
                            stepIndex={stepIndex}
                            step={step}
                            totalSteps={steps.length}
                            activePresetTitle={activePreset.title}
                            selectedCount={selectedCount}
                            stepCount={countsByStep[step?.key] ?? 0}
                            minProducts={minProducts}
                            maxProducts={maxProducts}
                        />

                        {/* Centre: Product drawer with category products */}
                        <div className="min-w-0">
                            <div className="grid min-w-0 grid-cols-1 gap-5">
                                <section className="min-w-0 overflow-hidden border-t border-[#E7DCCD] pt-1">
                                    <ProductDrawer
                                        key={`${activePreset.id}-${step.key}`}
                                        products={visibleProducts}
                                        selectedCountsByProductId={countsByProductId}
                                        canAddMore={canAddMoreInStep}
                                        categoryLimitReached={categoryLimitReached}
                                        categoryRequiredCount={stepReq}
                                        categoryCurrentCount={stepCount}
                                        categoryLabel={step.label}
                                        hasNextStep={stepIndex < steps.length - 1}
                                        onNextStep={continueToNextStep}
                                        onAddProduct={addProduct}
                                        onRemoveProduct={removeProductOne}
                                    />
                                </section>
                            </div>
                        </div>

                        {/* Right: Box summary with checklist and proceed button */}
                        <GiftSidebar
                            items={resolvedGiftItems}
                            steps={steps}
                            currentStepIndex={stepIndex}
                            countsByStep={countsByStep}
                            selectedCount={selectedCount}
                            minProducts={minProducts}
                            maxProducts={maxProducts}
                            total={total}
                            isSubmitting={isSubmitting}
                            packagingLabel={activePreset.packagingLabel}
                            canCheckout={canCheckout}
                            onContinue={continueToNextStep}
                            onGoToStep={goTo}
                            onRemoveItem={removeItemByInstanceId}
                            onCheckout={proceedToCheckout}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
