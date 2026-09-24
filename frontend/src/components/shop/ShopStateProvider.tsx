"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useCustomerAuth } from "@/src/lib/customer-auth";

type ShopStateContextValue = {
  collection: string[];
  checkoutItemSlug: string | null;
  checkoutVariantLabel: string | null;
  checkoutSelectedOptions: Record<string, string> | null;
  isCollected: (slug: string) => boolean;
  toggleCollection: (slug: string) => void;
  addToCollection: (slug: string) => void;
  removeFromCollection: (slug: string) => void;
  clearCollection: () => void;
  beginCheckout: (slug: string, selection?: { label?: string | null; options?: Record<string, string> | null }) => void;
  clearCheckout: () => void;
};

const COLLECTION_KEY = "seijaku-collection";
const CHECKOUT_KEY = "seijaku-checkout-item";
const CHECKOUT_VARIANT_KEY = "seijaku-checkout-variant";
const CHECKOUT_OPTIONS_KEY = "seijaku-checkout-options";

const ShopStateContext = createContext<ShopStateContextValue | null>(null);

function readStorageArray(key: string) {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [] as string[];
  }
}

function readStorageString(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(key);
}

function readStorageRecord(key: string) {
  if (typeof window === "undefined") {
    return null as Record<string, string> | null;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as Record<string, string>) : null;
  } catch {
    return null as Record<string, string> | null;
  }
}

export function ShopStateProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useCustomerAuth();
  const [collection, setCollection] = useState<string[]>(() => readStorageArray(COLLECTION_KEY));
  const [checkoutItemSlug, setCheckoutItemSlug] = useState<string | null>(() => readStorageString(CHECKOUT_KEY));
  const [checkoutVariantLabel, setCheckoutVariantLabel] = useState<string | null>(() => readStorageString(CHECKOUT_VARIANT_KEY));
  const [checkoutSelectedOptions, setCheckoutSelectedOptions] = useState<Record<string, string> | null>(() => readStorageRecord(CHECKOUT_OPTIONS_KEY));
  const isSyncingRef = useRef(false);

  // Sync wishlist with backend whenever customer logs in or token is active
  useEffect(() => {
    if (!token || !isAuthenticated || isSyncingRef.current) return;

    let cancelled = false;
    isSyncingRef.current = true;

    async function syncBackendWishlist() {
      try {
        const localSlugs = readStorageArray(COLLECTION_KEY);
        const res = await fetch("/api/public/customer/wishlist/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ slugs: localSlugs }),
        });

        if (res.ok && !cancelled) {
          const data = await res.json();
          if (Array.isArray(data.slugs)) {
            setCollection(data.slugs);
            if (typeof window !== "undefined") {
              window.localStorage.setItem(COLLECTION_KEY, JSON.stringify(data.slugs));
            }
          }
        }
      } catch (err) {
        console.error("Failed to sync customer wishlist", err);
      } finally {
        isSyncingRef.current = false;
      }
    }

    syncBackendWishlist();

    return () => {
      cancelled = true;
    };
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (checkoutItemSlug) {
      window.localStorage.setItem(CHECKOUT_KEY, checkoutItemSlug);
      return;
    }

    window.localStorage.removeItem(CHECKOUT_KEY);
  }, [checkoutItemSlug]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (checkoutVariantLabel) {
      window.localStorage.setItem(CHECKOUT_VARIANT_KEY, checkoutVariantLabel);
      return;
    }

    window.localStorage.removeItem(CHECKOUT_VARIANT_KEY);
  }, [checkoutVariantLabel]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (checkoutSelectedOptions && Object.keys(checkoutSelectedOptions).length > 0) {
      window.localStorage.setItem(CHECKOUT_OPTIONS_KEY, JSON.stringify(checkoutSelectedOptions));
      return;
    }

    window.localStorage.removeItem(CHECKOUT_OPTIONS_KEY);
  }, [checkoutSelectedOptions]);

  const toggleCollection = useCallback(
    (slug: string) => {
      const isAlreadyIn = collection.includes(slug);
      const updated = isAlreadyIn
        ? collection.filter((entry) => entry !== slug)
        : [...collection, slug];

      setCollection(updated);

      if (token) {
        if (isAlreadyIn) {
          fetch(`/api/public/customer/wishlist/${encodeURIComponent(slug)}`, {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }).catch((err) => console.error("Wishlist remove error", err));
        } else {
          fetch("/api/public/customer/wishlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productSlug: slug }),
          }).catch((err) => console.error("Wishlist add error", err));
        }
      }
    },
    [collection, token]
  );

  const addToCollection = useCallback(
    (slug: string) => {
      if (!collection.includes(slug)) {
        toggleCollection(slug);
      }
    },
    [collection, toggleCollection]
  );

  const removeFromCollection = useCallback(
    (slug: string) => {
      if (collection.includes(slug)) {
        toggleCollection(slug);
      }
    },
    [collection, toggleCollection]
  );

  const clearCollection = useCallback(() => {
    setCollection([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(COLLECTION_KEY);
    }
  }, []);

  const value = useMemo<ShopStateContextValue>(
    () => ({
      collection,
      checkoutItemSlug,
      checkoutVariantLabel,
      checkoutSelectedOptions,
      isCollected: (slug) => collection.includes(slug),
      toggleCollection,
      addToCollection,
      removeFromCollection,
      clearCollection,
      beginCheckout: (slug, selection) => {
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(CHECKOUT_KEY, slug);
            if (selection?.label) {
              window.localStorage.setItem(CHECKOUT_VARIANT_KEY, selection.label);
            } else {
              window.localStorage.removeItem(CHECKOUT_VARIANT_KEY);
            }
            if (selection?.options && Object.keys(selection.options).length > 0) {
              window.localStorage.setItem(CHECKOUT_OPTIONS_KEY, JSON.stringify(selection.options));
            } else {
              window.localStorage.removeItem(CHECKOUT_OPTIONS_KEY);
            }
          } catch {
            // Private browsing or storage disabled
          }
        }
        setCheckoutItemSlug(slug);
        setCheckoutVariantLabel(selection?.label ?? null);
        setCheckoutSelectedOptions(selection?.options ?? null);
      },
      clearCheckout: () => {
        setCheckoutItemSlug(null);
        setCheckoutVariantLabel(null);
        setCheckoutSelectedOptions(null);
      },
    }),
    [
      checkoutItemSlug,
      checkoutSelectedOptions,
      checkoutVariantLabel,
      collection,
      toggleCollection,
      addToCollection,
      removeFromCollection,
      clearCollection,
    ]
  );

  return <ShopStateContext.Provider value={value}>{children}</ShopStateContext.Provider>;
}

export function useShopState() {
  const context = useContext(ShopStateContext);

  if (!context) {
    throw new Error("useShopState must be used within ShopStateProvider");
  }

  return context;
}
