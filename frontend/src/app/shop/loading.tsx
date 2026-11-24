export default function ShopLoading() {
  return (
    <main
      className="min-h-screen w-full bg-[#FAF5EE] px-4 pb-20 pt-24 text-[#2A1D1B] sm:px-6 sm:pt-28 lg:px-8 xl:px-12"
      style={{
        fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
      }}
    >
      <div className="mx-auto max-w-[1480px]">
        {/* Header Skeleton */}
        <div className="border-b border-[#E7DCCD] pb-6 space-y-3">
          <div className="h-3 w-28 rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
          <div className="h-10 w-64 rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
          <div className="flex flex-wrap gap-2 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-7 w-20 rounded-full bg-[#EAE0D2] animate-seijaku-shimmer" />
            ))}
          </div>
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#E7DCCD] bg-[#FAF5EC] p-3 shadow-2xs space-y-3 animate-seijaku-shimmer"
            >
              <div className="aspect-[4/4.5] w-full rounded-xl bg-[#EAE0D2]" />
              <div className="space-y-2 px-1 pb-1">
                <div className="h-2.5 w-16 rounded bg-[#E2D6C5]" />
                <div className="h-4 w-3/4 rounded bg-[#E2D6C5]" />
                <div className="h-3.5 w-20 rounded bg-[#E2D6C5]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
