"use client";

type ShopFilterSectionProps<T extends string> = {
  title: string;
  options: readonly T[];
  value: T | "All";
  onChange: (value: T | "All") => void;
  includeAll?: boolean;
  allLabel?: string;
  idPrefix: string;
};

export default function ShopFilterSection<T extends string>({
  title,
  options,
  value,
  onChange,
  includeAll = true,
  allLabel = "All",
  idPrefix,
}: ShopFilterSectionProps<T>) {
  const headingId = `${idPrefix}-label`;
  const entries: Array<{ key: string; label: string; selected: boolean; select: () => void }> = [];

  if (includeAll) {
    entries.push({
      key: "All",
      label: allLabel,
      selected: value === "All",
      select: () => onChange("All"),
    });
  }

  for (const option of options) {
    entries.push({
      key: option,
      label: option,
      selected: value === option,
      select: () => onChange(option),
    });
  }

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h3 id={headingId} className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#5a5148]">
          {title}
        </h3>
        <div className="h-px flex-1 bg-[rgba(111,100,86,0.1)] ml-4" />
      </div>
      <div role="radiogroup" aria-labelledby={headingId} className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="radio"
            aria-checked={entry.selected}
            onClick={entry.select}
            className={`relative flex items-center justify-center rounded-[12px] border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.16em] transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c7b68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3efe7] ${
              entry.selected
                ? "border-[#2e4a36] bg-[#2e4a36] text-[#f4efe8] shadow-[0_4px_12px_rgba(46,74,54,0.14)]"
                : "border-[rgba(111,100,86,0.12)] bg-[#faf8f5]/80 text-[#5a5148] backdrop-blur-[4px] hover:border-[rgba(96,86,74,0.26)] hover:bg-white hover:shadow-[0_4px_10px_rgba(96,86,74,0.03)]"
            }`}
          >
            {entry.selected && (
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#f4efe8] animate-pulse" />
            )}
            <span>{entry.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
