export default function BuildGiftLoading() {
  return (
    <main
      className="min-h-screen w-full bg-[#F9F5EE] px-4 pb-16 pt-24 text-[#2A1D1B] sm:px-6 sm:pt-28 xl:px-8 2xl:px-12"
      style={{
        fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
      }}
    >
      <div className="mx-auto max-w-[1750px]">
        {/* Top Bar Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7DCCD] pb-4">
          <div className="h-8 w-32 rounded-full bg-[#EAE0D2] animate-seijaku-shimmer" />
          <div className="flex items-center gap-3">
            <div className="h-7 w-20 rounded-full bg-[#EAE0D2] animate-seijaku-shimmer" />
            <div className="h-7 w-20 rounded-full bg-[#EAE0D2] animate-seijaku-shimmer" />
            <div className="h-7 w-20 rounded-full bg-[#EAE0D2] animate-seijaku-shimmer" />
          </div>
          <div className="hidden h-4 w-40 rounded bg-[#EAE0D2] 2xl:block animate-seijaku-shimmer" />
        </div>

        {/* 3 Ritual Presets Header Skeleton */}
        <div className="mt-4 rounded-xl border border-[#E7DCCD] bg-[#FAF5EC] p-3 sm:p-4">
          <div className="flex items-center justify-between border-b border-[#E7DCCD]/60 pb-2.5 mb-3">
            <div className="space-y-1.5">
              <div className="h-2.5 w-28 rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
              <div className="h-4 w-64 rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
            </div>
            <div className="h-3 w-20 rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-lg border border-[#E3D4C4] bg-[#FBF8F2] p-3 space-y-2 animate-seijaku-shimmer"
              >
                <div className="h-4 w-3/4 rounded bg-[#EAE0D2]" />
                <div className="h-2.5 w-1/2 rounded bg-[#EFE6D8]" />
                <div className="mt-3 h-2 w-full rounded bg-[#EFE6D8]" />
              </div>
            ))}
          </div>
        </div>

        {/* 3-Column Layout Skeleton */}
        <div className="mt-7 grid grid-cols-1 items-start gap-6 md:gap-7 xl:grid-cols-[200px_minmax(0,1fr)_310px] 2xl:grid-cols-[230px_minmax(0,1fr)_320px] 2xl:gap-8">
          {/* Left Column Skeleton */}
          <div className="space-y-4 xl:border-r xl:border-[#E7DDD1] xl:pr-5">
            <div className="h-3 w-24 rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
            <div className="h-10 w-36 rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
            <div className="h-6 w-28 rounded-full bg-[#EAE0D2] animate-seijaku-shimmer" />
            <div className="h-16 w-full rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
          </div>

          {/* Centre Column Skeleton: Product cards grid */}
          <div className="min-w-0 border-t border-[#E7DCCD] pt-4">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-[24px] border border-[#E3D4C4] bg-[#FAF5EC] p-3 shadow-xs space-y-3 animate-seijaku-shimmer"
                >
                  <div className="aspect-[4/4.45] w-full rounded-2xl bg-[#EAE0D2]" />
                  <div className="space-y-2 px-1">
                    <div className="h-2.5 w-16 rounded bg-[#E2D6C5]" />
                    <div className="h-4 w-3/4 rounded bg-[#E2D6C5]" />
                    <div className="h-3.5 w-20 rounded bg-[#E2D6C5]" />
                    <div className="mt-2 h-9 w-full rounded-lg bg-[#E2D6C5]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Skeleton: Your Gift Box */}
          <div className="overflow-hidden rounded-sm border border-[#E9DED1] bg-[#FBF8F2] p-4 space-y-4 shadow-sm animate-seijaku-shimmer">
            <div className="flex items-center justify-between border-b border-[#E8DCCE] pb-3">
              <div className="h-5 w-28 rounded bg-[#EAE0D2]" />
              <div className="h-4 w-20 rounded-full bg-[#EAE0D2]" />
            </div>
            <div className="h-16 rounded-lg border border-dashed border-[#E3D4C4] bg-[#FAF5EC]" />
            <div className="space-y-2 border-t border-[#E3D4C4] pt-3">
              <div className="h-4 w-full rounded bg-[#EAE0D2]" />
              <div className="h-4 w-2/3 rounded bg-[#EAE0D2]" />
            </div>
            <div className="h-11 w-full rounded-lg bg-[#2B3B2F]/20" />
          </div>
        </div>
      </div>
    </main>
  );
}
