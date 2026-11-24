import { Suspense } from "react";
import { fetchProducts, type ProductView } from "@/src/lib/product-types";
import { fetchBridgePage } from "@/src/lib/bridge-page-types";
import { fetchGiftPresets, DEFAULT_GIFT_PRESETS } from "@/src/lib/gift-presets";
import BuildGiftClient from "./components/BuildGiftClient";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ type?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { type } = await searchParams;

  const [allProducts, scarvesBridge, perfumesBridge, dokraBridge, diffusersBridge, presets] =
    await Promise.all([
      fetchProducts({ cache: "no-store", revalidate: 0 }).catch(
        () => fetchProducts().catch(() => [] as ProductView[]),
      ),
      fetchBridgePage("scarves-and-squares").catch(() => null),
      fetchBridgePage("perfumes").catch(() => null),
      fetchBridgePage("dokra-ornaments").catch(() => null),
      fetchBridgePage("diffusers").catch(() => null),
      fetchGiftPresets().catch(() => DEFAULT_GIFT_PRESETS),
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
      bridgeCategory: existing?.bridgeCategory ?? "scarves-and-squares",
    });
  }
  for (const product of perfumesBridge?.products ?? []) {
    const existing = productMap.get(product.id);
    productMap.set(product.id, {
      ...(existing ?? product),
      bridgeCategory: existing?.bridgeCategory ?? "perfumes",
    });
  }
  for (const product of dokraBridge?.products ?? []) {
    const existing = productMap.get(product.id);
    productMap.set(product.id, {
      ...(existing ?? product),
      bridgeCategory: existing?.bridgeCategory ?? "dokra-ornaments",
    });
  }
  for (const product of diffusersBridge?.products ?? []) {
    const existing = productMap.get(product.id);
    productMap.set(product.id, {
      ...(existing ?? product),
      bridgeCategory: existing?.bridgeCategory ?? "diffusers",
    });
  }

  const combinedProducts = Array.from(productMap.values());
  const finalProducts = combinedProducts.length > 0 ? combinedProducts : allProducts;

  return (
    <Suspense fallback={null}>
      <BuildGiftClient
        products={finalProducts}
        presets={presets}
        initialPresetId={type}
      />
    </Suspense>
  );
}
