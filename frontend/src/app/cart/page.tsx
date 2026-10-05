import { Suspense } from "react";
import CartPageClient from "@/src/components/shop/CartPageClient";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <CartPageClient />
    </Suspense>
  );
}
