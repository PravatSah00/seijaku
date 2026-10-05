import type { ShopBridgeSlug } from "@/src/lib/bridge-page-types";

// Re-exported so downstream importers have a stable import site.
// Canonical definition lives in bridge-page-types.ts.
export type { ShopBridgeSlug };

export const canonicalShopRoutes = {
  shopAll: "/shop",
  lifestyle: "/shop/lifestyle",
  perfumes: "/shop/perfumes",
  scarvesAndSquares: "/shop/scarves-and-squares",
  diffusers: "/shop/diffusers",
  dokraOrnaments: "/shop/dokra-ornaments",
  seasonaldrops: "/shop/seasonaldrops",
  checkout: "/checkout",
  cart: "/cart",
  bulkOrders: "/bulk-orders",
  collection: "/collection",
} as const;
