import { publicBackendJson } from "@/src/lib/backend";
import { cacheTags } from "@/src/lib/cache-tags";
import type { ProductView } from "@/src/lib/product-types";

export type GiftCategoryKey =
  | "pocket-squares"
  | "scarves"
  | "scarves-and-squares"
  | "dokra-ornaments"
  | "perfumes"
  | "diffusers"
  | "diffuser-oils";

export interface GiftCategoryMeta {
  key: GiftCategoryKey;
  label: string;
  shortLabel: string;
  tag: string;
  description: string;
  defaultIcon: string;
}

export const GIFT_CATEGORIES: Record<GiftCategoryKey, GiftCategoryMeta> = {
  "pocket-squares": {
    key: "pocket-squares",
    label: "Pocket Squares",
    shortLabel: "Pocket Square",
    tag: "Textiles",
    description: "Modal silk pocket squares with hand-rolled hems and quiet prints.",
    defaultIcon: "/images/Festive Rituals Icon-1.png",
  },
  scarves: {
    key: "scarves",
    label: "Scarves",
    shortLabel: "Scarf",
    tag: "Textiles",
    description: "Modal silk scarves crafted with soft drape and refined colour stories.",
    defaultIcon: "/images/Festive Rituals Icon-6.png",
  },
  "scarves-and-squares": {
    key: "scarves-and-squares",
    label: "Scarves & Squares",
    shortLabel: "Textiles",
    tag: "Textiles",
    description: "Modal silk scarves and pocket squares.",
    defaultIcon: "/images/Festive Rituals Icon-6.png",
  },
  "dokra-ornaments": {
    key: "dokra-ornaments",
    label: "Dokra Brooches",
    shortLabel: "Dokra",
    tag: "Brass Objects",
    description: "Handcrafted lost-wax brass brooches from West Bengal — tactile ritual anchors.",
    defaultIcon: "/images/Festive Rituals Icon-1.png",
  },
  perfumes: {
    key: "perfumes",
    label: "Perfumes & Attars",
    shortLabel: "Perfume",
    tag: "Fragrance",
    description: "Botanical perfumes, fragrance oils, and traditional attars for skin and cloth.",
    defaultIcon: "/images/Festive Rituals Icon-4.png",
  },
  diffusers: {
    key: "diffusers",
    label: "Aroma Lamps (Diffusers)",
    shortLabel: "Diffuser",
    tag: "Atmosphere",
    description: "Handcrafted ceramic, stone, and brass aroma lamps and diffusers.",
    defaultIcon: "/images/Festive Rituals Icon-2.png",
  },
  "diffuser-oils": {
    key: "diffuser-oils",
    label: "Aroma Oils for Diffusion",
    shortLabel: "Aroma Oils",
    tag: "Atmosphere",
    description: "Botanical room oils, fragrance refills, and soy wax melts for diffusers.",
    defaultIcon: "/images/Festive Rituals Icon-3.png",
  },
};

export interface GiftPresetStep {
  key: GiftCategoryKey;
  label: string;
  shortLabel: string;
  requiredCount: number;
  title: [string, string];
  description: string;
  tagline: string[];
  icon?: string;
}

export interface GiftPreset {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  image: string;
  hasPackaging?: boolean;
  packagingLabel?: string;
  steps: GiftPresetStep[];
  minProducts?: number;
  maxProducts?: number;
}

export const DEFAULT_GIFT_PRESETS: GiftPreset[] = [
  {
    id: "little-gift",
    title: "The Little Seijaku Gift",
    subtitle: "A thoughtful beginning",
    description: "A compact, intimate gesture pairing silk cloth, heirloom dokra brass, and pure botanical scent.",
    image: "/images/The Little Seijaku display image_Bengal Monsoon Attar Still Life.png",
    hasPackaging: true,
    packagingLabel: "Festive Gift Packaging",
    minProducts: 3,
    maxProducts: 3,
    steps: [
      {
        key: "pocket-squares",
        label: "Pocket Square",
        shortLabel: "Pocket Square",
        requiredCount: 1,
        title: ["Choose", "Your Pocket Square"],
        description: "Modal silk pocket squares hand-printed with tranquil motifs, soft drape, and hand-rolled finishes.",
        tagline: ["Cloth.", "Pocket Accent.", "A quieter gesture."],
        icon: "/images/Festive Rituals Icon-1.png",
      },
      {
        key: "dokra-ornaments",
        label: "Dokra Brooch",
        shortLabel: "Dokra",
        requiredCount: 1,
        title: ["Choose", "Your Dokra Brooch"],
        description: "Handcrafted lost-wax brass brooches from West Bengal — tactile ritual anchors for everyday stillness.",
        tagline: ["Brass Object.", "Heirloom Craft.", "Bigger stories."],
        icon: "/images/Festive Rituals Icon-6.png",
      },
      {
        key: "perfumes",
        label: "Perfume Oil (Attar) or Eau de Parfum (Perfume)",
        shortLabel: "Perfume",
        requiredCount: 1,
        title: ["Choose", "Your Perfume or Attar"],
        description: "Natural perfumes and botanical fragrance oils composed for skin, cloth, and quiet contemplation.",
        tagline: ["Scent.", "Memory.", "A slower you."],
        icon: "/images/Festive Rituals Icon-4.png",
      },
    ],
  },
  {
    id: "ritual-box",
    title: "The Seijaku Ritual Box",
    subtitle: "For celebrations, milestones & meaningful moments",
    description: "Our signature gifting experience pairing a full-length modal silk scarf with an heirloom dokra brooch, botanical fragrance, and festive box packaging.",
    image: "/images/The Festive Ritual Box display image_Seijaku Luxury Gift Set Still Life.png",
    hasPackaging: true,
    packagingLabel: "Gift Packaging",
    minProducts: 3,
    maxProducts: 3,
    steps: [
      {
        key: "scarves",
        label: "Scarf",
        shortLabel: "Scarf",
        requiredCount: 1,
        title: ["Choose", "Your Scarf"],
        description: "Modal silk scarves crafted with quiet colour stories, soft drape, and hand-rolled finishes.",
        tagline: ["Cloth.", "Silk.", "Quieter gesture."],
        icon: "/images/Festive Rituals Icon-6.png",
      },
      {
        key: "dokra-ornaments",
        label: "Dokra Brooch",
        shortLabel: "Dokra",
        requiredCount: 1,
        title: ["Choose", "Your Dokra Brooch"],
        description: "Handcrafted lost-wax brass brooches from West Bengal — tactile ritual anchors for everyday stillness.",
        tagline: ["Small object.", "Bigger stories."],
        icon: "/images/Festive Rituals Icon-1.png",
      },
      {
        key: "perfumes",
        label: "Perfume Oil (Attar) or Eau de Parfum (Perfume)",
        shortLabel: "Perfume",
        requiredCount: 1,
        title: ["Choose", "Your Perfume or Attar"],
        description: "Natural perfumes and botanical fragrance oils composed for skin, cloth, and quiet contemplation.",
        tagline: ["Scent.", "Memory.", "A slower you."],
        icon: "/images/Festive Rituals Icon-4.png",
      },
    ],
  },
  {
    id: "home-ritual",
    title: "The Seijaku Home Ritual",
    subtitle: "For calmer, more beautiful spaces",
    description: "Gently transform home atmosphere with a handcrafted aroma lamp diffuser and two botanical fragrance refills.",
    image: "/images/The Seijaku Home Rituall display image_Chai diffuser ritual.png",
    hasPackaging: true,
    packagingLabel: "Festive Gift Packaging",
    minProducts: 3,
    maxProducts: 3,
    steps: [
      {
        key: "diffusers",
        label: "Aroma Lamp (Diffuser)",
        shortLabel: "Diffuser",
        requiredCount: 1,
        title: ["Choose", "Your Aroma Lamp"],
        description: "Ceramic, stone, and brass aroma lamp diffusers designed to gently shape your room atmosphere.",
        tagline: ["Vessel.", "Diffusion.", "Still air."],
        icon: "/images/Festive Rituals Icon-2.png",
      },
      {
        key: "diffuser-oils",
        label: "Aroma Oils for Diffusion",
        shortLabel: "Aroma Oils",
        requiredCount: 2,
        title: ["Choose", "2 Aroma Oils for Diffusion"],
        description: "Select 2 botanical room oils, fragrance refills, or wax melts to pair with your aroma lamp.",
        tagline: ["Botanical.", "Atmosphere.", "Room Scent."],
        icon: "/images/Festive Rituals Icon-3.png",
      },
    ],
  },
];

export function isPocketSquareProduct(p: ProductView): boolean {
  const text = `${p.type || ""} ${p.slug || ""} ${p.title || ""}`.toLowerCase();
  return text.includes("pocket");
}

export function isScarfProduct(p: ProductView): boolean {
  const text = `${p.type || ""} ${p.slug || ""} ${p.title || ""}`.toLowerCase();
  return (text.includes("scarf") || text.includes("modal-silk")) && !text.includes("pocket");
}

export function isDokraProduct(p: ProductView): boolean {
  const text = `${p.type || ""} ${p.slug || ""} ${p.title || ""} ${p.material || ""}`.toLowerCase();
  return text.includes("dokra") || text.includes("brooch") || text.includes("ornament");
}

export function isPerfumeProduct(p: ProductView): boolean {
  const text = `${p.type || ""} ${p.slug || ""} ${p.title || ""} ${p.material || ""}`.toLowerCase();
  if (text.includes("diffuser") || text.includes("wax melt") || text.includes("aroma lamp")) {
    return false;
  }
  return text.includes("perfume") || text.includes("attar") || text.includes("ittar") || text.includes("fragrance");
}

export function isDiffuserUnitProduct(p: ProductView): boolean {
  const text = `${p.type || ""} ${p.slug || ""} ${p.title || ""}`.toLowerCase();
  if (text.includes("oil") || text.includes("melt") || text.includes("refill")) {
    return false;
  }
  return text.includes("diffuser") || text.includes("lamp") || text.includes("vessel");
}

export function isDiffuserOilProduct(p: ProductView): boolean {
  const text = `${p.type || ""} ${p.slug || ""} ${p.title || ""}`.toLowerCase();
  const isOilOrMelt = text.includes("oil") || text.includes("melt") || text.includes("refill");
  const isDiffuserRelated =
    p.bridgeCategory === "diffusers" ||
    text.includes("diffuser") ||
    text.includes("fragrance oil") ||
    text.includes("wax melt") ||
    text.includes("room") ||
    text.includes("aroma");
  return isOilOrMelt && isDiffuserRelated;
}

export function isProductForCategory(product: ProductView, categoryKey: GiftCategoryKey): boolean {
  // 1. Explicit admin curation
  if (product.buildGift?.enabled) {
    if (product.buildGift.section === categoryKey) {
      return true;
    }
    // Backward compatibility for items saved with "scarves-and-squares"
    if (product.buildGift.section === "scarves-and-squares") {
      if (categoryKey === "pocket-squares") {
        return isPocketSquareProduct(product);
      }
      if (categoryKey === "scarves") {
        return isScarfProduct(product);
      }
      if (categoryKey === "scarves-and-squares") {
        return true;
      }
      return false;
    }
    // Backward compatibility for items saved with "diffusers"
    if (product.buildGift.section === "diffusers") {
      if (categoryKey === "diffuser-oils") {
        return isDiffuserOilProduct(product);
      }
      if (categoryKey === "diffusers") {
        return isDiffuserUnitProduct(product);
      }
    }
    return false;
  }

  // 2. Fallback to product metadata / category heuristics
  switch (categoryKey) {
    case "pocket-squares":
      return isPocketSquareProduct(product);
    case "scarves":
      return isScarfProduct(product);
    case "scarves-and-squares":
      return isPocketSquareProduct(product) || isScarfProduct(product);
    case "dokra-ornaments":
      return isDokraProduct(product);
    case "perfumes":
      return isPerfumeProduct(product);
    case "diffusers":
      return isDiffuserUnitProduct(product);
    case "diffuser-oils":
      return isDiffuserOilProduct(product);
    default:
      return false;
  }
}

/**
 * Fetch dynamic gift presets from backend site settings, falling back to DEFAULT_GIFT_PRESETS.
 */
export async function fetchGiftPresets(): Promise<GiftPreset[]> {
  try {
    const { item } = await publicBackendJson<{ item: { misc?: { giftPresets?: GiftPreset[] } } }>(
      "/content/site-settings",
      { tags: [cacheTags.siteSettings] },
    );
    if (item?.misc?.giftPresets && Array.isArray(item.misc.giftPresets) && item.misc.giftPresets.length > 0) {
      return item.misc.giftPresets;
    }
  } catch {
    // Graceful fallback to built-in presets on cold start or network error
  }
  return DEFAULT_GIFT_PRESETS;
}
