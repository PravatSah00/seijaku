"use client";

import Image from "next/image";
import Link from "next/link";

import type { ProductView } from "@/src/lib/product-types";

import ShopProductActions from "../ShopProductActions";

type TextileProductCardProps = {
  item: ProductView;
  categoryLabel: string;
  description: string;
  pairingLabel?: string;
  pairingHref?: string;
  selectorLabel?: string;
  selectorOptions?: string[];
  selectedOption?: string;
  onSelectOption?: (value: string) => void;
  onViewDetails: () => void;
};

export default function TextileProductCard({
  item,
  categoryLabel,
  description,
  pairingLabel,
  pairingHref,
  onViewDetails,
}: TextileProductCardProps) {

  return (
    <article className="group mx-auto flex h-full w-full max-w-[360px] flex-col overflow-hidden rounded-[14px] border border-[rgba(86,76,64,0.08)] bg-[linear-gradient(180deg,rgba(250,247,241,0.94)_0%,rgba(246,240,232,0.98)_100%)] shadow-[0_10px_24px_rgba(41,34,27,0.035)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_18px_30px_rgba(41,34,27,0.06)]">
      <button
        type="button"
        onClick={onViewDetails}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c7b68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f1e8]"
        aria-label={`View details for ${item.title}`}
      >
        <div className="mx-4 mt-4 rounded-[12px] border border-[rgba(86,76,64,0.06)] bg-[rgba(231,223,212,0.78)] p-3 sm:mx-5 sm:mt-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] bg-[#e3dacd]">
            <Image
              src={item.image}
              alt={item.imageAlt ?? item.title}
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 768px) 28vw, 88vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        </div>
      </button>

      <div className="flex flex-1 flex-col px-5 pb-6 pt-5 sm:px-6 sm:pb-7 sm:pt-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b775f]">{categoryLabel}</p>
        <h3 className="mt-4 text-[24px] leading-[1.14] tracking-[-0.025em] text-[#1b1714]">{item.title}</h3>
        <p className="mt-4 max-w-[30ch] text-[14px] leading-[1.92] text-[#5f574d]">{description}</p>

        {pairingLabel ? (
          pairingHref ? (
            <Link
              href={pairingHref}
              className="mt-5 mb-1 inline-flex w-fit items-center gap-2 rounded-full bg-[rgba(133,118,95,0.12)] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#35513e] transition-colors duration-200 hover:bg-[rgba(133,118,95,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c7b68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f1e8]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#35513e]/70" aria-hidden="true" />
              <span>{pairingLabel}</span>
            </Link>
          ) : (
            <div className="mt-5 mb-1 inline-flex w-fit items-center gap-2 rounded-full bg-[rgba(133,118,95,0.12)] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#35513e]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#35513e]/70" aria-hidden="true" />
              <span>{pairingLabel}</span>
            </div>
          )
        ) : null}

        <p className="mt-5 text-[14px] text-[#312b25]">{item.priceLabel}</p>

        <ShopProductActions
          className="mt-7"
          item={item}
          onViewDetails={onViewDetails}
        />
      </div>
    </article>
  );
}
