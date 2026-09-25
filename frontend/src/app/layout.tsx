import type { Metadata } from "next";
import localFont from "next/font/local";
import AppShell from "@/src/components/AppShell";
import { CustomerAuthProvider } from "@/src/lib/customer-auth";
import { ShopStateProvider } from "@/src/components/shop/ShopStateProvider";
import "./globals.css";

const inter = localFont({
  variable: "--font-inter",
  src: [
    {
      path: "./fonts/inter-latin-300-normal.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/inter-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/inter-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
});

const playfair = localFont({
  variable: "--font-playfair",
  src: [
    {
      path: "./fonts/playfair-display-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Seijaku",
  description: "Quiet commerce for fragrance, objects, textiles, and guided ritual.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${inter.variable} ${playfair.variable} antialiased`}>
        <CustomerAuthProvider>
          <ShopStateProvider>
            <AppShell>{children}</AppShell>
          </ShopStateProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}

