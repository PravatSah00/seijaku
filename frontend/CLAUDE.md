# CLAUDE.md — frontend workspace

Complements the repo-root `CLAUDE.md`. Read that first.

## Stack

Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4, Framer Motion. Self-hosted fonts in `src/app/fonts/`. Turbopack dev.

## Key Paths

- `src/app/(marketing)/` — homepage route group
- `src/app/shop/`, `src/app/shop/[slug]/` — canonical commerce routes
- `src/app/admin/(auth)/login/` — public admin login
- `src/app/admin/(protected)/*` — session-gated admin pages; layout enforces auth
- `src/app/api/admin/session/route.ts` — login/logout/session lookup (BFF)
- `src/app/api/admin/proxy/[...path]/route.ts` — attaches bearer token, proxies to backend `/admin/*`
- `src/app/api/public/[...path]/route.ts` — passthrough to backend public endpoints (newsletter, orders, reservations, inquiries)
- `src/components/AppShell.tsx` — splits marketing chrome from `/admin` chrome based on pathname
- `src/components/shop/{diffusers,lifestyle,perfumes,textiles}/*` — per-bridge custom clients. All four render entirely from the `products` prop they receive — no hardcoded slug arrays. Per-bridge grouping rule per Decision #30: perfumes by `Product.useCase`, textiles by slug-suffix `-pocket-square`, diffusers + lifestyle as flat grids. Each client also receives the `page: ShopBridgePageConfig` prop and reads `page.heroImage` / `page.heroImageAlt` / `page.heroImagePosition` for the hero — admin edits via `/admin/bridge-pages` surface within one ISR window. The page-intro components (`LifestylePageIntro`, `TextilesPageIntro`, `DiffuserPageIntro`) each fall back to a bundled-asset path when the column is empty so partial setup never blanks the page. `ShopBridgePageClient.tsx` is the generic fallback (currently only used for `dokra-ornaments`)
- `src/components/shop/ShopFilterRail.tsx` + `ShopFilterDrawer.tsx` — Shop All filter UI (rail on desktop, drawer on mobile); `ShopFilterSection.tsx` is the shared chip-radio primitive. Rail collapse state persists in `localStorage` under `seijaku.shopFilterRail.collapsed`
- `src/components/howSeijakuWorks.options.ts` — editable option data for the "Choose a scent" and "Choose an artifact" dropdowns in the Home Page "How Seijaku works" section. Add a new option by appending to the relevant step's `items` array; no component edit required
- `src/components/HowSeijakuWorks.tsx` — step 3's "Follow a 2-minute ritual / Watch" CTA is hardcoded to the brand YouTube channel via the `RITUAL_VIDEO_HREF` module constant. `Story.videoUrl` (admin-curated per Decision #29) is still saved and remains the field of record for any future per-month video consumer, but this surface deliberately ignores it
- `src/app/seasonaldrops-hemanta/*` — canonical Hemanta seasonal-drop page. `/seasonaldrops` is a redirect kept for bookmark continuity; future drops should mirror this pattern (`/seasonaldrops-<slug>`). The server `page.tsx` fetches the four `hemanta-*` backing products via `fetchProductBySlug` and passes a `Record<slug, ProductView>` prop into the client component so Reserve buttons open `ProductDetailDrawer` with backend data (Decision #24)
- `/shop/seasonaldrops` — browsable bridge (generic `ShopBridgePageClient`) surfacing the diffuser sets from whichever drops are currently active. Editorial stories still live on `/seasonaldrops-<slug>`. Add a new drop's products via `/admin/bridge-pages` → Seasonal Drops (Phase 4b.i migrated bridge-page product lists to backend)
- `ProductView.customizationOptions` — optional per-product variant pickers (label + values + required flag). When set, `ProductDetailDrawer` renders a `<select>` per option and gates Buy Now until every required option is chosen. Source: backend `ProductOption` + `ProductOptionValue` tables, normalized in `src/lib/product-types.ts`
- **Drawer video enrichment:** `ProductDetailDrawer` lazily fetches `/api/public/catalog/products/:slug` on open and picks up any `VIDEO`-kind media attached to the backend record. Single 8-second-bounded fetch, silent on any failure. Hand-maintained `item.videoUrl` wins when present
- **`ShopItemType` / `ShopMaterial` / `ShopUseCase` taxonomy types:** defined in `src/lib/shop-taxonomy.ts` as TypeScript unions. The backend's `Product.type` / `Product.material` are free-text, so adding a new value is a frontend-only edit. Shop All filter dropdowns come from `getShopTypes()` / `getShopMaterials()` (also in `shop-taxonomy.ts`) — static curated labels, not derived from the catalog. Per Decision #30, curated bridge pages render dynamically from the bridge-page products list — admin-created products auto-appear without a code change. `ShopUseCase` is now enforced via the `<select>` in `ProductEditor.tsx`'s "Use case" field; if you add a new value to the union, also extend the dropdown options.
- **`LifestyleSetField` selection modes:** fields default to SINGLE (`<select>` dropdown). Set `selectionMode: "MULTI"` + `minSelections` + `maxSelections` for a checkbox list with hard-cap enforcement (unchecked rows disable once `maxSelections` is hit). Selected values become `string[]` for MULTI fields vs `string` for SINGLE — hence the `LifestyleFieldValue = string | string[]` alias. Live Calm Gift Pouch's picker options derive from the `ProductView[]` prop flowing into `LifestylePageClient` via `buildLifestyleSections(products)` (Decision #23), filtered by `bridgeCategory` + buyable status
- `src/components/admin/*` — admin shell and editors; call `/api/admin/proxy/*` from the client. The SUPER_ADMIN "Sync New Products" button was deleted in Phase 4b.final (Decision #26) — all product creation now goes through `/admin/products/new`
- `src/components/admin/ResourceManager.tsx` — generic admin form used by `/admin/bridge-pages`, `/admin/articles`, `/admin/retreats`, `/admin/programs`, etc. Field types include `text`, `textarea`, `select`, `checkbox`, `number`, `datetime`, `json`, `stringArray`, `email`, `password`, and `image`. The `image` type renders an Upload button + thumbnail + URL-text fallback; uploads go through `/api/admin/proxy/media/upload` and write the returned URL into the bridge's string column (Decision #31). Empty text-like fields serialize as `""` (not `null`); empty JSON fields as `{}` — the Zod schemas in the backend `bridgePageSchema` and friends reject `null` on `z.string()` columns
- `next.config.ts` — `images.remotePatterns` whitelists the Supabase Storage host. Required for any `<Image src=...>` pointing at admin-uploaded media (Decision #31). If the bucket / project ref ever changes (Decision #12 follow-up), update the allowlist or every uploaded image will return `INVALID_IMAGE_OPTIMIZE_REQUEST` from the Vercel image proxy
- `src/lib/admin-session.ts` — signed httpOnly cookie helpers (server-only)
- `src/lib/admin-backend.ts` — typed admin API fetcher for server components (redirects to `/admin/login` on 401)
- `src/lib/backend.ts` — low-level backend fetch used by both public proxy and admin helpers
- `src/lib/shop-routes.ts` — canonical route map (`canonicalShopRoutes`) + `ShopBridgeSlug` re-export
- `src/lib/shop-taxonomy.ts` — filter unions, matchers, release-date lookup. Static / structural, no backend dependency
- `src/lib/product-types.ts` — `ProductView` shape, normalizers, `fetchProducts` / `fetchProductBySlug`, status helpers (`isNotifyMeProduct`, `isUnbuyableProduct`), `getShopProductUseCase`
- `src/lib/categoryBridge.ts` — **legacy**, do not extend

## Patterns To Follow

- **Server component → backend data:** use `adminBackendJson()` (from `src/lib/admin-backend.ts`, pins `no-store`) for admin pages, or `publicBackendJson(path, { revalidate, tags })` (from `src/lib/backend.ts`, ISR-cached) for public pages. Always pass an explicit `tags: CacheTag[]` on public reads — the admin BFF proxy invalidates by tag on writes via `tagsForAdminWrite()` in `src/lib/cache-tags.ts`. Do not call `fetch()` directly from components. Decision #15.
- **Client editor → backend write:** POST/PATCH to `/api/admin/proxy/<endpoint>`, never directly to the backend. The proxy attaches the bearer token from the httpOnly cookie.
- **Auth in server components:** call `requireCurrentAdmin()` at the top; it redirects to `/admin/login` on missing/invalid session.
- **Path alias:** `@/*` resolves to the workspace root (`frontend/`). Import from `@/src/lib/...`, not relative.
- **Route groups** (`(marketing)`, `(auth)`, `(protected)`) exist to swap layouts without leaking into the URL. Do not remove them without adjusting the shell.
- **Shop product CTAs:** `components/shop/ShopProductActions.tsx` is the canonical Buy Now / View Details / Add to Wishlist row. Compose it from every product card instead of hand-rolling the three buttons. Cards with variant selectors pass `isBuyDisabled` + `selection`; cards without selectors pass neither. The component switches the primary slot automatically: products in `notifiableStatuses` (currently just `"Waitlist"`) render **Notify Me** which opens `NotifyMeModal` (POSTs to `/api/public/lead/product-notifications`); products in `unbuyableStatuses` (`"Sold Out"`, `"Upcoming"`) render a muted status pill instead of any primary CTA. See `src/lib/product-types.ts` for the helpers and `DECISIONS.md#14` for the rationale.
- **Curated slug pinning** (Decisions #30, #32). `/shop/diffusers`, `/shop/lifestyle`, `/a-seijaku-life`, and the home `JournalPreviewSection` keep small slug constants in their page-client files (`DIFFUSERS_SLUGS`, `DAYTIME_PAUSES_SLUGS`/`PERSONAL_RITUALS_SLUGS`/`CUSTOM_GIFTING_SLUG`, `CURATED_ARTICLE_SLUGS`). When a record is renamed in `/admin/products` or `/admin/articles`, update the relevant constant in the same change. The home `JournalPreviewSection` and `app/a-seijaku-life/page.tsx` keep separate copies of the article list — keep them in sync by hand. `/a-seijaku-life` renders the three articles in a 1-large + 2-small editorial grid (first slug = featured large card, positional — not driven by the article's `featured` boolean); the home preview keeps a flat 3-up grid. Articles must be `PUBLISHED` in `/admin/articles` to appear; `/content/articles` filters draft records out. `JournalPreviewSection` is a client component and consumes the raw `/api/public/content/articles` payload — read `primaryImage.url` / `primaryImage.altText` directly from the wire shape (the view-model field `image` only exists after `toViewModel()` in `seijaku-life-types.ts`, which is server-only via `fetchArticles()`). When `primaryImage` is null the card falls back to a neutral bundled asset rather than a per-slug hardcoded path — admins should upload a cover via `/admin/articles` if they want a real image.
- **Editorial bridge wrappers opt out of the route fade-in observer** with `data-reveal` on the outer `section.section-primary` (`PerfumesPageClient`, `DiffusersPageClient`, `TextilesPageClient`, `ShopBridgePageClient`). The global `RouteTransitionObserver` in `AppShell` adds `site-reveal-target` (opacity:0) and only flips `is-visible` once 16% of the section is in viewport — these wrappers grew tall enough that the threshold was no longer reliable. New curated bridge clients should follow the same pattern.
- **Article detail page** (`app/a-seijaku-life/[slug]/page.tsx`) renders the full editorial layout: hero image → header (category / title / byline with reading time) → excerpt as dek → markdown body via `<ArticleBody>` → 2-up "More from Seijaku Life" footer. `<ArticleBody>` (`src/components/article/ArticleBody.tsx`) is a server component wrapping `react-markdown` + `remark-gfm` with hand-rolled Tailwind prose styles — no `@tailwindcss/typography` dep. **Safe HTML by default** (raw HTML in markdown is escaped); `rehype-raw` is deliberately not enabled. Admin-authored markdown is the only path to long-form public content — type into the **Body markdown** field on `/admin/articles` and it surfaces verbatim. Reading time is computed from word count at 200 wpm.
- **Article admin form** (`src/components/admin/ArticleManager.tsx`) supports a native **Upload image** button alongside the library `<select>` for `primaryImage`. Uploads POST to `/api/admin/proxy/media/upload` (multipart) and the returned media-asset id is written straight into `primaryImageId`. A locally-cached thumbnail renders before the parent server-component refresh. Same pattern as the bridge-pages `image` field type (Decision #31), but here we set a foreign-key id instead of a URL string because `Article.primaryImageId` is an FK to `MediaAsset`.

## Dev Server

```bash
npm run dev                 # from frontend/
```

or from repo root:

```bash
npm run dev:frontend
```

Port 3000 default, falls through to 3001 if busy. Admin login: `/admin/login`.

## Build & Typecheck

```bash
npx tsc --noEmit            # typecheck only
npm run lint                # eslint
npm run build               # full Next build (used by Vercel)
```

`NEXT_IGNORE_INCORRECT_LOCKFILE=1` is set in dev/build scripts — do not remove. Sharp is pinned for image optimization; don't drop it. Optional deps `@tailwindcss/oxide-linux-x64-gnu` and `lightningcss-linux-x64-gnu` are pinned for Vercel Linux builds.

## Env Vars

- `BACKEND_INTERNAL_URL` — base URL for backend (default `http://localhost:4001`). Must be set in Vercel Preview+Production.
- `ADMIN_COOKIE_NAME` — optional, defaults to `seijaku-admin-session`.
- `ADMIN_COOKIE_SECRET` — HMAC secret for the admin session cookie. Required in Vercel Preview+Production.
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — Razorpay public key id used by the Checkout SDK (`Razorpay({ key, ... })` in `CheckoutPageClient`). Must be set in Vercel Preview+Production. **Only the `key_id` ever reaches the browser** — `key_secret` and `webhook_secret` are backend-only (Decision #33).

The `key_id` is the only `NEXT_PUBLIC_*` var in this app. All other backend access is server-side by design.

## Razorpay Checkout Loader

`src/lib/razorpay.ts` lazily injects `https://checkout.razorpay.com/v1/checkout.js` and exports a typed `loadRazorpayCheckout()` that resolves to the global `Razorpay` constructor. Single-shot promise cache; 10s timeout via `setTimeout`; rejects with a typed `Error` on timeout or load failure. `CheckoutPageClient` is the only consumer today — pattern is reusable if other surfaces need to open Razorpay.

## Common Gotchas

- `AppShell.tsx` checks `pathname.startsWith("/admin")` to skip marketing chrome. Adding a new top-level admin-adjacent route needs the same check.
- The `/shop-all`, `/lifestyle`, `/categories/[slug]` routes still exist as compatibility. New code should link to `/shop` and `/shop/[slug]`.
- If you add a new admin editor that uploads files, remember to pass `multipart/form-data` through — both proxy routes handle that case already; don't bypass the proxy.
- Turbopack dev is the default in Next 16 for this project. If something builds in prod but not dev (or vice versa), note that explicitly before debugging.
