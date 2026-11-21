export default function GiftsLoading() {
  return (
    <main
      className="min-h-screen w-full bg-[#FAF5EE] px-4 pb-20 pt-24 text-[#2A1D1B] sm:px-6 sm:pt-28 lg:px-8 xl:px-12"
      style={{
        fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
      }}
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Hero Section Skeleton */}
        <div className="mx-auto max-w-3xl text-center space-y-4 py-8">
          <div className="mx-auto h-3 w-32 rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
          <div className="mx-auto h-12 w-3/4 rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
          <div className="mx-auto h-4 w-1/2 rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
          <div className="mx-auto mt-6 h-10 w-44 rounded-full bg-[#2B3B2F]/20 animate-seijaku-shimmer" />
        </div>

        {/* 3 Ways to Gift Section Header Skeleton */}
        <div className="mt-16 text-center space-y-3">
          <div className="mx-auto h-3 w-40 rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
          <div className="mx-auto h-10 w-80 rounded bg-[#EAE0D2] animate-seijaku-shimmer" />
        </div>

        {/* 3 Gift Ritual Cards Skeleton */}
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl border border-[#E7DCCD] bg-[#FAF5EC] p-6 shadow-xs space-y-5 animate-seijaku-shimmer"
            >
              <div className="aspect-[4/3] w-full rounded-xl bg-[#EAE0D2]" />
              <div className="space-y-2">
                <div className="h-6 w-3/4 rounded bg-[#EAE0D2]" />
                <div className="h-3.5 w-1/2 rounded bg-[#EFE6D8]" />
              </div>
              <div className="space-y-2.5 border-t border-[#E7DCCD] pt-4">
                <div className="h-3 w-full rounded bg-[#EFE6D8]" />
                <div className="h-3 w-5/6 rounded bg-[#EFE6D8]" />
                <div className="h-3 w-4/6 rounded bg-[#EFE6D8]" />
              </div>
              <div className="mt-auto pt-4">
                <div className="h-11 w-full rounded-xl bg-[#2B3B2F]/25" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
