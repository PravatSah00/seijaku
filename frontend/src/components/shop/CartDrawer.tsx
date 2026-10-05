"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { canonicalShopRoutes } from "@/src/lib/shop-routes";
import { useShopState } from "./ShopStateProvider";

export default function CartDrawer() {
  const router = useRouter();
  const {
    cart,
    cartCount,
    cartSubtotal,
    isCartOpen,
    closeCart,
    updateCartQuantity,
    removeFromCart,
    clearCheckout,
  } = useShopState();

  // Lock scroll when open
  useEffect(() => {
    if (!isCartOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  const handleProceedToCheckout = () => {
    // Clear single item override so checkout uses whole cart
    clearCheckout();
    closeCart();
    router.push(canonicalShopRoutes.checkout);
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isCartOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
      }`}
      aria-hidden={!isCartOpen}
    >
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed bottom-0 right-0 top-0 flex w-full max-w-[480px] flex-col bg-[#faf7f1] text-[#1f1a16] shadow-2xl transition-transform duration-300 ease-out sm:border-l sm:border-[#d8cec1] ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2d7c7] px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <ShoppingBag size={19} className="text-[#2e4a36]" />
            <h2 className="font-serif text-[22px] tracking-[-0.02em] text-[#1d1a17]">
              Shopping Bag
            </h2>
            {cartCount > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-[#2e4a36] px-2 text-[10px] font-bold text-[#fcfaf6]">
                {cartCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(111,100,86,0.2)] text-[#5f584f] transition hover:bg-black/5 hover:text-[#1d1a17]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Free Shipping & Assurance Banner */}
        <div className="border-b border-[#e2d7c7] bg-[#f2eadf] px-6 py-3 text-xs text-[#5d554b] sm:px-8">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck size={14} className="text-[#2e4a36]" />
            <span>Complimentary insured shipping & ritual packaging across India</span>
          </div>
        </div>

        {/* Items List / Empty State */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ebdcd0]/70 text-[#9a785d]">
                <ShoppingBag size={28} strokeWidth={1.5} />
              </div>
              <p className="mt-5 font-serif text-[24px] text-[#1d1a17]">Your bag is quiet</p>
              <p className="mt-2 max-w-[28ch] text-[14px] leading-[1.7] text-[#625b53]">
                Objects of stillness and artisan craft you select will gather here.
              </p>

              <div className="mt-8 flex w-full flex-col gap-2.5">
                <Link
                  href={canonicalShopRoutes.perfumes}
                  onClick={closeCart}
                  className="rounded-full border border-[#2e4a36]/30 bg-white/80 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-[#2e4a36] transition hover:bg-[#2e4a36] hover:text-[#f4efe8]"
                >
                  Explore Natural Perfumes
                </Link>
                <Link
                  href={canonicalShopRoutes.diffusers}
                  onClick={closeCart}
                  className="rounded-full border border-[#2e4a36]/30 bg-white/80 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-[#2e4a36] transition hover:bg-[#2e4a36] hover:text-[#f4efe8]"
                >
                  Explore Bronze Diffusers
                </Link>
                <Link
                  href={canonicalShopRoutes.shopAll}
                  onClick={closeCart}
                  className="rounded-full bg-[#2e4a36] py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-[#f4efe8] transition hover:bg-[#21382c]"
                >
                  Browse Shop All
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-[#e2d7c7] bg-white p-4 transition"
                >
                  {/* Image Thumbnail */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#f2eadf]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#9a785d]">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/shop?item=${encodeURIComponent(item.productSlug)}`}
                          onClick={closeCart}
                          className="font-serif text-[17px] leading-[1.25] text-[#1d1a17] transition hover:text-[#2e4a36]"
                        >
                          {item.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                          className="p-1 text-[#8c8275] transition hover:text-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {item.variantLabel && (
                        <p className="mt-1 text-[12px] font-medium text-[#7a6a58]">
                          {item.variantLabel}
                        </p>
                      )}

                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(item.selectedOptions).map(([k, v]) => (
                            <span
                              key={k}
                              className="rounded-md bg-[#f3efe7] px-1.5 py-0.5 text-[10px] text-[#625b53]"
                            >
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity & Price */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-[#cfc3b4] bg-[#faf7f1]">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-[#5f584f] transition hover:text-[#1d1a17]"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-[#1f1a16]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-[#5f584f] transition hover:text-[#1d1a17]"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <p className="text-[14px] font-semibold text-[#1d1a17]">
                        INR {(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-[#e2d7c7] bg-[#f5efe5] p-6 sm:px-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[15px] font-semibold text-[#1d1a17]">
                <span>Estimated Subtotal</span>
                <span>INR {cartSubtotal.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[11px] text-[#7a7064]">
                Taxes included. Delivery charges calculated at checkout.
              </p>
            </div>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2e4a36] py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-[#f4efe8] transition hover:bg-[#21382c]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} />
              </button>

              <Link
                href={canonicalShopRoutes.cart}
                onClick={closeCart}
                className="flex w-full items-center justify-center rounded-full border border-[#2e4a36]/25 bg-white/70 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-[#2e4a36] transition hover:bg-white"
              >
                View Full Cart
              </Link>
            </div>

            {/* Bulk Order hint */}
            <div className="mt-4 border-t border-[#d8cec1]/60 pt-3 text-center">
              <Link
                href={canonicalShopRoutes.bulkOrders}
                onClick={closeCart}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#7a6448] underline decoration-[#7a6448]/30 underline-offset-4 hover:text-[#5a4630]"
              >
                <Sparkles size={12} />
                <span>Need 20+ units for corporate or festive gifting? Inquire here</span>
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
