import { Suspense } from "react";
import type { Metadata } from "next";
import BulkOrdersPageClient from "@/src/components/shop/BulkOrdersPageClient";

export const metadata: Metadata = {
  title: "Bulk Orders & Corporate Gifting | Seijaku",
  description:
    "Explore bespoke corporate gifting, wedding favors, hospitality scenting, and wholesale inquiries with Seijaku. Handcrafted botanical formulations and artisanal objects.",
};

export const dynamic = "force-dynamic";

export default function BulkOrdersPage() {
  return (
    <Suspense fallback={null}>
      <BulkOrdersPageClient />
    </Suspense>
  );
}
