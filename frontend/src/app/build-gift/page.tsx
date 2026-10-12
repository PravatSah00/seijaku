import { fetchProducts } from "@/src/lib/product-types";
import BuildGiftClient from "./components/BuildGiftClient";

export default async function Page() {
  const products = await fetchProducts();
  return <BuildGiftClient products={products} />;
}