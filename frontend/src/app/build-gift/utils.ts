/**
 * Gift-builder draft selection storage.
 *
 * Supports multiple product selections from any of the 4 gift categories:
 * - /shop/scarves-and-squares (scarves-and-squares)
 * - /shop/perfumes (perfumes)
 * - /shop/dokra-ornaments (dokra-ornaments)
 * - /shop/diffusers (diffusers)
 *
 * Configurable min/max product limits (default min: 2, max: 3).
 */

export type GiftStepKey =
    | "scarves-and-squares"
    | "perfumes"
    | "dokra-ornaments"
    | "diffusers";

export type ProductSelectionPayload = {
    label?: string | null;
    options?: Record<string, string> | null;
};

export type GiftItemSelection = {
    instanceId: string;
    productId: string;
    stepKey: GiftStepKey;
    options?: ProductSelectionPayload | null;
};

export const DEFAULT_MIN_GIFT_PRODUCTS = 2;
export const DEFAULT_MAX_GIFT_PRODUCTS = 3;

const STORAGE_KEY_V2 = "seijaku-gift-selection-v2";
const LEGACY_STORAGE_KEY = "seijaku-gift-selection";

export function generateInstanceId(): string {
    return `gift-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Save all selected gift items to localStorage.
 */
export function setStoredGiftItems(items: GiftItemSelection[]): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(items));
    } catch (error) {
        console.error("Unable to save gift selections to localStorage.", error);
    }
}

/**
 * Read all selected gift items from localStorage.
 * Backwards-compatible with legacy single-item-per-category draft format.
 */
export function getStoredGiftItems(): GiftItemSelection[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY_V2);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.filter(
                    (item): item is GiftItemSelection =>
                        Boolean(
                            item &&
                                typeof item === "object" &&
                                typeof item.productId === "string" &&
                                item.productId,
                        ),
                );
            }
        }

        // Backwards compatibility: check legacy storage
        const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyRaw) {
            const legacy = JSON.parse(legacyRaw) as Record<string, unknown>;
            const migrated: GiftItemSelection[] = [];

            const addIfValid = (key: GiftStepKey, val: unknown) => {
                if (typeof val === "string" && val.trim()) {
                    migrated.push({
                        instanceId: generateInstanceId(),
                        productId: val.trim(),
                        stepKey: key,
                        options: null,
                    });
                }
            };

            addIfValid(
                "scarves-and-squares",
                legacy["scarves-and-squares"] ?? legacy.textile,
            );
            addIfValid("perfumes", legacy.perfumes ?? legacy.scent);
            addIfValid(
                "dokra-ornaments",
                legacy["dokra-ornaments"] ?? legacy.dokra,
            );
            addIfValid("diffusers", legacy.diffusers);

            return migrated;
        }

        return [];
    } catch (error) {
        console.error(
            "Unable to read gift selections from localStorage.",
            error,
        );
        return [];
    }
}

/**
 * Clear stored gift selections.
 */
export function clearStoredGiftItems(): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.removeItem(STORAGE_KEY_V2);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
        console.error(
            "Unable to clear gift selections from localStorage.",
            error,
        );
    }
}

export const clearGiftSelectionIds = clearStoredGiftItems;
