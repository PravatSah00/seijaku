"use client";

import { PanelLeftClose, Search } from "lucide-react";

import type {
    ShopPriceFilterOption,
    ShopSortOption,
    ShopTypeFilterOption,
} from "@/src/lib/shop-taxonomy";

import ShopFilterSection from "./ShopFilterSection";

export type ShopFilterRailProps = {
    searchValue: string;
    onSearchChange: (value: string) => void;
    selectedType: ShopTypeFilterOption | "All";
    onTypeChange: (value: ShopTypeFilterOption | "All") => void;
    selectedPrice: ShopPriceFilterOption | "All";
    onPriceChange: (value: ShopPriceFilterOption | "All") => void;
    sortBy: ShopSortOption;
    onSortChange: (value: ShopSortOption) => void;
    types: ShopTypeFilterOption[];
    prices: ShopPriceFilterOption[];
    sortOptions: readonly ShopSortOption[];
    onReset: () => void;
    hasActiveFilters: boolean;
    onCollapse?: () => void;
    variant?: "rail" | "drawer";
};

export default function ShopFilterRail({
    searchValue,
    onSearchChange,
    selectedType,
    onTypeChange,
    selectedPrice,
    onPriceChange,
    sortBy,
    onSortChange,
    types,
    prices,
    sortOptions,
    onReset,
    hasActiveFilters,
    onCollapse,
    variant = "rail",
}: ShopFilterRailProps) {
    const isDrawer = variant === "drawer";

    return (
        <div
            className={
                isDrawer
                    ? "flex h-full flex-col"
                    : "sticky top-[88px] max-h-[calc(100vh-112px)] overflow-y-auto rounded-[24px] border border-[rgba(111,100,86,0.1)] bg-[linear-gradient(180deg,rgba(250,246,239,0.96),rgba(243,236,227,0.96))] p-5 shadow-[0_10px_26px_rgba(54,45,34,0.05)] sm:top-[92px] sm:max-h-[calc(100vh-116px)] lg:p-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            }
        >
            <div
                className={`${
                    isDrawer
                        ? "border-b border-black/5 px-5 py-4 sm:px-6"
                        : ""
                } flex items-center justify-between gap-3`}
            >
                <p className="text-[10px] uppercase tracking-[0.32em] text-[#5a5148]">
                    Filter
                </p>

                {!isDrawer && onCollapse && (
                    <button
                        type="button"
                        onClick={onCollapse}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(111,100,86,0.14)] bg-[rgba(251,247,240,0.96)] px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-[#5a5148] transition-colors hover:bg-[#f8f2e9]"
                        aria-label="Hide filters"
                    >
                        <PanelLeftClose
                            aria-hidden
                            size={12}
                            strokeWidth={1.6}
                        />
                        Hide
                    </button>
                )}
            </div>

            <div
                className={`${
                    isDrawer
                        ? "flex-1 overflow-y-auto px-5 py-5 sm:px-6"
                        : "mt-5"
                } space-y-6`}
            >
                <label className="flex flex-col gap-2.5 text-[10px] uppercase tracking-[0.28em] text-[#7b7064]">
                    <span>Search</span>
                    <div className="relative">
                        <Search
                            aria-hidden
                            size={15}
                            strokeWidth={1.5}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#766b5d]"
                        />
                        <input
                            type="search"
                            value={searchValue}
                            onChange={(event) =>
                                onSearchChange(event.target.value)
                            }
                            placeholder="Search products..."
                            className="h-[46px] w-full rounded-[14px] border border-[rgba(111,100,86,0.14)] bg-white pl-10 pr-4 text-[13px] text-[#342d26] outline-none placeholder:text-[#988c7e] focus:border-[#8c7b68]"
                        />
                    </div>
                </label>

                <ShopFilterSection
                    title="Shop by Price"
                    idPrefix="shop-filter-price"
                    options={prices}
                    value={selectedPrice}
                    onChange={onPriceChange}
                />

                <ShopFilterSection
                    title="Sort"
                    idPrefix="shop-filter-sort"
                    options={sortOptions}
                    value={sortBy}
                    onChange={(value) => {
                        if (value !== "All") onSortChange(value);
                    }}
                    includeAll={false}
                />
            </div>

            <div
                className={
                    isDrawer
                        ? "border-t border-black/5 px-5 py-4 sm:px-6"
                        : "mt-7 border-t border-[rgba(76,67,57,0.08)] pt-5"
                }
            >
                <button
                    type="button"
                    onClick={onReset}
                    disabled={!hasActiveFilters}
                    className="w-full rounded-full border border-[rgba(111,100,86,0.14)] bg-white px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-[#4f463d] transition-colors hover:bg-[#faf7f1] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
}
