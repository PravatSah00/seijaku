import Image from "next/image";

export default function RootLoading() {
  return (
    <div
      className="fixed inset-0 z-40 flex min-h-screen w-full flex-col items-center justify-center bg-[#FAF5EE] px-4 text-[#2A1D1B]"
      style={{
        fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
      }}
    >
      <div className="flex flex-col items-center justify-center text-center">
        {/* Subtle breathing emblem */}
        <div className="relative flex h-20 w-20 items-center justify-center animate-seijaku-pulse">
          <div className="absolute inset-0 rounded-full bg-[#C2A26F]/15 blur-xl" />
          <Image
            src="/images/seijaku-emblem-g.png"
            alt="Seijaku"
            width={64}
            height={64}
            className="relative h-16 w-16 object-contain"
            priority
          />
        </div>

        {/* Brand name */}
        <p className="mt-5 font-serif text-[20px] font-normal tracking-[0.24em] uppercase text-[#2B3B2F]">
          Seijaku
        </p>

        {/* Slender golden shimmer line */}
        <div className="relative mt-4 h-[2px] w-32 overflow-hidden rounded-full bg-[#E5D7C2]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4A6350] to-transparent animate-seijaku-shimmer" />
        </div>

        {/* Calming status text */}
        <p className="mt-4 font-serif text-[14px] italic text-[#8C7A6E]">
          Composing stillness...
        </p>
      </div>
    </div>
  );
}
