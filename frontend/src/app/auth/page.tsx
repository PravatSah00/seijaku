"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Phone, ArrowRight, CheckCircle2, Shield } from "lucide-react";
import { useCustomerAuth } from "@/src/lib/customer-auth";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account";
  const { login, register, isAuthenticated, customer } = useCustomerAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "register") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const res = await login(email.trim(), password);
        if (res.success) {
          router.push(redirectPath);
        } else {
          setError(res.error || "Failed to sign in. Please check your credentials.");
        }
      } else {
        const res = await register({
          email: email.trim(),
          password,
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
        });

        if (res.success) {
          setSuccessMessage("Account created successfully! Redirecting...");
          setTimeout(() => {
            router.push(redirectPath);
          }, 1000);
        } else {
          setError(res.error || "Failed to create account. Please try again.");
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated && customer) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-[#b89e6c]/30 bg-[#fbf8f2] p-8 text-center shadow-[0_20px_50px_rgba(40,30,20,0.06)] sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#294536]/10 text-[#294536]">
          <CheckCircle2 size={28} />
        </div>
        <h2 className="mt-5 font-serif text-2xl text-[#1f1a16]">Already Signed In</h2>
        <p className="mt-2 text-sm text-[#625a51]">
          You are currently signed in as <span className="font-medium text-[#1f1a16]">{customer.name || customer.email}</span>.
        </p>
        <div className="mt-7 flex flex-col gap-3">
          <Link
            href="/account"
            className="inline-flex items-center justify-center rounded-full bg-[#294536] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-[#f4efe8] transition hover:bg-[#21382c]"
          >
            Go to Account Dashboard
          </Link>
          <Link
            href="/collection"
            className="inline-flex items-center justify-center rounded-full border border-[#294536]/25 px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-[#294536] transition hover:bg-[#294536] hover:text-[#f4efe8]"
          >
            View Saved Wishlist
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div className="overflow-hidden rounded-[28px] border border-[rgba(111,100,86,0.18)] bg-[linear-gradient(180deg,#fcfaf6_0%,#f8f3eb_100%)] p-6 shadow-[0_24px_60px_rgba(44,37,28,0.07)] sm:p-10">
        {/* Header */}
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#9a785d]">
            {mode === "login" ? "Welcome Back" : "Begin Your Journey"}
          </p>
          <h1 className="mt-3 font-serif text-3xl tracking-[-0.02em] text-[#1d1a17]">
            {mode === "login" ? "Sign In to Seijaku" : "Create an Account"}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[#625a51]">
            {mode === "login"
              ? "Access your saved objects, ritual reflections, and order history."
              : "Save your favorite creations and seamlessly manage your orders."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 grid grid-cols-2 rounded-full border border-[rgba(111,100,86,0.18)] bg-[rgba(235,227,215,0.4)] p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`rounded-full py-2.5 text-xs font-medium uppercase tracking-[0.16em] transition-all duration-200 ${
              mode === "login"
                ? "bg-[#294536] text-[#f4efe8] shadow-sm"
                : "text-[#625a51] hover:text-[#1d1a17]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`rounded-full py-2.5 text-xs font-medium uppercase tracking-[0.16em] transition-all duration-200 ${
              mode === "register"
                ? "bg-[#294536] text-[#f4efe8] shadow-sm"
                : "text-[#625a51] hover:text-[#1d1a17]"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-xs text-rose-800">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-xs text-emerald-800">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-[#5d5449]">
                Full Name (Optional)
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8f7a65]">
                  <UserIcon size={16} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. Aiko Tanaka"
                  className="w-full rounded-2xl border border-[rgba(111,100,86,0.18)] bg-white/80 py-3 pl-10 pr-4 text-sm text-[#1d1a17] placeholder-[#a89e90] outline-none transition-colors focus:border-[#294536] focus:ring-2 focus:ring-[#294536]/15"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-[#5d5449]">
              Email Address <span className="text-[#9a785d]">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8f7a65]">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-[rgba(111,100,86,0.18)] bg-white/80 py-3 pl-10 pr-4 text-sm text-[#1d1a17] placeholder-[#a89e90] outline-none transition-colors focus:border-[#294536] focus:ring-2 focus:ring-[#294536]/15"
              />
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-[#5d5449]">
                Phone Number (Optional)
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8f7a65]">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-2xl border border-[rgba(111,100,86,0.18)] bg-white/80 py-3 pl-10 pr-4 text-sm text-[#1d1a17] placeholder-[#a89e90] outline-none transition-colors focus:border-[#294536] focus:ring-2 focus:ring-[#294536]/15"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-[#5d5449]">
              Password <span className="text-[#9a785d]">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8f7a65]">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
                className="w-full rounded-2xl border border-[rgba(111,100,86,0.18)] bg-white/80 py-3 pl-10 pr-11 text-sm text-[#1d1a17] placeholder-[#a89e90] outline-none transition-colors focus:border-[#294536] focus:ring-2 focus:ring-[#294536]/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#8f7a65] hover:text-[#1d1a17]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-[#5d5449]">
                Confirm Password <span className="text-[#9a785d]">*</span>
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8f7a65]">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full rounded-2xl border border-[rgba(111,100,86,0.18)] bg-white/80 py-3 pl-10 pr-4 text-sm text-[#1d1a17] placeholder-[#a89e90] outline-none transition-colors focus:border-[#294536] focus:ring-2 focus:ring-[#294536]/15"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#294536] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-[#f4efe8] shadow-md transition-all duration-200 hover:bg-[#21382c] hover:shadow-lg disabled:cursor-not-allowed disabled:bg-[#8c9f94]"
            >
              {isLoading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info & Admin link */}
        <div className="mt-8 border-t border-[rgba(111,100,86,0.12)] pt-6 text-center">
          <p className="text-[12px] text-[#7a7064]">
            Protected by end-to-end quiet encryption.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-[#8f7a65]">
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms-and-agreements" className="hover:underline">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link href="/admin/login" className="inline-flex items-center gap-1 text-[#5d5449] hover:text-[#1d1a17] hover:underline">
              <Shield size={12} />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-[#f3efe7] px-5 pb-24 pt-[108px] sm:px-8 sm:pt-[132px]">
      <Suspense
        fallback={
          <div className="mx-auto flex h-64 max-w-[480px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#294536] border-t-transparent" />
          </div>
        }
      >
        <AuthForm />
      </Suspense>
    </main>
  );
}
