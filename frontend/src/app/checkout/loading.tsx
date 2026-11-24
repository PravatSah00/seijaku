export default function CheckoutLoading() {
  return (
    <main
      className="min-h-screen w-full bg-[#FAF5EE] px-4 pb-20 pt-24 text-[#2A1D1B] sm:px-6 sm:pt-28 lg:px-8 xl:px-12"
      style={{
        fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
      }}
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Checkout Header Skeleton */}
        <div className="border-b border-[#E7DCCD] pb-6 space-y-2">
          <div className="h-3 w-28 rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
          <div className="h-10 w-64 rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
        </div>

        {/* 2-Column Checkout Skeleton */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_420px]">
          {/* Left: Form Fields Skeleton */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E7DCCD] bg-[#FAF5EC] p-6 space-y-4 shadow-2xs animate-seijaku-shimmer">
              <div className="h-5 w-40 rounded bg-[#EAE0D2]" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="h-11 rounded-lg bg-[#EAE0D2]" />
                <div className="h-11 rounded-lg bg-[#EAE0D2]" />
              </div>
              <div className="h-11 rounded-lg bg-[#EAE0D2]" />
              <div className="h-11 rounded-lg bg-[#EAE0D2]" />
            </div>

            <div className="rounded-2xl border border-[#E7DCCD] bg-[#FAF5EC] p-6 space-y-4 shadow-2xs animate-seijaku-shimmer">
              <div className="h-5 w-32 rounded bg-[#EAE0D2]" />
              <div className="h-14 rounded-lg bg-[#EAE0D2]" />
              <div className="h-14 rounded-lg bg-[#EAE0D2]" />
            </div>
          </div>

          {/* Right: Order Summary Skeleton */}
          <div className="rounded-2xl border border-[#E7DCCD] bg-[#FAF5EC] p-6 space-y-4 shadow-2xs h-fit animate-seijaku-shimmer">
            <div className="h-5 w-32 rounded bg-[#EAE0D2]" />
            <div className="space-y-3 border-t border-[#E7DCCD] pt-4">
              <div className="flex gap-3">
                <div className="h-14 w-14 shrink-0 rounded-lg bg-[#EAE0D2]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-[#EAE0D2]" />
                  <div className="h-3 w-1/3 rounded bg-[#EAE0D2]" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-14 w-14 shrink-0 rounded-lg bg-[#EAE0D2]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-[#EAE0D2]" />
                  <div className="h-3 w-1/3 rounded bg-[#EAE0D2]" />
                </div>
              </div>
            </div>
            <div className="border-t border-[#E7DCCD] pt-4 space-y-2">
              <div className="flex justify-between">
                <div className="h-3.5 w-16 rounded bg-[#EAE0D2]" />
                <div className="h-3.5 w-20 rounded bg-[#EAE0D2]" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-[#EAE0D2]" />
                <div className="h-5 w-24 rounded bg-[#EAE0D2]" />
              </div>
            </div>
            <div className="h-12 w-full rounded-xl bg-[#2B3B2F]/25 mt-4" />
          </div>
        </div>
      </div>
    </main>
  );
}
