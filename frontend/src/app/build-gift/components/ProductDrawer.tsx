"use client";

import { PanelLeftOpen, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { triggerPageLoader, stopPageLoader } from "@/src/components/PageTransitionLoader";

import {
    getShopPrices,
    getShopTypes,
    matchesShopPriceFilter,
    matchesShopTypeFilter,
    sortOptions,
    type ShopPriceFilterOption,
    type ShopSortOption,
    type ShopTypeFilterOption,
} from "@/src/lib/shop-taxonomy";
import type { ProductView } from "@/src/lib/product-types";

import ActiveFilterChips from "./ActiveFilterChips";
import CompactProductCard from "./CompactProductCard";
import ProductDetailDrawer from "./ProductDetailDrawer";
import ShopFilterDrawer from "./ShopFilterDrawer";
import ShopFilterRail from "./ShopFilterRail";
import { getGiftUnitPrice, type GiftItemSelection, type ProductSelectionPayload } from "../utils";

const INITIAL_BATCH_SIZE = 8;
const LOAD_MORE_STEP = 8;
const RAIL_COLLAPSE_STORAGE_KEY = "seijaku.buildGiftFilterRail.collapsed";

function matchesSearch(item: ProductView, query: string) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;

    return [item.title, item.shortDescription, item.material, item.type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized);
}

function sortProducts(items: ProductView[], sortBy: ShopSortOption) {
    const sorted = [...items];

    if (sortBy === "Newest") {
        return sorted.sort(
            (a, b) =>
                new Date(b.releaseDate ?? 0).getTime() -
                new Date(a.releaseDate ?? 0).getTime(),
        );
    }

    if (sortBy === "Price low to high") {
        return sorted.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "Price high to low") {
        return sorted.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "Recommended") {
        return sorted.sort((a, b) => {
            const orderA = typeof a.buildGift?.order === "number" ? a.buildGift.order : 9999;
            const orderB = typeof b.buildGift?.order === "number" ? b.buildGift.order : 9999;
            if (orderA !== orderB) return orderA - orderB;
            return a.title.localeCompare(b.title);
        });
    }

    return sorted;
}

type ProductDrawerProps = {
    products: ProductView[];
    selectedGiftItems: GiftItemSelection[];
    selectedCountsByProductId: Record<string, number>;
    canAddMore: boolean;
    categoryLimitReached?: boolean;
    categoryRequiredCount?: number;
    categoryCurrentCount?: number;
    categoryLabel?: string;
    hasNextStep?: boolean;
    onNextStep?: () => void;
    onAddProduct: (product: ProductView, selection?: ProductSelectionPayload) => void;
    onRemoveProduct: (product: ProductView) => void;
};

export default function ProductDrawer({
    products,
    selectedGiftItems,
    selectedCountsByProductId,
    canAddMore,
    categoryLimitReached = false,
    categoryRequiredCount = 1,
    categoryCurrentCount = 0,
    categoryLabel,
    hasNextStep = false,
    onNextStep,
    onAddProduct,
    onRemoveProduct,
}: ProductDrawerProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchValue, setSearchValue] = useState("");
    const [selectedType, setSelectedType] =
        useState<ShopTypeFilterOption | "All">("All");
    const [selectedPrice, setSelectedPrice] =
        useState<ShopPriceFilterOption | "All">("All");
    const [sortBy, setSortBy] = useState<ShopSortOption>("Recommended");
    const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
    const [isRailCollapsed, setIsRailCollapsed] = useState(true);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [loadingProductSlug, setLoadingProductSlug] = useState<string | null>(null);

    const detailSlug = searchParams.get("item");
    const detailProduct = detailSlug
        ? products.find((product) => product.slug === detailSlug) ?? null
        : null;

    const selectedDetailItems = selectedGiftItems.filter(
        (item) => item.productId === detailProduct?.id,
    );

    const selectedDetailItem = selectedDetailItems[selectedDetailItems.length - 1];

    useEffect(() => {
        if (detailProduct && loadingProductSlug) {
            setLoadingProductSlug(null);
            stopPageLoader();
        }
    }, [detailProduct, loadingProductSlug]);

    useEffect(() => {
        // Ensure filter rail is always hidden by default on page load / refresh
        setIsRailCollapsed(true);
        try {
            sessionStorage.removeItem(RAIL_COLLAPSE_STORAGE_KEY);
            localStorage.removeItem(RAIL_COLLAPSE_STORAGE_KEY);
        } catch {
            // Storage unavailable in restricted/private browsing.
        }
    }, []);

    const types = useMemo(() => {
        const available = getShopTypes().filter((type) =>
            products.some((product) => matchesShopTypeFilter(product, type)),
        );

        return available.length > 0 ? available : getShopTypes();
    }, [products]);

    const filteredProducts = useMemo(() => {
        const filtered = products.filter(
            (item) =>
                matchesSearch(item, searchValue) &&
                matchesShopTypeFilter(item, selectedType) &&
                matchesShopPriceFilter(item, selectedPrice),
        );

        return sortProducts(filtered, sortBy);
    }, [products, searchValue, selectedPrice, selectedType, sortBy]);

    const visibleProducts = filteredProducts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredProducts.length;

    const activeChips = useMemo(() => {
        const chips: Array<{ id: string; label: string }> = [];

        if (searchValue.trim()) {
            chips.push({ id: "search", label: `Search: ${searchValue.trim()}` });
        }
        if (selectedType !== "All") {
            chips.push({ id: "type", label: selectedType });
        }
        if (selectedPrice !== "All") {
            chips.push({ id: "price", label: selectedPrice });
        }

        return chips;
    }, [searchValue, selectedPrice, selectedType]);

    const hasActiveFilters =
        activeChips.length > 0 || sortBy !== "Recommended";

    function resetVisibleCount() {
        setVisibleCount(INITIAL_BATCH_SIZE);
    }

    function resetFilters() {
        setSearchValue("");
        setSelectedType("All");
        setSelectedPrice("All");
        setSortBy("Recommended");
        resetVisibleCount();
    }

    function removeChip(id: string) {
        if (id === "search") setSearchValue("");
        if (id === "type") setSelectedType("All");
        if (id === "price") setSelectedPrice("All");
        resetVisibleCount();
    }

    function toggleRailCollapsed(collapsed: boolean) {
        setIsRailCollapsed(collapsed);
    }

    function updateQuery(slug?: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (slug) params.set("item", slug);
        else params.delete("item");

        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, {
            scroll: false,
        });
    }

    function handleViewDetails(slug: string) {
        setLoadingProductSlug(slug);
        triggerPageLoader();
        updateQuery(slug);

        // Safety fallback timeout
        setTimeout(() => {
            setLoadingProductSlug((current) => {
                if (current === slug) {
                    stopPageLoader();
                    return null;
                }
                return current;
            });
        }, 3000);
    }

    const filterRailProps = {
        searchValue,
        onSearchChange: (value: string) => {
            setSearchValue(value);
            resetVisibleCount();
        },
        selectedType,
        onTypeChange: (value: ShopTypeFilterOption | "All") => {
            setSelectedType(value);
            resetVisibleCount();
        },
        selectedPrice,
        onPriceChange: (value: ShopPriceFilterOption | "All") => {
            setSelectedPrice(value);
            resetVisibleCount();
        },
        sortBy,
        onSortChange: (value: ShopSortOption) => {
            setSortBy(value);
            resetVisibleCount();
        },
        types,
        prices: getShopPrices(),
        sortOptions,
        onReset: resetFilters,
        hasActiveFilters,
    };

    const gridColumns =
        "grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3";

    return (
        <>
            <div className="w-full text-[#3a3a3a]">
                <section className="pb-16 sm:pb-20">
                    <div className="w-full">
                        <div
                            className={`grid gap-6 ${
                                isRailCollapsed
                                    ? "lg:grid-cols-1"
                                    : "lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8"
                            }`}
                        >
                            {!isRailCollapsed && (
                                <aside className="hidden lg:block">
                                    <ShopFilterRail
                                        {...filterRailProps}
                                        onCollapse={() =>
                                            toggleRailCollapsed(true)
                                        }
                                    />
                                </aside>
                            )}

                            <div>
                                <div className="flex flex-col gap-3 border-b border-[rgba(76,67,57,0.08)] pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                                    <div className="flex items-center gap-3">
                                        {isRailCollapsed && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleRailCollapsed(false)
                                                }
                                                className="hidden items-center gap-2 rounded-full border border-[rgba(111,100,86,0.14)] bg-white px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#4f463d] transition-colors hover:bg-[#faf7f1] lg:inline-flex"
                                            >
                                                <PanelLeftOpen
                                                    aria-hidden
                                                    size={14}
                                                    strokeWidth={1.6}
                                                />
                                                Show Filters
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsFilterDrawerOpen(true)
                                            }
                                            className="inline-flex items-center gap-2 rounded-full border border-[rgba(111,100,86,0.14)] bg-white px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#4f463d] transition-colors hover:bg-[#faf7f1] lg:hidden"
                                        >
                                            <SlidersHorizontal
                                                aria-hidden
                                                size={14}
                                                strokeWidth={1.6}
                                            />
                                            Filters
                                            {activeChips.length > 0 &&
                                                ` (${activeChips.length})`}
                                        </button>

                                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#7c7368]">
                                            {filteredProducts.length} results
                                        </p>
                                    </div>

                                    <ActiveFilterChips
                                        chips={activeChips}
                                        onRemove={removeChip}
                                        onClear={resetFilters}
                                    />
                                </div>

                                {categoryLimitReached && (
                                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-[#4A6350]/30 bg-[#4A6350]/10 px-4 py-3 font-sans text-[12px] text-[#2B3B2F] shadow-xs">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4A6350] text-[#F6EEE4] text-[11px] font-bold">
                                                ✓
                                            </span>
                                            <span>
                                                <strong>{categoryRequiredCount} of {categoryRequiredCount} {categoryLabel || "items"} selected.</strong>{" "}
                                                Category limit reached. To choose a different product, remove the selected item below.
                                            </span>
                                        </div>
                                        {hasNextStep && onNextStep && (
                                            <button
                                                type="button"
                                                onClick={onNextStep}
                                                className="shrink-0 self-start sm:self-auto rounded-lg bg-[#2B3B2F] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[#F6EEE4] transition-colors hover:bg-[#1E2B22] shadow-xs"
                                            >
                                                Next Step →
                                            </button>
                                        )}
                                    </div>
                                )}

                                {visibleProducts.length === 0 ? (
                                    <div className="mt-8 rounded-[28px] border border-[rgba(111,100,86,0.11)] bg-[linear-gradient(180deg,#fbf8f2_0%,#f7f1e8_100%)] px-7 py-10 text-center sm:px-10 sm:py-12">
                                        <p className="font-serif text-[30px] leading-[1.14] tracking-[-0.02em] text-[#1f1a16]">
                                            No products match this selection.
                                        </p>
                                        <p className="mx-auto mt-4 max-w-[34ch] text-[15px] leading-[1.85] text-[#5f5850]">
                                            Try clearing or broadening the filters.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`mt-8 ${gridColumns}`}>
                                            {visibleProducts.map((product) => {
                                                const countForProduct =
                                                    selectedCountsByProductId[
                                                        product.id
                                                    ] ?? 0;
                                                const selectedItems = selectedGiftItems.filter(
                                                    (item) => item.productId === product.id,
                                                );
                                                const selectedItem = selectedItems[selectedItems.length - 1];
                                                const selectedPriceLabel = selectedItem
                                                    ? `₹${getGiftUnitPrice(product, selectedItem.options?.options).toLocaleString("en-IN")}`
                                                    : undefined;
                                                return (
                                                    <CompactProductCard
                                                        key={product.id}
                                                        item={product}
                                                        selectedPriceLabel={selectedPriceLabel}
                                                        selectedOptionLabel={selectedItem?.options?.label ?? undefined}
                                                        selectedCountForProduct={
                                                            countForProduct
                                                        }
                                                        canAddMore={canAddMore}
                                                        categoryLimitReached={categoryLimitReached}
                                                        categoryRequiredCount={categoryRequiredCount}
                                                        isLoadingDetails={loadingProductSlug === product.slug}
                                                        onAddGiftProduct={
                                                            onAddProduct
                                                        }
                                                        onRemoveGiftProduct={
                                                            onRemoveProduct
                                                        }
                                                        onViewDetails={
                                                            handleViewDetails
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>

                                        {hasMore && (
                                            <div className="mt-12 flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setVisibleCount(
                                                             (count) =>
                                                                count +
                                                                LOAD_MORE_STEP,
                                                        )
                                                    }
                                                    className="inline-flex items-center justify-center rounded-full border border-[rgba(111,100,86,0.14)] bg-[linear-gradient(180deg,#fbf8f2_0%,#f3ede4_100%)] px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] text-[#4c443c] transition-colors hover:bg-[#faf7f1]"
                                                >
                                                    Load More
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <ShopFilterDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                {...filterRailProps}
            />

            <ProductDetailDrawer
                item={detailProduct}
                isOpen={Boolean(detailProduct)}
                initialSelectedOptions={
                    selectedDetailItem?.options?.options
                }
                onClose={() => {
                    setLoadingProductSlug(null);
                    stopPageLoader();
                    updateQuery();
                }}
                selectedCountForProduct={
                    detailProduct
                        ? (selectedCountsByProductId[detailProduct.id] ?? 0)
                        : 0
                }
                canAddMore={canAddMore}
                categoryLimitReached={categoryLimitReached}
                categoryRequiredCount={categoryRequiredCount}
                onAddGiftProduct={onAddProduct}
                onRemoveGiftProduct={onRemoveProduct}
            />
        </>
    );
}
