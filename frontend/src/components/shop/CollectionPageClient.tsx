"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Heart, Trash2, ShieldCheck, UserCheck, ArrowLeft, ShoppingBag } from "lucide-react";

import { canonicalShopRoutes } from "@/src/lib/shop-routes";
import {
  normalizeBackendProduct,
  type BackendProduct,
  type ProductView,
} from "@/src/lib/product-types";
import { useCustomerAuth } from "@/src/lib/customer-auth";

import EditorialProductRow from "./EditorialProductRow";
import ProductDetailDrawer from "./ProductDetailDrawer";
import { useShopState } from "./ShopStateProvider";

export default function CollectionPageClient() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { collection, clearCollection } = useShopState();
  const { customer, isAuthenticated } = useCustomerAuth();

  const [productsBySlug, setProductsBySlug] = useState<Record<string, ProductView>>({});
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(collection.length > 0);

  // Resolve each collected slug against the backend in parallel.
  useEffect(() => {
    if (collection.length === 0) {
      setProductsBySlug({});
      setIsInitialLoading(false);
      return;
    }
    setIsInitialLoading(true);
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        collection.map(async (slug) => {
          try {
            const res = await fetch(`/api/public/catalog/products/${encodeURIComponent(slug)}`, {
              headers: { Accept: "application/json" },
            });
            if (!res.ok) return null;
            const body = (await res.json()) as { item: BackendProduct };
            const view = normalizeBackendProduct(body.item);
            return view ? ([slug, view] as const) : null;
          } catch {
            return null;
          }
        }),
      );
      if (cancelled) return;
      const map: Record<string, ProductView> = {};
      for (const entry of entries) {
        if (entry) map[entry[0]] = entry[1];
      }
      setProductsBySlug(map);
      setIsInitialLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [collection]);

  const items = useMemo(
    () => collection.map((slug) => productsBySlug[slug]).filter((p): p is ProductView => Boolean(p)),
    [collection, productsBySlug],
  );

  const selectedSlug = searchParams.get("item");
  const selectedItem = selectedSlug ? productsBySlug[selectedSlug] ?? null : null;

  const updateQuery = (slug?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (slug) {
      params.set("item", slug);
    } else {
      params.delete("item");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <>
      <main className="min-h-screen bg-[#f3efe7] pt-[72px] text-[#3a3a3a] sm:pt-[76px]">
        <section className="section-primary pb-8 pt-20 sm:pt-24">
          <div className="page-container max-w-[1180px]">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#9a785d]">Wishlist Sanctuary</p>
                  <span className="flex h-5 items-center justify-center rounded-full bg-[#9a785d]/20 px-2 text-[10px] font-semibold text-[#9a785d]">
                    {collection.length}
                  </span>
                </div>
                <h1 className="mt-4 text-[clamp(36px,4.5vw,56px)] leading-[1.04] tracking-[-0.03em] text-[#1d1a17]">
                  Saved for Later
                </h1>
                <p className="mt-4 max-w-[50ch] text-[15px] leading-[1.8] text-[#5f584f]">
                  Your wishlisted objects remain here so you can compare calmly and move into checkout only when the choice feels clear.
                </p>
              </div>

              {items.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={clearCollection}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(111,100,86,0.2)] bg-white/50 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[#7a7064] transition hover:bg-white hover:text-rose-700"
                  >
                    <Trash2 size={13} />
                    <span>Clear Wishlist</span>
                  </button>
                  <Link
                    href={canonicalShopRoutes.shopAll}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#294536]/25 bg-white/70 px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#294536] transition hover:bg-[#294536] hover:text-[#f4efe8]"
                  >
                    <ShoppingBag size={13} />
                    <span>Continue Browsing</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Sync / Account Banner */}
            <div className="mt-8 rounded-2xl border border-[rgba(111,100,86,0.14)] bg-[linear-gradient(90deg,#f9f6f0_0%,#f5eee3_100%)] p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {isAuthenticated ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                      <UserCheck size={16} />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ebdcd0] text-[#9a785d]">
                      <ShieldCheck size={16} />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-[#1d1a17]">
                      {isAuthenticated
                        ? `Synced with ${customer?.name || customer?.email}`
                        : "Your wishlist is stored locally on this browser"}
                    </p>
                    <p className="text-[11px] text-[#7a7064]">
                      {isAuthenticated
                        ? "Any additions will automatically synchronize across your phone, tablet, and computer."
                        : "Sign in to save your wishlist securely and access it from any device."}
                    </p>
                  </div>
                </div>

                {!isAuthenticated && (
                  <Link
                    href="/auth?redirect=/collection"
                    className="inline-flex items-center justify-center rounded-full bg-[#294536] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#f4efe8] transition hover:bg-[#21382c]"
                  >
                    Sign In to Sync
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="section-primary pt-0">
          <div className="page-container max-w-[1180px]">
            {isInitialLoading ? (
              <div className="rounded-[30px] border border-[#d8cec1] bg-[#faf7f1] px-8 py-16 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#294536] border-t-transparent" />
                <p className="mt-4 text-[14px] leading-[1.85] text-[#625b53]">Loading your saved collection…</p>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-[30px] border border-[#d8cec1] bg-[#faf7f1] px-8 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ebdcd0]/60 text-[#9a785d]">
                  <Heart size={26} />
                </div>
                <h2 className="mt-5 font-serif text-[28px] leading-[1.14] tracking-[-0.02em] text-[#1f1a16] sm:text-[32px]">
                  Your wishlist is quiet for now
                </h2>
                <p className="mx-auto mt-3 max-w-[42ch] text-[15px] leading-[1.8] text-[#625b53]">
                  Mark any fragrance, handcrafted textile, or ritual object while browsing and they will gather here safely.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={canonicalShopRoutes.perfumes}
                    className="inline-flex items-center justify-center rounded-full border border-[#2e4a36]/30 bg-white px-5 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#2e4a36] hover:bg-[#2e4a36] hover:text-[#f4efe8]"
                  >
                    Explore Perfumes
                  </Link>
                  <Link
                    href={canonicalShopRoutes.diffusers}
                    className="inline-flex items-center justify-center rounded-full border border-[#2e4a36]/30 bg-white px-5 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#2e4a36] hover:bg-[#2e4a36] hover:text-[#f4efe8]"
                  >
                    Explore Diffusers
                  </Link>
                  <Link
                    href={canonicalShopRoutes.shopAll}
                    className="inline-flex items-center justify-center rounded-full bg-[#2e4a36] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#f4efe8] hover:bg-[#243c2c]"
                  >
                    Shop All Objects
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item, index) => (
                  <EditorialProductRow key={item.slug} item={item} index={index} onViewDetails={updateQuery} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <ProductDetailDrawer item={selectedItem} isOpen={Boolean(selectedItem)} onClose={() => updateQuery()} />
    </>
  );
}
