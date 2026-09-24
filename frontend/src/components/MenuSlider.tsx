"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { canonicalShopRoutes } from "@/src/lib/shop-routes";
import { drawerSections } from "@/src/lib/navigation";

type MenuSliderProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MenuSlider({ isOpen, onClose }: MenuSliderProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Fragrances: true,
    "Gift Sets": true,
  });

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div
      className={`menuOverlay transition-opacity duration-300 ease-out ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <div className={`menuBackdrop ${isOpen ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`menuDrawer ${isOpen ? "is-open" : ""}`} id="seijaku-drawer">
        <div className="menuDrawerInner">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[rgba(35,35,31,0.78)]">Explore Seijaku</p>
          <div className="mt-4 h-px w-full bg-[rgba(71,67,60,0.14)]" />

          <div className="mt-7 space-y-7">
            {drawerSections.map((section) => (
              <section key={section.label}>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[rgba(79,73,66,0.8)]">{section.label}</p>
                <div className="mt-4 space-y-2.5">
                  {section.entries.map((entry) => {
                    const isGroup = Boolean(entry.children?.length);
                    const isOpenGroup = openGroups[entry.label] ?? false;

                    if (isGroup) {
                      return (
                        <div key={entry.label} className="rounded-[18px] border border-[rgba(120,110,94,0.1)] bg-[rgba(255,255,255,0.18)] px-4 py-3.5">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between gap-4 text-left"
                            onClick={() => toggleGroup(entry.label)}
                            aria-expanded={isOpenGroup}
                          >
                            <span className="font-serif text-[21px] leading-[1.14] tracking-[-0.018em] text-[rgba(28,29,27,0.94)] sm:text-[22px]">
                              {entry.label}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-[rgba(65,62,56,0.62)]">
                              {isOpenGroup ? "Hide" : "Show"}
                            </span>
                          </button>

                          {isOpenGroup && (
                            <ul className="mt-3.5 space-y-2 pl-3">
                              {entry.children?.map((child) => (
                                <li key={child.label}>
                                  <Link
                                    href={child.href}
                                    className="text-[13px] leading-[1.68] text-[rgba(56,54,48,0.84)] transition-opacity duration-200 hover:opacity-70"
                                    onClick={onClose}
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={entry.label} className="px-1 py-0.5">
                        <Link
                          href={entry.href ?? canonicalShopRoutes.shopAll}
                          className="font-serif text-[21px] leading-[1.16] tracking-[-0.018em] text-[rgba(28,29,27,0.94)] transition-opacity duration-200 hover:opacity-74 sm:text-[22px]"
                          onClick={onClose}
                        >
                          {entry.label}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 border-t border-[rgba(71,67,60,0.14)] pt-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[rgba(79,73,66,0.8)]">Sanctuary</p>
            <div className="mt-4 flex flex-col space-y-3">
              <Link
                href="/account"
                onClick={onClose}
                className="font-serif text-[19px] text-[rgba(28,29,27,0.94)] transition-opacity hover:opacity-70"
              >
                My Account
              </Link>
              <Link
                href={canonicalShopRoutes.collection}
                onClick={onClose}
                className="font-serif text-[19px] text-[rgba(28,29,27,0.94)] transition-opacity hover:opacity-70"
              >
                Saved Wishlist
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

