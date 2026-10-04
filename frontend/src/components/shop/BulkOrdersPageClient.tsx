"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Sparkles,
  Gift,
  Building2,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Package,
  Layers,
  Send,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { canonicalShopRoutes } from "@/src/lib/shop-routes";

const OCCASIONS = [
  "Corporate & Executive Gifting",
  "Hospitality, Hotel & Spa Curation",
  "Weddings & Milestone Celebrations",
  "Wholesale, Retail & Studio Partnership",
  "Custom Bespoke Formulation",
  "Other Celebration",
];

const QUANTITIES = [
  "20 – 50 units",
  "51 – 100 units",
  "101 – 250 units",
  "250 – 500 units",
  "500+ units",
];

const PRODUCT_CATEGORIES = [
  "Artisanal Perfumes & Botanical Fragrances",
  "Handcrafted Bronze & Ceramic Diffusers",
  "Handloom Textiles, Scarves & Squares",
  "Dokra Brass Ornaments & Artifacts",
  "Curated Ritual Hampers & Gift Pouches",
];

const CUSTOMIZATION_OPTIONS = [
  "Bespoke Wooden / Linen Box Packaging",
  "Brand Logo Monogramming or Engraving",
  "Personalized Calligraphy & Gift Notes",
  "Custom Scent Profile Development",
];

export default function BulkOrdersPageClient() {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState(OCCASIONS[0]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([PRODUCT_CATEGORIES[0]]);
  const [estimatedQuantity, setEstimatedQuantity] = useState(QUANTITIES[0]);
  const [targetDate, setTargetDate] = useState("");
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleProduct = (category: string) => {
    setSelectedProducts((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleCustomization = (custom: string) => {
    setSelectedCustomizations((prev) =>
      prev.includes(custom) ? prev.filter((c) => c !== custom) : [...prev, custom]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in your name, email, and phone number.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/public/lead/bulk-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            companyName: companyName || undefined,
            email,
            phone,
            purpose,
            productInterests: selectedProducts.join(", "),
            estimatedQuantity,
            targetDate: targetDate || undefined,
            customizationNotes: selectedCustomizations.join(", "),
            notes: notes || undefined,
          }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          setError(data?.error ?? "Unable to submit your inquiry. Please try again.");
          return;
        }

        setIsSubmitted(true);
      } catch {
        setError("Network error. Please check your connection and try again.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#f3efe7] pt-[72px] text-[#3a3a3a] sm:pt-[76px]">
      {/* Hero Section */}
      <section className="section-primary pb-12 pt-20 sm:pt-24">
        <div className="page-container max-w-[1200px]">
          <div className="max-w-[760px]">
            <div className="flex items-center gap-2">
              <span className="flex h-5 items-center justify-center rounded-full bg-[#2e4a36]/15 px-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#2e4a36]">
                Bespoke & Wholesale
              </span>
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#9a785d]">
                Seijaku Concierge
              </p>
            </div>
            <h1 className="mt-4 font-serif text-[clamp(38px,4.5vw,62px)] leading-[1.06] tracking-[-0.03em] text-[#1d1a17]">
              Artisanal scale, tailored for meaningful moments.
            </h1>
            <p className="mt-6 text-[16px] leading-[1.85] text-[#5f584f]">
              From executive gifting and luxury hospitality scenting to wedding favors and private studio collections, Seijaku creates bespoke ritual objects that honor slowness and handcrafted integrity.
            </p>
          </div>

          {/* Pillars Cards */}
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[24px] border border-[#d8cec1] bg-[#faf7f1] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2eadf] text-[#2e4a36]">
                <Gift size={20} />
              </div>
              <h2 className="mt-5 font-serif text-[20px] text-[#1d1a17]">
                Corporate Gifting
              </h2>
              <p className="mt-2 text-[13px] leading-[1.7] text-[#655e54]">
                Curated gift sets in linen-wrapped boxes with personalized handwritten notes and brand monogramming.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#d8cec1] bg-[#faf7f1] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2eadf] text-[#2e4a36]">
                <Building2 size={20} />
              </div>
              <h2 className="mt-5 font-serif text-[20px] text-[#1d1a17]">
                Hospitality & Spas
              </h2>
              <p className="mt-2 text-[13px] leading-[1.7] text-[#655e54]">
                Signature ambient diffusion, bronze diffuser suites, and bespoke botanical welcome sets for guest suites.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#d8cec1] bg-[#faf7f1] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2eadf] text-[#2e4a36]">
                <HeartHandshake size={20} />
              </div>
              <h2 className="mt-5 font-serif text-[20px] text-[#1d1a17]">
                Weddings & Events
              </h2>
              <p className="mt-2 text-[13px] leading-[1.7] text-[#655e54]">
                Hand-poured fragrance favors, bronze dokra tokens, and customized bridal party formulations.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#d8cec1] bg-[#faf7f1] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2eadf] text-[#2e4a36]">
                <Layers size={20} />
              </div>
              <h2 className="mt-5 font-serif text-[20px] text-[#1d1a17]">
                Wholesale & Studios
              </h2>
              <p className="mt-2 text-[13px] leading-[1.7] text-[#655e54]">
                Trade discounts, tiered volume pricing, and architectural installations for designers and curators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section className="section-primary pb-24 pt-4">
        <div className="page-container max-w-[1200px]">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            {/* Left: Process & Assurance */}
            <div className="space-y-8">
              <div className="rounded-[30px] border border-[#d8cec1] bg-[#eae3d8] p-8 sm:p-10">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#8d7d6d]">
                  How We Work
                </p>
                <h2 className="mt-4 font-serif text-[28px] leading-[1.2] text-[#1d1a17]">
                  The Concierge Pathway
                </h2>

                <div className="mt-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#2e4a36] text-[12px] font-semibold text-[#f4efe8]">
                      1
                    </span>
                    <div>
                      <p className="font-serif text-[17px] text-[#1d1a17]">Inquiry & Vision</p>
                      <p className="mt-1 text-[13px] leading-[1.7] text-[#60584e]">
                        Tell us about your occasion, target quantity, and custom branding requirements.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#2e4a36] text-[12px] font-semibold text-[#f4efe8]">
                      2
                    </span>
                    <div>
                      <p className="font-serif text-[17px] text-[#1d1a17]">Curated Proposal & Samples</p>
                      <p className="mt-1 text-[13px] leading-[1.7] text-[#60584e]">
                        Within 24-48 hours, our team prepares custom options, sample kits, and tiered pricing.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#2e4a36] text-[12px] font-semibold text-[#f4efe8]">
                      3
                    </span>
                    <div>
                      <p className="font-serif text-[17px] text-[#1d1a17]">Artisanal Craft & Monogramming</p>
                      <p className="mt-1 text-[13px] leading-[1.7] text-[#60584e]">
                        Master craftsmen in Bengal craft, handloom, and bottle each item with exquisite detail.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#2e4a36] text-[12px] font-semibold text-[#f4efe8]">
                      4
                    </span>
                    <div>
                      <p className="font-serif text-[17px] text-[#1d1a17]">White-Glove Delivery</p>
                      <p className="mt-1 text-[13px] leading-[1.7] text-[#60584e]">
                        Secure insulated packaging and pan-India insured freight dispatched right on schedule.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 border-t border-black/8 pt-6 space-y-3 text-[13px] text-[#655d52]">
                  <div className="flex items-center gap-2">
                    <Mail size={15} className="text-[#2e4a36]" />
                    <span>Direct Concierge: lifeatseijaku@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={15} className="text-[#2e4a36]" />
                    <span>Phone: +91 9432804418</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Interactive Form */}
            <div className="rounded-[30px] border border-[#d8cec1] bg-[#faf7f1] p-8 sm:p-10">
              {isSubmitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="mt-6 font-serif text-[32px] tracking-[-0.02em] text-[#1d1a17]">
                    Inquiry Received
                  </h2>
                  <p className="mx-auto mt-3 max-w-[42ch] text-[15px] leading-[1.8] text-[#5f584f]">
                    Thank you, <strong className="text-[#1d1a17]">{name}</strong>. Our gifting concierge has received your request for {estimatedQuantity} and will reach out to <strong className="text-[#1d1a17]">{email}</strong> within 24 hours.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        setName("");
                        setNotes("");
                      }}
                      className="rounded-full border border-[#2e4a36]/30 bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-[#2e4a36] hover:bg-[#2e4a36] hover:text-[#f4efe8]"
                    >
                      Submit Another Request
                    </button>
                    <Link
                      href={canonicalShopRoutes.shopAll}
                      className="rounded-full bg-[#2e4a36] px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-[#f4efe8] hover:bg-[#243c2c]"
                    >
                      Explore The Storefront
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[#9a785d]">
                      Request a Bespoke Proposal
                    </p>
                    <h2 className="mt-2 font-serif text-[30px] leading-[1.14] text-[#1d1a17]">
                      Tell us about your project.
                    </h2>
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-[#e7c1ba] bg-[#fff1ee] px-4 py-3 text-[13px] text-[#9f4332]">
                      {error}
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#7a6f62]">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priya Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1.5 w-full rounded-[16px] border border-[#cfc3b4] bg-white px-4 py-3 text-[14px] text-[#2f2924] outline-none focus:border-[#2e4a36] focus:ring-2 focus:ring-[#2e4a36]/15"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#7a6f62]">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Studio Vista / Private"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="mt-1.5 w-full rounded-[16px] border border-[#cfc3b4] bg-white px-4 py-3 text-[14px] text-[#2f2924] outline-none focus:border-[#2e4a36] focus:ring-2 focus:ring-[#2e4a36]/15"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#7a6f62]">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="priya@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5 w-full rounded-[16px] border border-[#cfc3b4] bg-white px-4 py-3 text-[14px] text-[#2f2924] outline-none focus:border-[#2e4a36] focus:ring-2 focus:ring-[#2e4a36]/15"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#7a6f62]">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1.5 w-full rounded-[16px] border border-[#cfc3b4] bg-white px-4 py-3 text-[14px] text-[#2f2924] outline-none focus:border-[#2e4a36] focus:ring-2 focus:ring-[#2e4a36]/15"
                      />
                    </div>
                  </div>

                  {/* Occasion / Purpose */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#7a6f62]">
                      Occasion / Intended Purpose
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="mt-1.5 w-full rounded-[16px] border border-[#cfc3b4] bg-white px-4 py-3 text-[14px] text-[#2f2924] outline-none focus:border-[#2e4a36] focus:ring-2 focus:ring-[#2e4a36]/15"
                    >
                      {OCCASIONS.map((occ) => (
                        <option key={occ} value={occ}>
                          {occ}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product Categories */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#7a6f62]">
                      Objects of Interest (Select all that apply)
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {PRODUCT_CATEGORIES.map((cat) => {
                        const active = selectedProducts.includes(cat);
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => toggleProduct(cat)}
                            className={`rounded-full px-3.5 py-2 text-[12px] transition ${
                              active
                                ? "bg-[#2e4a36] text-[#f4efe8]"
                                : "border border-[#cfc3b4] bg-white text-[#52493e] hover:bg-[#f2eadf]"
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity & Date */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#7a6f62]">
                        Estimated Quantity
                      </label>
                      <select
                        value={estimatedQuantity}
                        onChange={(e) => setEstimatedQuantity(e.target.value)}
                        className="mt-1.5 w-full rounded-[16px] border border-[#cfc3b4] bg-white px-4 py-3 text-[14px] text-[#2f2924] outline-none focus:border-[#2e4a36] focus:ring-2 focus:ring-[#2e4a36]/15"
                      >
                        {QUANTITIES.map((qty) => (
                          <option key={qty} value={qty}>
                            {qty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#7a6f62]">
                        Target Delivery Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="mt-1.5 w-full rounded-[16px] border border-[#cfc3b4] bg-white px-4 py-3 text-[14px] text-[#2f2924] outline-none focus:border-[#2e4a36] focus:ring-2 focus:ring-[#2e4a36]/15"
                      />
                    </div>
                  </div>

                  {/* Customization Options */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#7a6f62]">
                      Customization Requirements
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {CUSTOMIZATION_OPTIONS.map((custom) => {
                        const active = selectedCustomizations.includes(custom);
                        return (
                          <button
                            type="button"
                            key={custom}
                            onClick={() => toggleCustomization(custom)}
                            className={`rounded-full px-3.5 py-2 text-[12px] transition ${
                              active
                                ? "bg-[#7a6448] text-[#fcfaf6]"
                                : "border border-[#cfc3b4] bg-white text-[#52493e] hover:bg-[#f2eadf]"
                            }`}
                          >
                            {custom}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#7a6f62]">
                      Additional Notes or Project Details
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Share any details on themes, preferred notes, budget target, or shipping destinations..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1.5 w-full rounded-[16px] border border-[#cfc3b4] bg-white px-4 py-3 text-[14px] leading-[1.8] text-[#2f2924] outline-none focus:border-[#2e4a36] focus:ring-2 focus:ring-[#2e4a36]/15"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2e4a36] py-4 text-xs font-medium uppercase tracking-[0.18em] text-[#f4efe8] transition hover:bg-[#21382c] disabled:opacity-60"
                  >
                    <Send size={14} />
                    <span>{isPending ? "Submitting Inquiry..." : "Submit Bespoke Inquiry"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
