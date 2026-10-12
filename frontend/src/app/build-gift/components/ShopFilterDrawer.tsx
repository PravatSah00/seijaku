"use client";

import { useEffect, useRef } from "react";

import ShopFilterRail, { type ShopFilterRailProps } from "./ShopFilterRail";

type ShopFilterDrawerProps = Omit<ShopFilterRailProps, "onCollapse" | "variant"> & {
  isOpen: boolean;
  onClose: () => void;
};

export default function ShopFilterDrawer({ isOpen, onClose, ...railProps }: ShopFilterDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 80);

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filter products"
      className={`fixed inset-0 z-[70] transition-opacity duration-200 lg:hidden ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button type="button" aria-label="Close filters" className="absolute inset-0 bg-[rgba(21,18,15,0.42)]" onClick={onClose} />

      <aside
        className={`absolute inset-y-0 right-0 flex h-full w-full max-w-[420px] flex-col bg-[#f3efe7] shadow-[-20px_0_45px_rgba(27,23,19,0.16)] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#5a5148]">Filter products</p>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-full border border-[rgba(111,100,86,0.14)] bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[#5a5148] transition-colors duration-200 hover:border-[rgba(96,86,74,0.22)] hover:bg-[#f8f2e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c7b68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3efe7]"
          >
            Done
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ShopFilterRail {...railProps} variant="drawer" />
        </div>
      </aside>
    </div>
  );
}
