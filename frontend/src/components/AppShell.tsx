"use client";

import { usePathname } from "next/navigation";

import Footer from "@/src/components/Footer";
import Navbar from "@/src/components/Navbar";
import RouteTransitionObserver from "@/src/components/RouteTransitionObserver";
import PageTransitionLoader from "@/src/components/PageTransitionLoader";
import CartDrawer from "@/src/components/shop/CartDrawer";
import GiftLandingNavbar from "./LandingNavbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isLanding = pathname.startsWith("/gifts");

  return (
    <>
      <PageTransitionLoader />
      {isAdmin ? (
        children
      ) : isLanding ? (
        <>
          <RouteTransitionObserver />
          <div className="flex min-h-screen flex-col">
            <GiftLandingNavbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
          <CartDrawer />
        </>
      ) : (
        <>
          <RouteTransitionObserver />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
          <CartDrawer />
        </>
      )}
    </>
  );
}
