"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

/**
 * Modern, luxury page transition loader for Seijaku.
 * Combines:
 * 1. An instant top-edge glowing progress bar that triggers immediately on any link click
 * 2. A subtle floating glass badge for transitions taking longer than 250ms
 * 3. Graceful 100% completion and fade-out upon pathname or searchParams change
 */
function NavigationEventsHandler({
  onRouteStart,
  onRouteEnd,
}: {
  onRouteStart: () => void;
  onRouteEnd: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  // When pathname or searchParams change, route transition has completed
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onRouteEnd();
  }, [pathname, searchParams, onRouteEnd]);

  // Intercept all internal link clicks to provide 0ms instantaneous feedback
  useEffect(() => {
    function handleAnchorClick(e: MouseEvent) {
      // Ignore modified clicks (new tab, etc.)
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore anchor target="_blank", downloads, or javascript:
      if (anchor.target === "_blank" || anchor.hasAttribute("download") || href.startsWith("javascript:")) {
        return;
      }

      // Ignore in-page hash links like href="#details"
      if (href.startsWith("#")) return;

      try {
        const currentUrl = new URL(window.location.href);
        const nextUrl = new URL(href, window.location.origin);

        // Ignore external links
        if (nextUrl.origin !== currentUrl.origin) return;

        // Ignore if clicking the exact same URL (pathname + search + hash)
        if (
          nextUrl.pathname === currentUrl.pathname &&
          nextUrl.search === currentUrl.search &&
          nextUrl.hash === currentUrl.hash
        ) {
          return;
        }

        // Internal navigation starting!
        onRouteStart();
      } catch {
        // Fallback for malformed URLs
      }
    }

    function handlePopState() {
      // Browser back/forward navigation
      onRouteStart();
    }

    // Programmatic trigger events
    function handleCustomStart() {
      onRouteStart();
    }
    function handleCustomEnd() {
      onRouteEnd();
    }

    document.addEventListener("click", handleAnchorClick, { capture: true });
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("seijaku-route-start", handleCustomStart);
    window.addEventListener("seijaku-route-end", handleCustomEnd);

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("seijaku-route-start", handleCustomStart);
      window.removeEventListener("seijaku-route-end", handleCustomEnd);
    };
  }, [onRouteStart, onRouteEnd]);

  return null;
}

export default function PageTransitionLoader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [showAmbientBadge, setShowAmbientBadge] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const badgeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    // Clear any pending timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    setLoading(true);
    setVisible(true);
    setProgress(18);

    // Gently advance progress to simulate realistic network loading
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 50) return prev + Math.random() * 12 + 4;
        if (prev < 75) return prev + Math.random() * 6 + 2;
        if (prev < 88) return prev + Math.random() * 2 + 0.5;
        return prev;
      });
    }, 180);

    // If loading takes longer than 260ms, show modern floating ambient badge
    badgeTimerRef.current = setTimeout(() => {
      setShowAmbientBadge(true);
    }, 260);

    // Safety fallback: auto-finish after 9 seconds if navigation gets stuck
    safetyTimeoutRef.current = setTimeout(() => {
      stopLoading();
    }, 9000);
  }, []);

  const stopLoading = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    // Shoot to 100% completion
    setProgress(100);
    setLoading(false);
    setShowAmbientBadge(false);

    // Fade out smoothly
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setProgress(0);
      }, 200);
    }, 280);
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <NavigationEventsHandler onRouteStart={startLoading} onRouteEnd={stopLoading} />
      </Suspense>

      {/* Top glowing progress bar */}
      {visible && (
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-[3px] w-full overflow-hidden"
          style={{
            opacity: progress === 100 ? 0 : 1,
            transition: "opacity 300ms ease-out",
          }}
        >
          {/* Progress fill */}
          <div
            className="h-full bg-gradient-to-r from-[#2B3B2F] via-[#4A6350] via-70% to-[#C2A26F] shadow-[0_0_12px_rgba(74,99,80,0.8),0_0_4px_rgba(194,162,111,0.9)]"
            style={{
              width: `${progress}%`,
              transition: progress === 100 ? "width 200ms ease-out" : "width 280ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Shimmer light beam at leading edge */}
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-r from-transparent to-white/60 blur-[1px] transform translate-x-1" />
          </div>
        </div>
      )}

      {/* Floating tranquil ambient badge for transitions taking >260ms */}
      {showAmbientBadge && (
        <div
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999998] pointer-events-none transition-all duration-300 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center gap-2.5 rounded-full border border-[#C2A26F]/35 bg-[#2B3B2F]/92 px-4 py-2 text-[#FAF5EC] shadow-[0_12px_32px_rgba(20,25,22,0.28)] backdrop-blur-md">
            <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
              <span className="absolute h-full w-full rounded-full bg-[#C2A26F]/30 animate-ping opacity-75" />
              <Image
                src="/images/seijaku-emblem-g.png"
                alt=""
                width={16}
                height={16}
                className="h-3.5 w-3.5 object-contain"
              />
            </span>
            <span
              className="text-[12px] font-medium tracking-[0.12em] uppercase text-[#EADEC9]"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              Loading stillness...
            </span>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Utility function to trigger the route loader manually before programmatic router navigation.
 * E.g.:
 *   triggerPageLoader();
 *   router.push('/checkout?gift=true');
 */
export function triggerPageLoader() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("seijaku-route-start"));
  }
}
