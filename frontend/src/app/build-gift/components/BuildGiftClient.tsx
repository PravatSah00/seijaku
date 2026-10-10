"use client";

import type { ProductView } from "@/src/lib/product-types";
import { Fragment, useEffect, useMemo, useState } from "react";
import ProductDrawer from "./ProductDrawer";
import {
    EMPTY_GIFT_SELECTION_IDS,
    clearGiftSelectionIds,
    getGiftSelectionIds,
    setGiftSelectionIds,
    type GiftSelectionIds,
} from "../utils";

const GIFT_STORAGE_KEY = "seijaku-bag";
const PACKAGING_BOX_IMAGE = "/images/packging box.png";
const REVIEW_LABEL = "Review";

type GiftStepKey = "textile" | "scent" | "dokra";

type StepConfig = {
    key: GiftStepKey;
    label: string;
    title: [string, string];
    description: string;
    tagline: string[];
};

type ChosenGiftItem = {
    step: StepConfig;
    product: ProductView | null;
};

const STEPS: StepConfig[] = [
    {
        key: "textile",
        label: "Textile",
        title: ["Choose", "Your Textile"],
        description: "A fabric for everyday rituals. From quiet mornings to special evenings, choose a design that feels right.",
        tagline: ["Cloth.", "Colour. A", "quieter gesture."],
    },
    {
        key: "scent",
        label: "Scent",
        title: ["Choose", "Your Scent"],
        description: "Fragrances to invite attention — what we feel, what we remember, and how we inhabit a moment.",
        tagline: ["Scent.", "Memory.", "A slower you."],
    },
    {
        key: "dokra",
        label: "Dokra",
        title: ["Choose", "Your Dokra"],
        description: "Handcrafted in Bankura, West Bengal. Each piece carries the warmth of craft, and a quiet sense of meaning.",
        tagline: ["Small object.", "Bigger stories."],
    },
];

const REVIEW_FEATURES = [
    { icon: "/images/Leaf Icon.png", label: "Artisanal & Ethical" },
    { icon: "/images/Gift Box Icon.png", label: "Beautifully Packaged" },
    { icon: "/images/India Icon.png", label: "Made in India" },
    { icon: "/images/Heart.png", label: "Gifts with Meaning" },
] as const;

const STEP_KEYWORDS: Record<GiftStepKey, string[]> = {
    textile: ["lifestyle", "home"],
    scent: ["perfumes", "fragrances", "scent"],
    dokra: ["dokra-ornaments"],
};

function formatPrice(amount: number) {
    return `₹${amount.toLocaleString("en-IN")}`;
}

function productsForStep(products: ProductView[], step: GiftStepKey) {
    const keywords = STEP_KEYWORDS[step];
    const matches = products.filter((product) => {
        const searchable = [
            product.type,
            product.material,
            product.title,
            product.shortDescription,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return keywords.some((keyword) => searchable.includes(keyword));
    });

    // Fallback keeps the page usable if backend taxonomy changes.
    return matches.length > 0 ? matches : products;
}

function validateStoredSelections(
    products: ProductView[],
    stored: GiftSelectionIds,
): GiftSelectionIds {
    const validId = (step: GiftStepKey) => {
        const id = stored[step];
        if (!id) return null;
        return productsForStep(products, step).some(
            (product) => product.id === id,
        )
            ? id
            : null;
    };

    return {
        textile: validId("textile"),
        scent: validId("scent"),
        dokra: validId("dokra"),
    };
}

function firstIncompleteStep(selections: GiftSelectionIds) {
    const index = STEPS.findIndex((step) => !selections[step.key]);
    return index === -1 ? STEPS.length : index;
}

function Stepper({
    current,
    onGo,
}: {
    current: number;
    onGo: (index: number) => void;
}) {
    const labels = [...STEPS.map((step) => step.label), REVIEW_LABEL];
    return (
        <ol className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 sm:gap-x-2">
            {labels.map((label, index) => {
                const active = index === current;
                const done = index < current;
                const content = (
                    <span className="flex items-center gap-1.5">
                        <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full font-sans text-[10px] font-medium transition-all duration-300 ${active
                                    ? "bg-[#2B3B2F] text-[#F6EEE4] ring-4 ring-[#2B3B2F]/15"
                                    : done
                                        ? "bg-[#4A6350] text-[#F6EEE4]"
                                        : "bg-[#E8DDCD] text-[#8C7A6E]"
                                }`}
                        >
                            {done ? "✓" : index + 1}
                        </span>
                        <span
                            className={`hidden font-sans text-[10px] tracking-wide sm:inline ${active ? "font-medium text-[#2A1D1B]" : "text-[#8C7A6E]"
                                }`}
                        >
                            {label}
                        </span>
                    </span>
                );

                return (
                    <Fragment key={label}>
                        {index > 0 && (
                            <span
                                aria-hidden
                                className={`h-px w-3 sm:w-5 ${index <= current ? "bg-[#4A6350]" : "bg-[#D8C8B7]"
                                    }`}
                            />
                        )}
                        <li>
                            {done ? (
                                <button
                                    type="button"
                                    onClick={() => onGo(index)}
                                    className="transition-opacity hover:opacity-75"
                                    aria-label={`Go back to ${label}`}
                                >
                                    {content}
                                </button>
                            ) : (
                                content
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
}: {
    isReview: boolean;
    stepIndex: number;
    step: StepConfig;
}) {
    return (
        <header className="mx-auto mt-2 max-w-3xl text-center sm:mt-6">
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#8C7A6E]">
                {isReview ? "Final Step" : `Step ${stepIndex + 1} of 4`}
            </p>
            <h1 className="mt-4 text-[34px] font-normal leading-[1.05] sm:text-[46px] lg:text-[56px]">
                {isReview ? (
                    <>
                        Your Seijaku{" "}
                        <span className="italic text-[#4A6350]">Gift</span>
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
                    ? "Thoughtful choices. A more meaningful gift."
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

function ItemRow({ product }: { product: ProductView }) {
    return (
        <div className="flex items-center gap-3">
            <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#EFE5D8]">
                <img
                    src={product.image ?? ""}
                    alt={product.imageAlt ?? product.title}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </span>
            <div className="min-w-0">
                <p className="truncate font-sans text-[12px] font-medium">
                    {product.title}
                </p>
                <p className="truncate font-sans text-[11px] text-[#6B564E]">
                    {product.slug ?? ""}
                </p>
            </div>
            <span className="ml-auto shrink-0 font-sans text-[12px]">
                {formatPrice(product.price)}
            </span>
        </div>
    );
}

function GiftSidebar({
    chosen,
    selected,
    total,
    nextLabel,
    onContinue,
}: {
    chosen: ChosenGiftItem[];
    selected: ProductView | null;
    total: number;
    nextLabel: string;
    onContinue: () => void;
}) {
    return (
        <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-[#E3D4C4] bg-[#FAF4EC]">
                <h3 className="border-b border-[#E3D4C4] bg-[#EFE3D3] px-4 py-3 text-[16px]">
                    Your Gift
                </h3>
                <div className="space-y-4 px-4 py-4">
                    {chosen.map(
                        ({ step, product }) =>
                            product && <ItemRow key={step.key} product={product} />,
                    )}
                    <dl className="space-y-3 border-t border-[#E3D4C4] pt-3 font-sans text-[12px]">
                        {chosen.map(
                            ({ step, product }) =>
                                !product && (
                                    <div
                                        key={step.key}
                                        className="flex justify-between"
                                    >
                                        <dt>{step.label}</dt>
                                        <dd className="text-[#6B564E]">
                                            Not selected
                                        </dd>
                                    </div>
                                ),
                        )}
                        <div className="flex justify-between text-[11px]">
                            <dt>Festive Packaging</dt>
                            <dd className="text-[#2B3B2F]">Free</dd>
                        </div>
                    </dl>
                </div>
                <div className="border-t border-[#E3D4C4] px-4 py-4">
                    <div className="flex items-center justify-between font-sans text-[13px]">
                        <span>Subtotal</span>
                        <span className="text-[16px]">{formatPrice(total)}</span>
                    </div>
                    <button
                        type="button"
                        disabled={!selected}
                        onClick={onContinue}
                        className="mt-3 flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-[#4A6350] font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-[#F6EEE4] transition-all hover:bg-[#3E5544] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Continue to {nextLabel}
                        <span aria-hidden>→</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

function GiftReview({
    chosen,
    total,
    added,
    onAddToBag,
}: {
    chosen: ChosenGiftItem[];
    total: number;
    added: boolean;
    onAddToBag: () => void;
}) {
    const comboItems = [
        ...chosen.flatMap(({ step, product }) =>
            product
                ? [
                    {
                        key: step.key,
                        image: product.image ?? "",
                        name: product.title,
                        sub: product.shortDescription ?? "",
                    },
                ]
                : [],
        ),
        {
            key: "packaging",
            image: PACKAGING_BOX_IMAGE,
            name: "Festive Packaging",
            sub: "Seijaku gift box with a handwritten card",
        },
    ];

    return (
        <div className="mx-auto mt-10 grid max-w-[1400px] grid-cols-1 gap-8 sm:mt-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
            <section className="min-w-0">
                <div className="rounded-2xl border border-[#E3D4C4] bg-[#FAF4EC] p-5 sm:p-8">
                    <div className="flex flex-wrap items-start justify-center gap-4 sm:flex-nowrap sm:gap-2">
                        {comboItems.map((item, index) => (
                            <Fragment key={item.key}>
                                {index > 0 && (
                                    <span
                                        aria-hidden
                                        className="hidden shrink-0 self-center text-[22px] text-[#B8A898] sm:block"
                                    >
                                        +
                                    </span>
                                )}
                                <div className="w-full min-w-0 flex-1 basis-[calc(50%-0.5rem)] text-center sm:basis-0">
                                    <span className="relative mx-auto block aspect-square w-full overflow-hidden rounded-lg bg-[#EFE5D8]">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                    </span>
                                    <p className="mt-3 text-[14px] leading-[1.25]">
                                        {item.name}
                                    </p>
                                    <p className="mt-1 text-[11px] leading-[1.3] text-[#6B564E]">
                                        {item.sub}
                                    </p>
                                </div>
                            </Fragment>
                        ))}
                    </div>
                </div>
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
            <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
                <div className="overflow-hidden rounded-2xl border border-[#E3D4C4] bg-[#FAF4EC]">
                    <h3 className="border-b border-[#E3D4C4] px-5 py-4 text-[17px]">
                        Order Summary
                    </h3>
                    <dl className="space-y-3 px-5 py-5 font-sans text-[12px]">
                        {chosen.map(
                            ({ step, product }) =>
                                product && (
                                    <div
                                        key={step.key}
                                        className="flex justify-between gap-3"
                                    >
                                        <img
                                            src={product.image ?? ""}
                                            alt={product.imageAlt ?? product.title}
                                            className="h-12 w-12 shrink-0 rounded-md object-cover"
                                        />
                                        <dt className="truncate">
                                            {product.title}
                                        </dt>
                                        <dd className="shrink-0">
                                            {formatPrice(product.price)}
                                        </dd>
                                    </div>
                                ),
                        )}
                        <div className="flex justify-between gap-3">
                            <dt>Festive Packaging</dt>
                            <dd className="text-[#2B3B2F]">Free</dd>
                        </div>
                    </dl>
                    <div className="flex items-center justify-between border-t border-[#E3D4C4] px-5 py-4 font-sans text-[13px]">
                        <span>Subtotal</span>
                        <span className="text-[18px]">{formatPrice(total)}</span>
                    </div>
                    <div className="px-5 pb-5">
                        <button
                            type="button"
                            onClick={onAddToBag}
                            disabled={added}
                            className="flex h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#2B3B2F] font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-[#F6EEE4] transition-all hover:bg-[#1F2C23] hover:shadow-lg disabled:cursor-default disabled:opacity-80"
                        >
                            {added ? "Added to bag ✓" : "Add to bag"}
                            {!added && <span aria-hidden>→</span>}
                        </button>
                        <p className="mt-3 text-center font-sans text-[10px] text-[#6B564E]">
                            Usually ships in 3 to 5 working days
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
}

export default function BuildGiftClient({
    products,
}: {
    products: ProductView[];
}) {
    const [stepIndex, setStepIndex] = useState(0);
    const [selections, setSelections] = useState<GiftSelectionIds>({
        ...EMPTY_GIFT_SELECTION_IDS,
    });
    const [savedSelectionsLoaded, setSavedSelectionsLoaded] = useState(false);
    const [added, setAdded] = useState(false);

    const isReview = stepIndex === STEPS.length;
    const step = STEPS[Math.min(stepIndex, STEPS.length - 1)];

    const productsById = useMemo(
        () => new Map(products.map((product) => [product.id, product])),
        [products],
    );

    /*
     * Hydrate the builder once from the shared gift-selection utility.
     * Invalid/stale IDs are discarded safely.
     *
     * Complete saved bundles open directly on Review.
     * Partial saved bundles open at the first missing step.
     */
    useEffect(() => {
        if (savedSelectionsLoaded || products.length === 0) return;

        const stored = getGiftSelectionIds();
        const valid = validateStoredSelections(products, stored);

        setSelections(valid);
        setStepIndex(firstIncompleteStep(valid));
        setSavedSelectionsLoaded(true);
    }, [products, savedSelectionsLoaded]);

    /*
     * Keep the draft in sync after hydration.
     * Other pages can seed the same storage key before redirecting here.
     */
    useEffect(() => {
        if (!savedSelectionsLoaded) return;
        setGiftSelectionIds(selections);
    }, [savedSelectionsLoaded, selections]);

    const chosen: ChosenGiftItem[] = STEPS.map((giftStep) => {
        const productId = selections[giftStep.key];
        return {
            step: giftStep,
            product: productId ? productsById.get(productId) ?? null : null,
        };
    });

    const selected = isReview
        ? null
        : selections[step.key]
            ? productsById.get(selections[step.key]!) ?? null
            : null;

    const total = chosen.reduce(
        (sum, item) => sum + (item.product?.price ?? 0),
        0,
    );

    const nextLabel = stepIndex < STEPS.length - 1
        ? STEPS[stepIndex + 1].label
        : REVIEW_LABEL;

    const visibleProducts = productsForStep(products, step.key);

    function selectProduct(product: ProductView) {
        if (isReview) return;
        setSelections((current) => ({
            ...current,
            [step.key]: product.id,
        }));
        setAdded(false);
    }

    function goTo(index: number) {
        if (index < 0 || index > STEPS.length) return;
        setStepIndex(index);
        setAdded(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function continueToNextStep() {
        if (!selected || isReview) return;
        goTo(stepIndex + 1);
    }

    function addToBag() {
        if (chosen.some(({ product }) => !product)) return;

        const items = chosen.map(({ step: giftStep, product }) => {
            if (!product) {
                throw new Error(`Missing product for ${giftStep.key}`);
            }
            return {
                type : giftStep.key,
                id   : product.id,
                slug : product.slug,
                name : product.title,
                price: product.price,
            };
        });

        try {
            localStorage.setItem(
                GIFT_STORAGE_KEY,
                JSON.stringify({ items, packaging: "festive", total }),
            );

            // TODO: Communicate with backend to finalize gift.
            console.log("Gift bundle saved to localStorage:", { items, total });

            // The draft has now been consumed by the finalized gift.
            clearGiftSelectionIds();
            setAdded(true);
        } catch (error) {
            console.error("Unable to save gift bundle.", error);
        }
    }

    return (
        <main
            className="min-h-screen w-full bg-[#F7EFE5] px-4 pb-16 pt-24 text-[#2A1D1B] sm:px-6 sm:pt-28 lg:px-10 lg:pt-28"
            style={{
                fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
            }}
        >
            <Stepper current={stepIndex} onGo={goTo} />
            <GiftHeader
                isReview={isReview}
                stepIndex={stepIndex}
                step={step}
            />
            {isReview ? (
                <GiftReview
                    chosen={chosen}
                    total={total}
                    added={added}
                    onAddToBag={addToBag}
                />
            ) : (
                <div className="mx-auto mt-10 grid max-w-[1400px] grid-cols-1 gap-8 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
                    <section className="min-w-0">
                        <ProductDrawer
                            key={step.key}
                            products={visibleProducts}
                            selectedGiftProductId={selected?.id ?? null}
                            onSelect={selectProduct}
                        />
                    </section>
                    <GiftSidebar
                        chosen={chosen}
                        selected={selected}
                        total={total}
                        nextLabel={nextLabel}
                        onContinue={continueToNextStep}
                    />
                </div>
            )}
        </main>
    );
}