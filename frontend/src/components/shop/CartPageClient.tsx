"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, ArrowLeft } from "lucide-react";

import { canonicalShopRoutes } from "@/src/lib/shop-routes";
import { useShopState } from "./ShopStateProvider";

export default function CartPageClient() {
  const router = useRouter();
  const {
    cart,
    cartCount,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    clearCheckout,
  } = useShopState();

  const handleCheckout = () => {
    clearCheckout();
    router.push(canonicalShopRoutes.checkout);
  };

  return (
    <main className="min-h-screen bg-[#f3efe7] pt-[72px] text-[#3a3a3a] sm:pt-[76px]">
      <section className="section-primary pb-16 pt-20 sm:pt-24">
        <div className="page-container max-w-[1200px]">
          {/* Header */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#9a785d]">Shopping Sanctuary</p>
                {cartCount > 0 && (
                  <span className="flex h-5 items-center justify-center rounded-full bg-[#2e4a36] px-2 text-[10px] font-semibold text-[#f4efe8]">
                    {cartCount} {cartCount === 1 ? "Item" : "Items"}
                  </span>
                )}
              </div>
              <h1 className="mt-4 text-[clamp(36px,4.5vw,56px)] leading-[1.04] tracking-[-0.03em] text-[#1d1a17]">
                Your Shopping Bag
              </h1>
              <p className="mt-4 max-w-[50ch] text-[15px] leading-[1.8] text-[#5f584f]">
                Review the handcrafted objects and ritual formulations gathered for your daily space.
              </p>
            </div>

            {cart.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={clearCart}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(111,100,86,0.2)] bg-white/50 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[#7a7064] transition hover:bg-white hover:text-rose-700"
                >
                  <Trash2 size={13} />
                  <span>Clear Bag</span>
                </button>
                <Link
                  href={canonicalShopRoutes.shopAll}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#294536]/25 bg-white/70 px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#294536] transition hover:bg-[#294536] hover:text-[#f4efe8]"
                >
                  <ArrowLeft size={13} />
                  <span>Continue Browsing</span>
                </Link>
              </div>
            )}
          </div>

          {/* Cart Content */}
          {cart.length === 0 ? (
            <div className="mt-12 rounded-[30px] border border-[#d8cec1] bg-[#faf7f1] px-8 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ebdcd0]/60 text-[#9a785d]">
                <ShoppingBag size={30} strokeWidth={1.5} />
              </div>
              <h2 className="mt-6 font-serif text-[30px] leading-[1.14] tracking-[-0.02em] text-[#1f1a16] sm:text-[34px]">
                Your shopping bag is quiet
              </h2>
              <p className="mx-auto mt-3 max-w-[42ch] text-[15px] leading-[1.8] text-[#625b53]">
                Discover natural fragrances, bronze objects, and handwoven textiles to begin crafting your sensory space.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={canonicalShopRoutes.perfumes}
                  className="inline-flex items-center justify-center rounded-full border border-[#2e4a36]/30 bg-white px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#2e4a36] transition hover:bg-[#2e4a36] hover:text-[#f4efe8]"
                >
                  Explore Perfumes
                </Link>
                <Link
                  href={canonicalShopRoutes.diffusers}
                  className="inline-flex items-center justify-center rounded-full border border-[#2e4a36]/30 bg-white px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#2e4a36] transition hover:bg-[#2e4a36] hover:text-[#f4efe8]"
                >
                  Explore Diffusers
                </Link>
                <Link
                  href={canonicalShopRoutes.shopAll}
                  className="inline-flex items-center justify-center rounded-full bg-[#2e4a36] px-7 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#f4efe8] transition hover:bg-[#243c2c]"
                >
                  Shop All Objects
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Left Column: Cart Line Items */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-[24px] border border-[#d8cec1] bg-[#faf7f1] p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-[#f2eadf]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#9a785d]">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/shop?item=${encodeURIComponent(item.productSlug)}`}
                          className="font-serif text-[20px] leading-[1.2] text-[#1d1a17] transition hover:text-[#2e4a36]"
                        >
                          {item.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                          className="p-1.5 text-[#8c8275] transition hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {item.shortDescription && (
                        <p className="line-clamp-1 text-[13px] text-[#6b6256]">
                          {item.shortDescription}
                        </p>
                      )}

                      {item.variantLabel && (
                        <div className="pt-1">
                          <span className="rounded-md bg-[#f0e7dc] px-2 py-0.5 text-[11px] font-medium text-[#6a5b4c]">
                            {item.variantLabel}
                          </span>
                        </div>
                      )}

                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Object.entries(item.selectedOptions).map(([k, v]) => (
                            <span
                              key={k}
                              className="rounded-md bg-[#f2eadf] px-2 py-0.5 text-[11px] text-[#605548]"
                            >
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity & Unit Price */}
                    <div className="flex items-center justify-between border-t border-[#e8dfd3] pt-3 sm:flex-col sm:items-end sm:justify-center sm:border-0 sm:pt-0">
                      <div className="flex items-center rounded-full border border-[#cfc3b4] bg-white">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-[#5f584f] transition hover:text-[#1d1a17]"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-[#1f1a16]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-[#5f584f] transition hover:text-[#1d1a17]"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="text-right sm:mt-3">
                        <p className="text-[16px] font-semibold text-[#1d1a17]">
                          INR {(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[11px] text-[#8a7f72]">
                            (INR {item.unitPrice.toLocaleString("en-IN")} each)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="space-y-6">
                <div className="rounded-[28px] border border-[#d8cec1] bg-[#eae3d8] p-7 sm:p-8">
                  <h2 className="text-[11px] uppercase tracking-[0.24em] text-[#7a6a58]">
                    Order Summary
                  </h2>

                  <div className="mt-6 space-y-4 text-[14px] leading-[1.8] text-[#5d554b]">
                    <div className="flex items-center justify-between">
                      <span>Subtotal ({cartCount} {cartCount === 1 ? "item" : "items"})</span>
                      <span className="font-semibold text-[#1d1a17]">
                        INR {cartSubtotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Shipping Estimation</span>
                      <span className="text-right text-[13px] text-[#6c6157]">
                        Calculated at checkout
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Goods & Services Tax (GST)</span>
                      <span className="text-right text-[13px] text-[#6c6157]">
                        Included in price
                      </span>
                    </div>

                    <div className="h-px bg-black/8" />

                    <div className="flex items-center justify-between text-[17px] font-semibold text-[#1f1a16]">
                      <span>Estimated Total</span>
                      <span>INR {cartSubtotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2e4a36] py-4 text-xs font-medium uppercase tracking-[0.18em] text-[#f4efe8] transition hover:bg-[#21382c]"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight size={14} />
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-center text-[12px] text-[#6a6054]">
                      <ShieldCheck size={14} className="text-[#2e4a36]" />
                      <span>Insured dispatch & 100% genuine artisanal promise</span>
                    </div>
                  </div>
                </div>

                {/* Bulk Order Card */}
                <div className="rounded-[24px] border border-[rgba(111,100,86,0.18)] bg-[linear-gradient(135deg,#fcfaf6_0%,#f5eee3_100%)] p-6">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#ebdcd0] text-[#9a785d]">
                      <Sparkles size={17} />
                    </div>
                    <div>
                      <h3 className="font-serif text-[18px] text-[#1d1a17]">
                        Corporate & Event Gifting
                      </h3>
                      <p className="mt-1 text-[13px] leading-[1.65] text-[#625b53]">
                        Looking to place an order of 20+ units with bespoke scenting, custom monogramming, or luxury wooden packaging?
                      </p>
                      <Link
                        href={canonicalShopRoutes.bulkOrders}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.16em] text-[#2e4a36] underline decoration-[#2e4a36]/30 underline-offset-4 hover:text-[#21382c]"
                      >
                        <span>Request a Bulk Quote</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
