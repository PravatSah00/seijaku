/**
 * Gift-builder draft selection storage.
 *
 * This stores ONLY the three selected product IDs.
 * Keep it separate from the final cart/bag payload.
 */

export type GiftSelectionIds = {
    textile: string | null;
    scent  : string | null;
    dokra  : string | null;
};

const STORAGE_KEY = "seijaku-gift-selection";

export const EMPTY_GIFT_SELECTION_IDS: GiftSelectionIds = {
    textile: null,
    scent  : null,
    dokra  : null,
};

function normalizeId(value: unknown): string | null {
    return typeof value === "string" && value.trim()
        ? value
        : null;
}

/**
 * Save all three gift product IDs.
 *
 * Can be called from the gift builder OR any other client page
 * before redirecting the user to /build-gift.
 */
export function setGiftSelectionIds(
    selections: GiftSelectionIds,
): GiftSelectionIds {
    const normalized: GiftSelectionIds = {
        textile: normalizeId(selections.textile),
        scent: normalizeId(selections.scent),
        dokra: normalizeId(selections.dokra),
    };

    if (typeof window === "undefined") {
        return normalized;
    }

    try {
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(normalized),
        );
    } catch (error) {
        console.error(
            "Unable to save gift selections to localStorage.",
            error,
        );
    }

    return normalized;
}

/**
 * Read all three selected product IDs.
 *
 * Safe during SSR: returns empty selections when window/localStorage
 * is unavailable or the stored payload is invalid.
 */
export function getGiftSelectionIds(): GiftSelectionIds {
    if (typeof window === "undefined") {
        return { ...EMPTY_GIFT_SELECTION_IDS };
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return { ...EMPTY_GIFT_SELECTION_IDS };
        }

        const parsed = JSON.parse(raw) as Partial<GiftSelectionIds>;

        return {
            textile: normalizeId(parsed.textile),
            scent: normalizeId(parsed.scent),
            dokra: normalizeId(parsed.dokra),
        };
    } catch (error) {
        console.error(
            "Unable to read gift selections from localStorage.",
            error,
        );

        return { ...EMPTY_GIFT_SELECTION_IDS };
    }
}

/**
 * Remove the saved gift-builder draft.
 */
export function clearGiftSelectionIds(): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error(
            "Unable to clear gift selections from localStorage.",
            error,
        );
    }
}
