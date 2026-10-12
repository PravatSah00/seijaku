import { Suspense } from "react";
import { fetchProducts } from "@/src/lib/product-types";
import BuildGiftClient from "./components/BuildGiftClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const products = await fetchProducts();
  return (
    <Suspense fallback={null}>
      <BuildGiftClient products={products} />
    </Suspense>
  );
}