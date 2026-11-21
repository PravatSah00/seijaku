import { Suspense } from "react";
import { fetchGiftPresets } from "@/src/lib/gift-presets";
import GiftsClient from "./GiftsClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const presets = await fetchGiftPresets();

  return (
    <Suspense fallback={null}>
      <GiftsClient presets={presets} />
    </Suspense>
  );
}
