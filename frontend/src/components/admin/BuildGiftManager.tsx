"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Search,
  X,
  Check,
  ExternalLink,
  Sparkles,
  Layers,
  Gift,
  RotateCcw,
  Package,
} from "lucide-react";
import AdminCard from "@/src/components/admin/AdminCard";
import {
  adminButtonClassName,
  adminSecondaryButtonClassName,
  adminInputClassName,
} from "@/src/components/admin/AdminField";
import type { ProductSummary, SiteSettings } from "@/src/lib/admin-types";
import {
  DEFAULT_GIFT_PRESETS,
  GIFT_CATEGORIES,
  type GiftCategoryKey,
  type GiftPreset,
  type GiftPresetStep,
} from "@/src/lib/gift-presets";

type StepDefinition = {
  key: GiftCategoryKey;
  label: string;
  description: string;
  tag: string;
  usedIn: string;
};

const SECTIONS: StepDefinition[] = [
  {
    key: "pocket-squares",
    label: "Pocket Squares",
    description: "Modal silk pocket squares with hand-rolled finishes.",
    tag: "Textiles",
    usedIn: "The Little Seijaku Gift",
  },
  {
    key: "scarves",
    label: "Scarves",
    description: "Modal silk and handwoven scarves crafted with soft drape.",
    tag: "Textiles",
    usedIn: "The Seijaku Ritual Box",
  },
  {
    key: "dokra-ornaments",
    label: "Dokra Brooches",
    description: "Lost-wax brass brooches and handcrafted ritual anchors.",
    tag: "Brass Objects",
    usedIn: "The Little Seijaku Gift & The Seijaku Ritual Box",
  },
  {
    key: "perfumes",
    label: "Perfumes & Attars",
    description: "Botanical perfumes, fragrance oils, and traditional attars.",
    tag: "Fragrance",
    usedIn: "The Little Seijaku Gift & The Seijaku Ritual Box",
  },
  {
    key: "diffusers",
    label: "Aroma Lamps (Diffusers)",
    description: "Stone, ceramic, and brass aroma lamp diffusers.",
    tag: "Atmosphere",
    usedIn: "The Seijaku Home Ritual",
  },
  {
    key: "diffuser-oils",
    label: "Aroma Oils for Diffusion",
    description: "Botanical room oils, fragrance refills, and wax melts for diffusers.",
    tag: "Atmosphere",
    usedIn: "The Seijaku Home Ritual",
  },
];

type BuildGiftManagerProps = {
  initialProducts: ProductSummary[];
  initialSettings: SiteSettings;
};

function getBuildGiftMeta(product: ProductSummary): { enabled: boolean; section: GiftCategoryKey } {
  const meta = (product.metadata?.buildGift ?? product.metadata?.build_gift) as
    | { enabled?: boolean; section?: string }
    | undefined;

  let section: GiftCategoryKey = "pocket-squares";
  const rawSection = meta?.section;

  if (rawSection === "pocket-squares" || rawSection === "scarves" || rawSection === "dokra-ornaments" || rawSection === "perfumes" || rawSection === "diffusers" || rawSection === "diffuser-oils") {
    section = rawSection;
  } else if (rawSection === "scarves-and-squares") {
    const text = `${product.type || ""} ${product.slug || ""} ${product.title || ""}`.toLowerCase();
    section = text.includes("pocket") ? "pocket-squares" : "scarves";
  } else if (rawSection === "diffusers") {
    const text = `${product.type || ""} ${product.slug || ""} ${product.title || ""}`.toLowerCase();
    section = text.includes("oil") || text.includes("melt") ? "diffuser-oils" : "diffusers";
  } else {
    // Detect based on product characteristics
    const text = `${product.type || ""} ${product.slug || ""} ${product.title || ""}`.toLowerCase();
    if (text.includes("pocket")) section = "pocket-squares";
    else if (text.includes("scarf")) section = "scarves";
    else if (text.includes("dokra") || text.includes("brooch")) section = "dokra-ornaments";
    else if (text.includes("diffuser") && (text.includes("oil") || text.includes("melt"))) section = "diffuser-oils";
    else if (text.includes("diffuser") || text.includes("lamp")) section = "diffusers";
    else if (text.includes("perfume") || text.includes("attar") || text.includes("fragrance")) section = "perfumes";
  }

  return {
    enabled: Boolean(meta?.enabled),
    section,
  };
}

export default function BuildGiftManager({ initialProducts, initialSettings }: BuildGiftManagerProps) {
  const [activeTab, setActiveTab] = useState<"curation" | "presets">("curation");
  const [products, setProducts] = useState<ProductSummary[]>(initialProducts);
  const [activeDialogSection, setActiveDialogSection] = useState<GiftCategoryKey | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Presets state
  const [presets, setPresets] = useState<GiftPreset[]>(() => {
    const custom = (initialSettings.misc as { giftPresets?: GiftPreset[] } | null)?.giftPresets;
    if (Array.isArray(custom) && custom.length > 0) {
      return custom;
    }
    return DEFAULT_GIFT_PRESETS;
  });

  // Group products by gift section
  const sectionProductsMap = useMemo(() => {
    const map = new Map<GiftCategoryKey, ProductSummary[]>();
    for (const sec of SECTIONS) {
      map.set(sec.key, []);
    }
    for (const product of products) {
      const { enabled, section } = getBuildGiftMeta(product);
      if (enabled && map.has(section)) {
        map.get(section)!.push(product);
      }
    }
    return map;
  }, [products]);

  // Candidates for "+ Add Product" modal
  const candidateProducts = useMemo(() => {
    if (!activeDialogSection) return [];
    const currentInThisSection = new Set(
      (sectionProductsMap.get(activeDialogSection) ?? []).map((p) => p.id)
    );
    const q = searchQuery.toLowerCase().trim();

    return products.filter((p) => {
      if (currentInThisSection.has(p.id)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
    });
  }, [activeDialogSection, sectionProductsMap, products, searchQuery]);

  // Update product's buildGift metadata on the backend
  async function updateProductGiftMeta(
    productId: string,
    enabled: boolean,
    section: GiftCategoryKey
  ) {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    const existingMeta = (targetProduct.metadata ?? {}) as Record<string, unknown>;
    const updatedMetadata = {
      ...existingMeta,
      buildGift: {
        enabled,
        section,
      },
    };

    // Optimistic local update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, metadata: updatedMetadata } : p))
    );

    try {
      const res = await fetch(`/api/admin/proxy/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: updatedMetadata }),
      });

      if (!res.ok) {
        throw new Error("Failed to save changes.");
      }

      setNotice(
        enabled
          ? `Added "${targetProduct.title}" to ${SECTIONS.find((s) => s.key === section)?.label}.`
          : `Removed "${targetProduct.title}" from gift builder.`
      );
      setTimeout(() => setNotice(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving product");
      setProducts(initialProducts);
      setTimeout(() => setError(null), 5000);
    }
  }

  function handleAdd(productId: string) {
    if (!activeDialogSection) return;
    startTransition(async () => {
      await updateProductGiftMeta(productId, true, activeDialogSection);
    });
  }

  function handleRemove(productId: string, section: GiftCategoryKey) {
    startTransition(async () => {
      await updateProductGiftMeta(productId, false, section);
    });
  }

  function handleMove(productId: string, newSection: GiftCategoryKey) {
    startTransition(async () => {
      await updateProductGiftMeta(productId, true, newSection);
    });
  }

  // Save gift presets to site settings
  async function handleSavePresets() {
    startTransition(async () => {
      try {
        setError(null);
        setNotice(null);

        const existingMisc = (initialSettings.misc ?? {}) as Record<string, unknown>;
        const updatedMisc = {
          ...existingMisc,
          giftPresets: presets,
        };

        const res = await fetch("/api/admin/proxy/site-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            footerEmail: initialSettings.footerEmail,
            footerPhone: initialSettings.footerPhone,
            addressLines: initialSettings.addressLines,
            newsletterHeading: initialSettings.newsletterHeading,
            newsletterBody: initialSettings.newsletterBody,
            misc: updatedMisc,
            logoImageId: initialSettings.logoImage?.id || null,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to save gift presets to site settings.");
        }

        setNotice("Gift Box presets saved successfully! Changes are live on /gifts and /build-gift.");
        setTimeout(() => setNotice(null), 5000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error saving presets");
        setTimeout(() => setError(null), 5000);
      }
    });
  }

  function handleResetPresetsToDefault() {
    if (confirm("Reset all gift presets to the official Seijaku Three Ways to Gift defaults?")) {
      setPresets(DEFAULT_GIFT_PRESETS);
      setNotice("Presets reset to defaults. Click 'Save All Presets' to publish.");
    }
  }

  function updatePresetField(presetId: string, field: keyof GiftPreset, value: unknown) {
    setPresets((prev) =>
      prev.map((p) => (p.id === presetId ? { ...p, [field]: value } : p))
    );
  }

  function updatePresetStep(
    presetId: string,
    stepIndex: number,
    field: keyof GiftPresetStep,
    value: unknown
  ) {
    setPresets((prev) =>
      prev.map((p) => {
        if (p.id !== presetId) return p;
        const newSteps = [...p.steps];
        newSteps[stepIndex] = { ...newSteps[stepIndex], [field]: value };
        return { ...p, steps: newSteps };
      })
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {notice && (
        <div className="flex items-center gap-2 rounded-xl bg-[#2d5a3f]/10 border border-[#2d5a3f]/20 px-4 py-3 text-[13px] text-[#2d5a3f]">
          <Check className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-[#8c2e2e]/10 border border-[#8c2e2e]/20 px-4 py-3 text-[13px] text-[#8c2e2e]">
          {error}
        </div>
      )}

      {/* Intro info bar with link to view page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-[#f7f2ea] border border-[#e2d7c7] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-[#2d2824] p-2 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[15px] font-medium text-[#2d2824]">
              Build-A-Gift Dynamic System
            </h3>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[#7b7064]">
              Curate products for each category and manage the Three Ways to Gift rituals on /gifts and /build-gift.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/gifts"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[12px] font-medium text-[#2d2824] border border-[#e2d7c7] shadow-xs hover:bg-[#ece4d6] transition-colors"
          >
            <span>View /gifts</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/build-gift"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2d2824] px-3.5 py-1.5 text-[12px] font-medium text-white shadow-xs hover:bg-[#463f39] transition-colors"
          >
            <span>Preview Builder</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e2d7c7]">
        <button
          type="button"
          onClick={() => setActiveTab("curation")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 font-sans text-[13px] font-medium transition-colors ${
            activeTab === "curation"
              ? "border-[#2d2824] text-[#2d2824]"
              : "border-transparent text-[#7b7064] hover:text-[#2d2824]"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Curate Category Products</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("presets")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 font-sans text-[13px] font-medium transition-colors ${
            activeTab === "presets"
              ? "border-[#2d2824] text-[#2d2824]"
              : "border-transparent text-[#7b7064] hover:text-[#2d2824]"
          }`}
        >
          <Gift className="h-4 w-4" />
          <span>Gift Box Rituals (Three Ways to Gift)</span>
        </button>
      </div>

      {/* TAB 1: CURATE PRODUCTS */}
      {activeTab === "curation" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map((sec) => {
            const sectionItems = sectionProductsMap.get(sec.key) ?? [];
            return (
              <AdminCard key={sec.key}>
                <div className="flex items-start justify-between border-b border-[#e2d7c7] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[16px] font-medium text-[#2d2824]">{sec.label}</h2>
                      <span className="rounded-full bg-[#e8decf] px-2 py-0.5 text-[11px] font-semibold text-[#6a5d50]">
                        {sectionItems.length}
                      </span>
                    </div>
                    <span className="inline-block mt-0.5 rounded-sm bg-[#FAF4EC] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[#7A6A5E] border border-[#E3D4C4]">
                      {sec.usedIn}
                    </span>
                    <p className="mt-1 text-[11px] text-[#7b7064]">{sec.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveDialogSection(sec.key);
                      setSearchQuery("");
                    }}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#2d2824] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#463f39] transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Product list */}
                <div className="mt-3 divide-y divide-[#ece4d6] max-h-[380px] overflow-y-auto pr-1">
                  {sectionItems.length === 0 ? (
                    <div className="py-8 text-center text-[12px] text-[#8a8075]">
                      <p>No products assigned yet.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDialogSection(sec.key);
                          setSearchQuery("");
                        }}
                        className="mt-2 text-[#2d2824] underline hover:text-[#524942]"
                      >
                        + Add product
                      </button>
                    </div>
                  ) : (
                    sectionItems.map((product) => {
                      const image = product.primaryImage?.url || "/images/Home Page hero image 1.png";
                      return (
                        <div
                          key={product.id}
                          className="flex items-center justify-between py-2 text-[12px] gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-[#ece4d6]">
                              <Image
                                src={image}
                                alt={product.title}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[#2d2824]">{product.title}</p>
                              <p className="text-[10px] text-[#8a8075]">₹{product.priceAmount.toLocaleString("en-IN")}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <select
                              value={sec.key}
                              onChange={(e) => handleMove(product.id, e.target.value as GiftCategoryKey)}
                              className="rounded border border-[#d6c7b4] bg-white px-1.5 py-0.5 text-[10px] text-[#4a3f35] focus:outline-none"
                              title="Move to another section"
                            >
                              {SECTIONS.map((s) => (
                                <option key={s.key} value={s.key}>
                                  {s.label}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemove(product.id, sec.key)}
                              className="rounded p-1 text-[#8a8075] hover:bg-[#ebd9d9] hover:text-[#8c2e2e] transition-colors"
                              title="Remove from section"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}

      {/* TAB 2: GIFT PRESETS (THREE WAYS TO GIFT) */}
      {activeTab === "presets" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-medium text-[#2d2824]">
                The Three Ways to Gift Rituals
              </h2>
              <p className="text-[12px] text-[#7b7064]">
                Configure the three featured gift box presets shown on the /gifts page and their dynamic steps on /build-gift.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetPresetsToDefault}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2d7c7] bg-white px-3 py-2 text-[12px] font-medium text-[#6a5d50] hover:bg-[#f7f2ea]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Defaults</span>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSavePresets}
                className={adminButtonClassName}
              >
                <span>{isPending ? "Saving..." : "Save All Presets"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {presets.map((preset, pIdx) => (
              <AdminCard key={preset.id}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#e2d7c7] pb-3">
                    <span className="rounded-full bg-[#2d2824] px-2.5 py-0.5 text-[10px] uppercase font-semibold text-white">
                      Ritual {pIdx + 1}
                    </span>
                    <span className="font-mono text-[10px] text-[#7b7064]">{preset.id}</span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-[#6a5d50]">
                      Title
                    </label>
                    <input
                      type="text"
                      value={preset.title}
                      onChange={(e) => updatePresetField(preset.id, "title", e.target.value)}
                      className={`${adminInputClassName} mt-1`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-[#6a5d50]">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={preset.subtitle}
                      onChange={(e) => updatePresetField(preset.id, "subtitle", e.target.value)}
                      className={`${adminInputClassName} mt-1`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-[#6a5d50]">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={preset.image}
                      onChange={(e) => updatePresetField(preset.id, "image", e.target.value)}
                      className={`${adminInputClassName} mt-1 text-[11px] font-mono`}
                    />
                  </div>

                  {/* Steps Breakdown */}
                  <div className="border-t border-[#e2d7c7] pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[11px] font-medium uppercase tracking-wide text-[#6a5d50]">
                        Steps ({preset.steps.length})
                      </label>
                    </div>

                    <div className="space-y-3">
                      {preset.steps.map((step, sIdx) => (
                        <div
                          key={step.key + sIdx}
                          className="rounded-xl border border-[#e2d7c7] bg-[#fbf9f5] p-3 text-[12px] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[#2d2824]">
                              Step {sIdx + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-[#7b7064]">Req. Qty:</span>
                              <input
                                type="number"
                                min={1}
                                max={5}
                                value={step.requiredCount}
                                onChange={(e) =>
                                  updatePresetStep(preset.id, sIdx, "requiredCount", parseInt(e.target.value, 10) || 1)
                                }
                                className="w-12 rounded border border-[#d6c7b4] bg-white px-1.5 py-0.5 text-center text-[11px]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-[#7b7064]">Category Source</label>
                            <select
                              value={step.key}
                              onChange={(e) =>
                                updatePresetStep(preset.id, sIdx, "key", e.target.value as GiftCategoryKey)
                              }
                              className="mt-0.5 w-full rounded border border-[#d6c7b4] bg-white px-2 py-1 text-[11px]"
                            >
                              {Object.values(GIFT_CATEGORIES).map((c) => (
                                <option key={c.key} value={c.key}>
                                  {c.label} ({c.tag})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-[#7b7064]">Display Label</label>
                            <input
                              type="text"
                              value={step.label}
                              onChange={(e) => updatePresetStep(preset.id, sIdx, "label", e.target.value)}
                              className="mt-0.5 w-full rounded border border-[#d6c7b4] bg-white px-2 py-1 text-[11px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Packaging */}
                  <div className="border-t border-[#e2d7c7] pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-[#7b7064]" />
                      <span className="text-[12px] text-[#2d2824]">Gift Packaging Included</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preset.hasPackaging !== false}
                      onChange={(e) => updatePresetField(preset.id, "hasPackaging", e.target.checked)}
                      className="h-4 w-4 rounded border-[#d6c7b4]"
                    />
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>
        </div>
      )}

      {/* "+ Add Product" Modal */}
      {activeDialogSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e2d7c7] px-6 py-4">
              <div>
                <h3 className="text-[17px] font-medium text-[#2d2824]">
                  Add Product to &ldquo;{SECTIONS.find((s) => s.key === activeDialogSection)?.label}&rdquo;
                </h3>
                <p className="text-[12px] text-[#7b7064]">
                  Search published products in the store catalog to enable for this category.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDialogSection(null)}
                className="rounded-lg p-1.5 text-[#7b7064] hover:bg-[#ece4d6] hover:text-[#2d2824]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="border-b border-[#e2d7c7] px-6 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7064]" />
                <input
                  type="text"
                  placeholder="Search by title, slug, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#e2d7c7] bg-[#fbf9f5] py-2 pl-9 pr-3 text-[13px] text-[#2d2824] placeholder-[#8a8075] focus:border-[#2d2824] focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Product Candidates */}
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#ece4d6]">
              {candidateProducts.length === 0 ? (
                <div className="py-12 text-center text-[13px] text-[#8a8075]">
                  No matching published products found.
                </div>
              ) : (
                candidateProducts.map((p) => {
                  const image = p.primaryImage?.url || "/images/Home Page hero image 1.png";
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between py-3 gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-[#ece4d6]">
                          <Image
                            src={image}
                            alt={p.title}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#2d2824] text-[13px] truncate">{p.title}</p>
                          <p className="text-[11px] text-[#7b7064]">
                            {p.type} &middot; ₹{p.priceAmount.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdd(p.id)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#2d2824] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#463f39] transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Select</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-[#e2d7c7] px-6 py-3">
              <button
                type="button"
                onClick={() => setActiveDialogSection(null)}
                className={adminSecondaryButtonClassName}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
