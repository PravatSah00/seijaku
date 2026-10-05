import Link from "next/link";

import { canonicalShopRoutes } from "@/src/lib/shop-routes";
import FooterNewsletterForm from "@/src/components/FooterNewsletterForm";

const exploreLinks = [
  { label: "Shop All", href: canonicalShopRoutes.shopAll },
  { label: "Lifestyle", href: canonicalShopRoutes.lifestyle },
  { label: "Perfumes", href: canonicalShopRoutes.perfumes },
  { label: "Scarves & Squares", href: canonicalShopRoutes.scarvesAndSquares },
  { label: "Diffusers", href: canonicalShopRoutes.diffusers },
  { label: "Dokra Ornaments", href: canonicalShopRoutes.dokraOrnaments },
  { label: "Shopping Bag", href: canonicalShopRoutes.cart },
  { label: "Saved Wishlist", href: canonicalShopRoutes.collection },
];

const journalLinks = [
  { label: "Our Story", href: "/our-story" },
  { label: "Seijaku Weeklies", href: "#footer-email" },
  { label: "A Seijaku Life", href: "/a-seijaku-life" },
  { label: "Seijaku on YouTube", href: "https://www.youtube.com/@SeijakuWellness" },
];

const infoLinks = [
  { label: "Bulk & Corporate Orders", href: canonicalShopRoutes.bulkOrders },
  { label: "Terms & Conditions", href: "/terms-and-agreements" },
  { label: "Shipping, Returns & Exchanges", href: "/shipping-and-delivery" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "FAQs", href: "/faqs" },
  { label: "Get in Touch", href: "/contact" },
];

const followGroups = [
  {
    title: "Seijaku Lifestyle",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/seijaku_lifestyle?igsh=ajdvN3FxNzFrcXVk" },
      { label: "Facebook", href: "https://www.facebook.com/share/18EufBu88u/" },
    ],
  },
  {
    title: "Seijaku Experiences",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/seijakuexperiences?igsh=OWdpdzkxNGNrN3g" },
      { label: "Facebook", href: "https://www.facebook.com/share/17FWnRwhUz/" },
    ],
  },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="text-[14px] leading-[1.8] text-[#1f1d1a] hover:opacity-65">
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className="text-[14px] leading-[1.8] text-[#1f1d1a] hover:opacity-65">
      {label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="mt-[60px] w-full border-t border-black/5 bg-[#e8e2d7] pb-14 pt-24 text-[#1f1d1a] sm:pb-16 sm:pt-28 lg:pt-32">
      <div className="page-container max-w-[1180px]">
        <section>
          <p className="text-[12px] font-medium uppercase tracking-[0.28em] text-[#2b2823]">Seijaku Weeklies</p>
          <h3 className="mt-8 max-w-[760px] font-serif text-[clamp(34px,4vw,46px)] leading-[1.22] tracking-[-0.03em] text-[#151311]">
            Mid-week stillness for the modern life.
            <br />
            A quiet reset delivered every Wednesday.
          </h3>

          <FooterNewsletterForm />
        </section>

        <div className="mt-14 border-t border-black/6 pt-14 sm:mt-16 sm:pt-16" />

        <section className="grid gap-12 md:grid-cols-2 xl:grid-cols-[1.15fr_0.95fr_1fr_0.95fr] xl:gap-16">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.28em] text-[#1f1d1a]">Explore</p>
            <p className="mt-3 max-w-[24ch] text-[14px] leading-[1.8] text-[#7e776d]">Pathways into ritual and immersion.</p>
            <ul className="mt-8 space-y-5">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.28em] text-[#1f1d1a]">Journal</p>
            <p className="mt-3 max-w-[24ch] text-[14px] leading-[1.8] text-[#7e776d]">Literature, scent, and seasonal reflections.</p>
            <ul className="mt-8 space-y-5">
              {journalLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.28em] text-[#1f1d1a]">Follow Seijaku</p>
            <div className="mt-8 space-y-7">
              {followGroups.map((group) => (
                <div key={group.title}>
                  <p className="text-[14px] font-medium leading-[1.8] text-[#1f1d1a]">{group.title}</p>
                  <ul className="mt-4 space-y-4">
                    {group.links.map((link) => (
                      <li key={`${group.title}-${link.label}`}>
                        <FooterLink href={link.href} label={link.label} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.28em] text-[#1f1d1a]">Info</p>
            <ul className="mt-8 space-y-7">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-2 font-serif text-[17px] leading-[1.55] tracking-[-0.01em] text-[#2a241d]">
              <a href="mailto:lifeatseijaku@gmail.com" className="block transition-opacity duration-200 hover:opacity-65">
                lifeatseijaku@gmail.com
              </a>
              <a href="tel:+919432804418" className="block transition-opacity duration-200 hover:opacity-65">
                91-9432804418
              </a>
            </div>

            <div className="mt-8 font-serif text-[16px] leading-[1.7] tracking-[-0.01em] text-[#5b5145]">
              <p className="text-[#2a241d]">Registered Office:</p>
              <p>2A, F 154, B.P. Township,</p>
              <p>Kolkata 700094 India</p>
            </div>
          </div>
        </section>

        <div className="mt-16 flex justify-center border-t border-black/6 pt-8 sm:mt-20">
          <p className="text-center text-[14px] leading-[1.8] text-[#8a8378]">&copy; 2026 Seijaku. Quiet Structure.</p>
        </div>
      </div>
    </footer>
  );
}
