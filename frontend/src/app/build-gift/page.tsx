import { Suspense } from "react";
import { fetchProducts, type ProductView } from "@/src/lib/product-types";
import { fetchBridgePage } from "@/src/lib/bridge-page-types";
import BuildGiftClient from "./components/BuildGiftClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [allProducts, scarvesBridge, perfumesBridge, dokraBridge, diffusersBridge] =
    await Promise.all([
      fetchProducts().catch(() => [] as ProductView[]),
      fetchBridgePage("scarves-and-squares").catch(() => null),
      fetchBridgePage("perfumes").catch(() => null),
      fetchBridgePage("dokra-ornaments").catch(() => null),
      fetchBridgePage("diffusers").catch(() => null),
    ]);

  const productMap = new Map<string, ProductView>();
  for (const product of allProducts) {
    productMap.set(product.id, product);
  }

  // Ensure products linked to each bridge page have their bridgeCategory tagged
  for (const product of scarvesBridge?.products ?? []) {
    const existing = productMap.get(product.id);
    productMap.set(product.id, {
      ...(existing ?? product),
      bridgeCategory: "scarves-and-squares",
    });
  }
  for (const product of perfumesBridge?.products ?? []) {
    const existing = productMap.get(product.id);
    productMap.set(product.id, {
      ...(existing ?? product),
      bridgeCategory: "perfumes",
    });
  }
  for (const product of dokraBridge?.products ?? []) {
    const existing = productMap.get(product.id);
    productMap.set(product.id, {
      ...(existing ?? product),
      bridgeCategory: "dokra-ornaments",
    });
  }
  for (const product of diffusersBridge?.products ?? []) {
    const existing = productMap.get(product.id);
    productMap.set(product.id, {
      ...(existing ?? product),
      bridgeCategory: "diffusers",
    });
  }

  const products = Array.from(productMap.values());

  return (
    <Suspense fallback={null}>
      <BuildGiftClient products={products} />
    </Suspense>
  );
}