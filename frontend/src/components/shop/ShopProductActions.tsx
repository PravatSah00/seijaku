"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Check } from "lucide-react";

import { canonicalShopRoutes } from "@/src/lib/shop-routes";
import {
  hasVariantSelector,
  isNotifyMeProduct,
  isUnbuyableProduct,
  type ProductView,
} from "@/src/lib/product-types";

import NotifyMeModal from "./NotifyMeModal";
import { useShopState } from "./ShopStateProvider";

type ShopProductActionsProps = {
  item: ProductView;
  onViewDetails: () => void;
  selection?: {
    label?: string | null;
    options?: Record<string, string> | null;
  };
  isBuyDisabled?: boolean;
  buyLabel?: string;
  className?: string;
  showAddToCart?: boolean;
};

export default function ShopProductActions({
  item,
  onViewDetails,
  className = "",
}: ShopProductActionsProps) {
  const router = useRouter();
  const { isCollected, toggleCollection } = useShopState();
  const collected = isCollected(item.slug);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  const notifyMe = isNotifyMeProduct(item);
  const unbuyable = !notifyMe && isUnbuyableProduct(item);

  const handleNavigateToDetails = () => {
    if (onViewDetails) {
      onViewDetails();
      return;
    }
    router.push(`/shop/${item.slug}`);
  };

  return (
    <>
      <div className={`flex flex-wrap items-center gap-x-3 gap-y-2.5 ${className}`.trim()}>
        {notifyMe ? (
          <button
            type="button"
            onClick={() => setIsNotifyOpen(true)}
            className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#294536] px-5 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#f4efe8] transition-colors duration-200 hover:bg-[#21382c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c7b68]"
          >
            Notify Me
          </button>
        ) : unbuyable ? (
          <span className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[rgba(111,100,86,0.18)] bg-[rgba(255,255,255,0.6)] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#7a7064]">
            {item.status}
          </span>
        ) : (
          <button
            type="button"
            onClick={handleNavigateToDetails}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full bg-[#294536] px-5 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#f4efe8] transition-colors duration-200 hover:bg-[#1f3529] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c7b68]"
          >
            <span>View Details</span>
            <span aria-hidden>→</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => toggleCollection(item.slug)}
          aria-label={collected ? `Remove ${item.title} from wishlist` : `Add ${item.title} to wishlist`}
          className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3.5 py-2 text-[10px] uppercase tracking-[0.18em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c7b68] ${
            collected
              ? "border-[#2e4a36]/40 bg-[#2e4a36]/10 font-medium text-[#2e4a36]"
              : "border-[rgba(111,100,86,0.18)] bg-white/70 text-[#5d5449] hover:bg-white hover:text-[#1d1a17]"
          }`}
        >
          <Heart size={12} fill={collected ? "currentColor" : "none"} strokeWidth={2} />
          <span>{collected ? "Saved" : "Save"}</span>
        </button>
      </div>

      <NotifyMeModal item={notifyMe ? item : null} isOpen={isNotifyOpen} onClose={() => setIsNotifyOpen(false)} />
    </>
  );
}
