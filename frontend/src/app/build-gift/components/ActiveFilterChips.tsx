"use client";

type ActiveFilterChipsProps = {
  chips: Array<{
    id: string;
    label: string;
  }>;
  onRemove: (id: string) => void;
  onClear: () => void;
};

export default function ActiveFilterChips({ chips, onRemove, onClear }: ActiveFilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2.5">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onRemove(chip.id)}
          className="rounded-full border border-[rgba(111,100,86,0.12)] bg-[rgba(251,247,240,0.96)] px-3.5 py-2 text-[10px] uppercase tracking-[0.16em] text-[#5a5148] transition-colors duration-200 hover:border-[rgba(96,86,74,0.22)] hover:bg-[#f8f2e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c7b68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3efe7]"
        >
          {chip.label} x
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-[10px] uppercase tracking-[0.2em] text-[#6e6458] underline decoration-black/15 underline-offset-4 transition-opacity duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c7b68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3efe7]"
      >
        Clear all
      </button>
    </div>
  );
}
