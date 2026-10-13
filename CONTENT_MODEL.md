# Seijaku Content Model

## Overview

Seijaku currently has a split content model.

There are two live layers:

1. frontend registries and route-level copy that still drive most public rendering
2. backend normalized records that drive admin CRUD, media relationships, and lead workflows

This document explains which layer is authoritative for which kind of change.

## Source-Of-Truth Split

The migration from frontend-registry content to backend-owned records is complete (Decision #26). Every content record that surfaces on the public storefront lives in PostgreSQL and is edited through the admin UI. What remains frontend-owned is structural — routes, taxonomy labels, editorial copy, and display helpers.

### Backend-Owned Content (everything on the public storefront)

Every content domain that a visitor sees reads from the backend via `publicBackendJson(path, { tags })` with tag-based ISR invalidation (Decision #15). Admin edits appear on public within seconds.

| Surface | Endpoint | Tags | Decision |
|---|---|---|---|
| `/a-seijaku-life` articles | `/content/articles` | `articles` | #16 |
| `/experiences` + `/retreats/[slug]` | `/content/retreats` | `retreats` | #17 |
| `/programs` index + `/programs/[slug]` | `/content/programs` | `programs`, `program-sessions` | #18 |
| `/shop/[slug]` bridge pages (metadata + product list) | `/catalog/bridge-pages/:slug` | `bridge-pages`, `products` | #19, #20 |
| `/shop` (Shop-All grid + filter/sort/search) | `/catalog/products` | `products` | #21 |
| Home `RitualSetsSection`, `SearchOverlay` | `/catalog/products`, `/catalog/products/:slug` (client-side) | `products` | #22 |
| `/shop/lifestyle` Live Calm Gift Pouch picker options | `ProductView[]` prop flowing into `LifestylePageClient` | `products` | #23 |
| `/seasonaldrops-hemanta` Reserve-button drawers | `/catalog/products/:slug` (server parent) | `products` | #24 |
| `/checkout`, `/collection`, bridge-page drawer lookups | `/catalog/products/:slug` (client lazy-fetch) or in-prop map | `products` | #25 |
| Home `HowSeijakuWorks` section (3 perfumes + 3 artifacts + ritual video, monthly admin curation) | `/content/story/current` (client lazy-fetch) | `stories`, `products` | #29 |
| Home hero banner image + `BrowseWorldSection` 4 card images | `/catalog/bridge-pages/home` (client lazy-fetch) | `bridge-pages` | #31 |
| `/our-story` hero image + "In the Making — Rituals take form" video pair | `/catalog/bridge-pages/our-story` (server) | `bridge-pages` | #31 |
| `/seasonaldrops-hemanta` hero + 4 form-character images + 3 image breaks | `/catalog/bridge-pages/seasonaldrops-hemanta` (server, parallel with hemanta product fetches) | `bridge-pages` | #31 |

### Frontend-Owned (structure + editorial copy, not content records)

- **Routes + taxonomy** — `frontend/src/lib/shop-routes.ts` (`canonicalShopRoutes`), `frontend/src/lib/shop-taxonomy.ts` (filter-option unions, `getShopTypes()` / `getShopMaterials()`, release-date lookup), `frontend/src/lib/navigation.ts` (drawer / navbar structure).
- **Display helpers + normalizers** — `frontend/src/lib/product-types.ts` (`ProductView`, status helpers, `fetchProducts`, `fetchProductBySlug`, `collectUseCases`), `bridge-page-types.ts`, `retreat-types.ts`, `program-types.ts`, `seijaku-life-types.ts`.
- **Route-level editorial copy** — hero sections and marketing decoration embedded in route files (`/`, `/our-story`, `/ritual`, `/seasonaldrops-hemanta`, `/programs` trust notes).
- **Static option lists** — hand-written card content on `/shop/diffusers`, `/shop/textiles`, `/shop/perfumes` (category prose, pairings, static slug lists). The previous home-page `howSeijakuWorks.options.ts` was deleted in Decision #29 — its products + video URL are now admin-curated via the `Story` model.
- **Compatibility redirects** — `/cart`, `/shop-all`, `/categories/[slug]`, `/lifestyle` route stubs (Decision #1).

Use this layer when:

- Changing route-level editorial copy (hero text, storytelling sections) that isn't a content record.
- Adding / renaming / reordering shop filter chip labels or taxonomy unions.
- Adjusting navigation structure.
- Changing a display helper, normalizer, or status-display mapping.

Do **not** use this layer to change product data, article text, retreat details, bridge-page metadata, program sessions, or anything admins edit. Those live in the backend DB.

### Backend-Owned Normalized Content

These records live in PostgreSQL and are managed through Prisma and the admin UI:

- `Admin`
- `MediaAsset`
- `ProductCategory`
- `Product`
- `ProductMedia`
- `ProductOption`
- `ProductOptionValue`
- `Collection`
- `ShopBridgePage`
- `Article`
- `Retreat`
- `Program`
- `ProgramSession`
- `SeasonalDrop`
- `SiteSetting`

Primary files:

- `backend/prisma/schema.prisma`
- `backend/prisma/seed.ts`
- `backend/src/routes/admin.ts`
- `backend/src/routes/public.ts`

Use this layer when:

- changing admin-editable content models
- changing API payloads
- changing media relationships
- changing lead workflows
- preparing a domain to move from frontend hardcoded content into backend-managed content

### Transactional Content

These records are backend-owned and already live in the database:

- `OrderRequest` (also carries Razorpay payment state per Decision #33: `paymentStatus`, `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, `totalAmount` in paise, `currency`)
- `OrderRequestItem`
- `NewsletterSubscription`
- `ProgramReservation`
- `RetreatInquiry`
- `ProductNotification`
- `WishlistItem`
- `RitualEntry`

Current usage:

- newsletter footer form persists to backend
- checkout creates a Razorpay order, persists an `OrderRequest` with `paymentStatus = CREATED`, and reconciles to `PAID` / `FAILED` / `REFUNDED` via the Razorpay webhook (Decision #33)
- program forms create reservations
- retreat forms create inquiries
- Notify Me signups on waitlisted products create product notifications (see `DECISIONS.md` #14)
- wishlist and ritual entries are schema-ready for later use

### Session And Identity Content

Admin identity is split across:

- backend `Admin` records
- a backend JWT
- a Next-signed httpOnly cookie handled by `frontend/src/lib/admin-session.ts`

This is not a customer auth system yet. Customer-facing account state is still mostly local UI state.

## Public Route-To-Content Mapping

### Shop

Current public source:

- `frontend/src/lib/shopAllItems.ts`

Although the backend also has seeded products and bridge pages, the storefront still mostly trusts the frontend registry.

### Navigation

Current public source:

- `frontend/src/lib/navigation.ts`

### Retreats

Current public source: backend-fed (Decision #17). The `/experiences` gallery (`RetreatGallery`) and the `/retreats/[slug]` detail page call `publicBackendJson("/content/retreats", { tags: ["retreats"] })` and `.../content/retreats/:slug`. Admin edits in `/admin/retreats` invalidate the `retreats` tag. The retreat inquiry form on the detail page still writes via `/api/public/lead/retreat-inquiries`.

### Programs

Current public source: backend-fed (Decision #18). The `/programs` index and a single dynamic `/programs/[slug]` detail route call `publicBackendJson("/content/programs", { tags: ["programs", "program-sessions"] })` and `.../content/programs/:slug`. Admin edits in `/admin/programs` and `/admin/program-sessions` invalidate both tags. The reservation form on the detail page still reads sessions from the backend and writes reservations via `/api/public/lead/program-reservations`. The "featured upcoming program" block on `/programs` is data-driven: first program with status `BOOKING_OPEN` that has a future session, using the earliest such session. When nothing qualifies, the block is hidden.

### Editorial

Current public source: backend-fed (Decision #16). The `/a-seijaku-life` index and `/a-seijaku-life/[slug]` pages call `publicBackendJson("/content/articles", { tags: ["articles"] })` and `.../content/articles/:slug`. Admin edits in `/admin/articles` invalidate the `articles` tag on save. Category filter chips are derived dynamically from whatever categories are present in the current dataset, so adding a new category in admin does not require a code change.

### Footer And Checkout Lead Flows

Current backend-owned write paths:

- `/api/public/lead/newsletter-subscriptions`
- `/api/public/lead/order-requests`
- `/api/public/lead/program-reservations`
- `/api/public/lead/retreat-inquiries`

## Admin Route-To-Content Mapping

Admin pages consume backend records through the Next BFF layer.

Examples:

- `/admin/products` -> backend products
- `/admin/bridge-pages` -> backend bridge pages
- `/admin/articles` -> backend articles
- `/admin/retreats` -> backend retreats
- `/admin/programs` -> backend programs
- `/admin/media` -> backend media assets
- `/admin/leads` -> backend lead records
- `/admin/settings` -> backend site settings
- `/admin/team` -> backend admin users

## Asset Model

### Public Bundled Assets

Most public pages still use files under:

- `frontend/public/images`

These asset references are hardcoded inside frontend content registries and components.

### Backend Media Library

The backend also has a `MediaAsset` model and admin media library.

Current purpose:

- admin-side record relationships
- upload support
- future migration path away from hardcoded bundled image references

Important limitation:

Changing a backend media record does not automatically update most public pages today if those pages still point directly at `frontend/public/images` paths in frontend code.

## Canonical Vs Legacy Modules

### Canonical For Current Public Shop Rendering

- `frontend/src/lib/shopAllItems.ts`

### Canonical For Admin/Database Catalog Records

- `backend/prisma/schema.prisma`
- backend `Product` data seeded from `backend/prisma/seed.ts`

### Legacy / Transitional

- `frontend/src/lib/categoryBridge.ts`

This module reflects the older `/categories/*` model and should not be treated as the main commerce source of truth.

## Editing Guidance

When you need to change content, decide which effect you want first:

1. If the public site must visibly change today, update the frontend registry or route-level component that still renders that page.
2. If the change is about admin CRUD, API behavior, leads, schema, or future migration, update the backend model and admin flow.
3. If you are moving a domain from frontend-owned content to backend-owned content, update both the code and these docs in the same change.

## Bridge-Page Rendering Rules

Decision #30 reintroduced curated slug pinning at the rendering layer for `/shop/diffusers`, `/shop/lifestyle`, `/a-seijaku-life`, and the home `JournalPreviewSection` after the brand opted to control which products / articles surface on each editorial page rather than auto-render the full bridge link list. The current rules:

| Surface | Curation rule | Notes |
|---|---|---|
| `/shop/perfumes` | Group every linked product by `Product.useCase` → 3 sections (Skin / Textile / Spaces). 4th "Uncategorized" section appears only when products have unset/unrecognized `useCase`. | `useCase` is admin-editable via a 3-value dropdown in `/admin/products`. Hero image / alt / position read from the bridge-page record (`heroImage`, `heroImageAlt`, `heroImagePosition`). |
| `/shop/diffusers` | Hardcoded slug list (`Kolkata-tea-diffuser`, `coffee-ceramic-diffuser-set`, `black-kitty-electric-and-manual-ceramic-diffuser`) rendered as image-led editorial feature rows with serif index numbers. | Other products on the bridge (wax melts, fragrance oils) stay reachable elsewhere; only this editorial page narrows. Update the const in `DiffusersPageClient.tsx` to add/remove. Hero image / alt / position read from the bridge-page record. Variant pickers suppressed for `Kolkata-tea-diffuser` and `coffee-ceramic-diffuser-set` (editorial decision — these products carry no meaningful customization); update `slugsWithoutVariantSelector` in `frontend/src/lib/product-types.ts` if either slug is renamed. |
| `/shop/scarves-and-squares` | Slug suffix `-pocket-square` (with title-token fallback) splits into Scarves / Pocket Squares. | No new schema field needed. Hero image / alt / position read from the bridge-page record. |
| `/shop/lifestyle` | Hardcoded slug lists in three editorial sections — Daytime Pauses, Personal Rituals, Custom Gifting (Live Calm Pouch picker). | Picker dropdowns derive options live from the catalog (Decision #23). Update the constants in `lifestyleSetConfig.ts` to add/remove. Hero image / alt read from the bridge-page record. |
| Home `RitualSetsSection` | Two newest `Product.type === "Ritual Box"` records by `releaseDate`. | Single catalog fetch; section hides when none exist. |
| `/a-seijaku-life` and home `JournalPreviewSection` | Hardcoded slug list of 3 articles (Decision #32). Admin can mark any of the three `featured` to put it in the featured slot. | The constant lives in two files (`a-seijaku-life/page.tsx` and `JournalPreviewSection.tsx`); keep them in sync by hand. |

Editorial copy on the perfumes / lifestyle / diffusers pages (section eyebrows, titles, descriptions, closing quotes) stays in the page-client files as module-scope constants — that copy is editorial framing, not per-product data, and matches the route-level-editorial split documented above.

## Editorial Bridge Pages (non-shop routes)

Per Decision #31, three additional `ShopBridgePage` records hold admin-uploadable media for non-shop editorial routes. They don't render at `/shop/<slug>`; they're data-only records consumed by their respective public routes.

| Slug | Public route | Slots admins edit in `/admin/bridge-pages` |
|---|---|---|
| `home` | `/` | `heroImage` (HeroBanner background) + `homeCard1Image..homeCard4Image` (one image per "Explore fragrance rituals" card) |
| `our-story` | `/our-story` | `heroImage` + `ritualVideo1Url` / `ritualVideo1Poster` / `ritualVideo2Url` / `ritualVideo2Poster` (the "In the Making — Rituals take form" two-panel strip) |
| `seasonaldrops-hemanta` | `/seasonaldrops-hemanta` | `heroImage` + `formCard1Image..formCard4Image` (4 character images) + `imageBreak1Image..imageBreak3Image` (3 mid-page image breaks) |

Each slot falls back to a bundled-asset path when the column is null, so no surface goes blank during partial setup. The 26 columns added to `ShopBridgePage` for these slots are all nullable; existing /shop bridges leave them all NULL.

## Cache Tags

When a public page starts reading from the backend (via `publicBackendJson` in `frontend/src/lib/backend.ts`), it must declare an explicit `tags: CacheTag[]` list. The admin BFF proxy invalidates those tags on successful writes. Tags are defined in `frontend/src/lib/cache-tags.ts`:

| Tag | Data domain | Invalidated by admin writes on |
|---|---|---|
| `articles` | Editorial `Article` records | `articles/*` |
| `retreats` | `Retreat` records | `retreats/*` |
| `programs` | `Program` records (and cascades from sessions) | `programs/*`, `program-sessions/*` |
| `program-sessions` | `ProgramSession` records | `program-sessions/*`, `programs/*` |
| `products` | `Product` + `ProductMedia` + `ProductOption*` | `products/*`, `categories/*`, `collections/*`, `bridge-pages/*`, `media/*` |
| `bridge-pages` | `ShopBridgePage` (+ product linkages) | `bridge-pages/*`, `products/*`, `categories/*`, `media/*` |
| `collections` | `Collection` (+ product linkages) | `collections/*`, `products/*` |
| `site-settings` | `SiteSetting` singleton (footer, logo, newsletter copy) | `site-settings`, `media/*` |
| `home` | Home page composition (reserved for Phase 5 block work) | — |
| `our-story` | Our Story composition (reserved for Phase 5 block work) | — |
| `ritual` | `/ritual` page step content (reserved for Phase 6 block work) | — |
| `navigation` | Header/footer navigation config (reserved for Phase 7) | — |

The full path-to-tags map is `tagsForAdminWrite(upstreamPath)` in `cache-tags.ts`. Unknown upstream paths fall through to `[]` (fail-safe). When a new admin resource is added, the map must be updated in the same change or the new edits won't invalidate anything.

See `DECISIONS.md` #15 for the full contract.

## Main Limitation

The biggest content-model risk right now is drift between:

- frontend content registries
- backend normalized content records

Until the storefront reads from the backend directly, treat the backend CMS as operational infrastructure plus migration groundwork, not yet a complete public-content source.
