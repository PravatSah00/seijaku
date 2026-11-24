import AdminPage from "@/src/components/admin/AdminPage";
import BuildGiftManager from "@/src/components/admin/BuildGiftManager";
import { adminBackendJson } from "@/src/lib/admin-backend";
import { requireCurrentAdmin } from "@/src/lib/admin-session";
import type { ProductSummary, SiteSettings } from "@/src/lib/admin-types";

export const dynamic = "force-dynamic";

export default async function AdminBuildGiftPage() {
  await requireCurrentAdmin();
  const [productsData, settingsData] = await Promise.all([
    adminBackendJson<{ items: ProductSummary[] }>("/products?workflow=published").catch(
      () => ({ items: [] as ProductSummary[] }),
    ),
    adminBackendJson<{ item: SiteSettings }>("/site-settings").catch(
      () => ({ item: {} as SiteSettings }),
    ),
  ]);

  return (
    <AdminPage
      title="Build-A-Gift Curation & Rituals"
      description="Curate products for each category and customize the Three Ways to Gift rituals shown on /gifts and /build-gift."
    >
      <BuildGiftManager
        initialProducts={productsData.items}
        initialSettings={settingsData.item}
      />
    </AdminPage>
  );
}
