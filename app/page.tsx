"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChefHat,
  ChevronDown,
  ClipboardList,
  Clock,
  FolderCog,
  LayoutDashboard,
  Menu,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Utensils,
  X,
  Zap,
} from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const features = [
  {
    icon: ClipboardList,
    title: "Menu management",
    desc: "Build categories, add dishes, and keep prices, photos, and dietary tags up to date from one place.",
  },
  {
    icon: Package,
    title: "Inventory tracking",
    desc: "Track stock levels in real time, set low-stock thresholds, and get alerted before you run out.",
  },
  {
    icon: Users,
    title: "Staff & roles",
    desc: "Invite your team, assign roles from owner to waiter, and control exactly who can see what.",
  },
  {
    icon: BarChart3,
    title: "Analytics & reports",
    desc: "See revenue trends, top-selling dishes, and stock movement without exporting a single spreadsheet.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    desc: "JWT authentication and role-based access keep your restaurant data private and protected.",
  },
  {
    icon: Zap,
    title: "Real-time updates",
    desc: "Menu changes, stock alerts, and team activity update instantly across every device.",
  },
];

const steps = [
  {
    number: "01",
    icon: LayoutDashboard,
    title: "Create your account",
    desc: "Sign up in under a minute. No credit card, no setup fees, no sales call required.",
  },
  {
    number: "02",
    icon: Utensils,
    title: "Add your restaurant",
    desc: "Set up your profile, import your menu, and organize categories the way your kitchen thinks.",
  },
  {
    number: "03",
    icon: ChefHat,
    title: "Run your service",
    desc: "Invite staff, monitor inventory, and watch your numbers update as the day unfolds.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    desc: "For solo owners getting their first restaurant organized.",
    features: [
      "1 restaurant",
      "Menu & categories",
      "Basic inventory tracking",
      "Email support",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$29",
    period: "per month",
    desc: "For busy teams that need inventory, staff, and insight.",
    features: [
      "Everything in Starter",
      "Unlimited menu items",
      "Staff roles & permissions",
      "Low-stock alerts",
      "Analytics dashboard",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$79",
    period: "per month",
    desc: "For multi-location restaurants that need more control.",
    features: [
      "Everything in Growth",
      "Multiple restaurants",
      "Advanced reports",
      "Priority support",
      "API access",
    ],
    cta: "Get started",
    highlighted: false,
  },
];

const faqs = [
  {
    q: "Do I need a credit card to get started?",
    a: "No. The Starter plan is free forever and does not require a card. You only enter payment details if you decide to upgrade.",
  },
  {
    q: "Can I manage more than one restaurant?",
    a: "Yes. The Pro plan supports multiple restaurants under a single account, so you can switch between locations without logging out.",
  },
  {
    q: "How does inventory tracking work?",
    a: "Every inventory item has a quantity and a low-stock threshold. Mesero flags items that fall below the threshold so you can restock before service is affected.",
  },
  {
    q: "Can my staff use it too?",
    a: "Absolutely. Invite team members and assign roles such as manager, head chef, line cook, waiter, cashier, or bartender. Each role only sees what it needs.",
  },
];

const chartBars = [38, 52, 44, 68, 58, 76, 90];
const chartDays = ["M", "T", "W", "T", "F", "S", "S"];

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-tertiary">
      <header className="sticky top-0 z-50 border-b border-neutral-100/80  backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 shadow-sm shadow-primary-200">
              <Utensils className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-neutral-900">
              Mesero
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <Button asChild variant="primary" size="sm">
                <Link href="/dashboard">
                  Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild variant="primary" size="sm">
                  <Link href="/register">
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-neutral-100 bg-white px-4 pb-6 pt-4 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button asChild variant="primary">
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="secondary">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild variant="primary">
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      Get started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="px-5">
        <section className="relative overflow-hidden bg-primary-600 rounded-xl">
          <div className="relative mx-auto max-w-7xl flex flex-col gap-16 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:pb-28 lg:pt-24">
            <div className="w-full flex flex-col items-center justify-center">
              <div className="flex w-fit justify-center items-center gap-6 rounded-sm bg-white p-1 text-xs font-semibold text-primary-700 shadow-sm">
                <div className="px-3 rounded-sm py-1.5 flex gap-2 items-center justify-center bg-primary text-white">
                  <p>Elite</p>
                  <FolderCog className="h-3.5 w-3.5" />
                </div>{" "}
                <p className="tracking-wide font-semibold text-sm px-3">
                  Restaurant operations, simplified.
                </p>
              </div>

              <h1 className="mt-6 text-balance text-center font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Run your restaurant,
                <span className=""> not your spreadsheets.</span>
              </h1>

              <p className="mt-6 max-w-xl text-sm text-center leading-relaxed text-white/80">
                Eliminate order bottlenecks and stockouts. Mesero connects every
                part of your service into one lightning-fast dashboard.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild variant="secondary" size="lg">
                  <Link href="/register">
                    Start free
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="default" size="lg">
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-success-600" />
                  No credit card required
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-success-600" />
                  Free plan forever
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute -inset-5 rounded-[2rem]   blur-2xl"
              />

              <div className="relative animate-fade-up overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="flex items-center gap-1.5 border-b border-neutral-100 bg-neutral-50/70 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success-400" />
                  <div className="ml-3 flex-1 rounded-md border border-neutral-200 bg-white px-3 py-1 text-[11px] text-neutral-400">
                    app.mesero.io/dashboard
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-neutral-500">The Copper Pot</p>
                      <p className="font-display text-lg font-bold text-neutral-900">
                        Dashboard
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-semibold text-success-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                      Live
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-neutral-100 bg-surface-secondary p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                        Revenue
                      </p>
                      <p className="mt-1 font-display text-lg font-bold text-neutral-900">
                        $12.4k
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-success-600">
                        <TrendingUp className="h-3 w-3" />
                        +18%
                      </p>
                    </div>
                    <div className="rounded-xl border border-neutral-100 bg-surface-secondary p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                        Orders
                      </p>
                      <p className="mt-1 font-display text-lg font-bold text-neutral-900">
                        342
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold text-success-600">
                        +9.2%
                      </p>
                    </div>
                    <div className="rounded-xl border border-neutral-100 bg-surface-secondary p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                        Staff
                      </p>
                      <p className="mt-1 font-display text-lg font-bold text-neutral-900">
                        12
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold text-neutral-500">
                        Active now
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-100 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold text-neutral-900">
                        Weekly revenue
                      </p>
                      <span className="text-[10px] font-medium text-neutral-400">
                        Last 7 days
                      </span>
                    </div>
                    <div className="flex h-24 items-end gap-2">
                      {chartBars.map((height, index) => (
                        <div
                          key={`${chartDays[index]}-${index}`}
                          className="flex flex-1 flex-col items-center gap-1.5"
                        >
                          <div className="flex h-20 w-full items-end">
                            <div
                              className={`w-full rounded-md ${
                                index === chartBars.length - 1
                                  ? "bg-primary-600"
                                  : "bg-primary-200"
                              }`}
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-medium text-neutral-400">
                            {chartDays[index]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-100 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-neutral-900">
                        Top dishes
                      </p>
                      <span className="text-[10px] font-medium text-primary-600">
                        View all
                      </span>
                    </div>
                    {[
                      { name: "Truffle pasta", sold: 43, price: "$18.50" },
                      { name: "Charred octopus", sold: 31, price: "$24.00" },
                    ].map((dish) => (
                      <div
                        key={dish.name}
                        className="flex items-center justify-between border-t border-neutral-100 py-2 first:border-t-0"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50/60">
                            <Utensils className="h-3.5 w-3.5 text-primary-600" />
                          </div>
                          <span className="text-[11px] font-medium text-neutral-800">
                            {dish.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-semibold text-neutral-900">
                            {dish.price}
                          </p>
                          <p className="text-[9px] text-neutral-400">
                            {dish.sold} sold
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -left-4 top-28 hidden animate-fade-up rounded-xl border border-neutral-100 bg-white p-3 shadow-lg sm:block">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50">
                    <Check className="h-4 w-4 text-success-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-900">
                      New order #1042
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      2 items • just now
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-3 bottom-20 hidden animate-fade-up rounded-xl border border-neutral-100 bg-white p-3 shadow-lg sm:block">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-50">
                    <Package className="h-4 w-4 text-warning-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-900">
                      Low stock alert
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      Tomatoes • 4 left
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
                Features
              </p>
              <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Everything your restaurant needs, nothing it doesn&apos;t
              </h2>
              <p className="mt-4 text-neutral-500">
                Replace the tangle of spreadsheets, notebooks, and group chats
                with one tool your whole team can actually use.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50/60 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-neutral-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-20 border-y border-neutral-100 bg-white py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
                How it works
              </p>
              <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Up and running before the lunch rush
              </h2>
              <p className="mt-4 text-neutral-500">
                No consultants, no migrations, no six-week onboarding. Just
                three steps and you are live.
              </p>
            </div>

            <div className="relative mt-16 grid gap-8 lg:grid-cols-3">
              <div
                aria-hidden="true"
                className="absolute left-[16.66%] right-[16.66%] top-12 hidden border-t-2 border-dashed border-neutral-200 lg:block"
              />
              {steps.map((step) => (
                <div key={step.number} className="relative text-center">
                  <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-neutral-100 bg-white shadow-sm">
                    <step.icon className="h-9 w-9 text-primary-600" />
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-lg font-semibold text-neutral-900">
                    {step.title}
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-neutral-500">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm lg:grid-cols-2 lg:p-14">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
                  For the whole team
                </p>
                <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-neutral-900">
                  Everyone sees the same picture
                </h2>
                <p className="mt-4 text-neutral-500">
                  Owners get the numbers. Managers get the stock. Chefs get the
                  menu. Waiters get what they need to serve. One source of
                  truth, with permissions that keep it simple.
                </p>

                <ul className="mt-8 space-y-4">
                  {[
                    "Role-based access from owner to delivery driver",
                    "Live low-stock alerts before service starts",
                    "Menu updates that reach every device instantly",
                    "Clean reports you can read in under a minute",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success-100">
                        <Check className="h-3 w-3 text-success-700" />
                      </span>
                      <span className="text-sm text-neutral-700">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild variant="primary" className="mt-8">
                  <Link href="/register">
                    Create your workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: Users,
                    title: "Owners",
                    value: "Full access",
                    tone: "bg-primary-50/60 text-primary-600",
                  },
                  {
                    icon: ClipboardList,
                    title: "Managers",
                    value: "Menu & stock",
                    tone: "bg-info-50 text-info-600",
                  },
                  {
                    icon: ChefHat,
                    title: "Kitchen",
                    value: "Menu updates",
                    tone: "bg-warning-50 text-warning-600",
                  },
                  {
                    icon: Clock,
                    title: "Service",
                    value: "Live availability",
                    tone: "bg-success-50 text-success-600",
                  },
                ].map((role) => (
                  <div
                    key={role.title}
                    className="rounded-2xl border border-neutral-100 bg-surface-secondary p-5"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${role.tone}`}
                    >
                      <role.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 font-display text-base font-semibold text-neutral-900">
                      {role.title}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {role.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="scroll-mt-20 border-y border-neutral-100 bg-white py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
                Pricing
              </p>
              <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Simple plans that grow with you
              </h2>
              <p className="mt-4 text-neutral-500">
                Start free. Upgrade when your team or your locations need more.
                Cancel any time.
              </p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border p-7 ${
                    plan.highlighted
                      ? "border-primary-600 bg-neutral-900 text-white shadow-xl shadow-primary-200/40 lg:-mt-4 lg:mb-4"
                      : "border-neutral-100 bg-white shadow-sm"
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Most popular
                    </span>
                  )}
                  <h3
                    className={`font-display text-xl font-semibold ${
                      plan.highlighted ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`mt-1 text-sm ${
                      plan.highlighted ? "text-neutral-300" : "text-neutral-500"
                    }`}
                  >
                    {plan.desc}
                  </p>
                  <div className="mt-6 flex items-end gap-1.5">
                    <span className="font-display text-4xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                    <span
                      className={`pb-1 text-sm ${
                        plan.highlighted
                          ? "text-neutral-400"
                          : "text-neutral-500"
                      }`}
                    >
                      / {plan.period}
                    </span>
                  </div>

                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check
                          className={`mt-0.5 h-4 w-4 flex-none ${
                            plan.highlighted
                              ? "text-primary-400"
                              : "text-success-600"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            plan.highlighted
                              ? "text-neutral-200"
                              : "text-neutral-600"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={plan.highlighted ? "primary" : "secondary"}
                    className="mt-7 w-full"
                  >
                    <Link href="/register">{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
                FAQ
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Questions, answered
              </h2>
            </div>

            <div className="mt-10 space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-xl border border-neutral-100 bg-white px-6 py-5 shadow-sm open:border-primary-200"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <ChevronDown className="h-5 w-5 flex-none text-neutral-400 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20 lg:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-neutral-900 px-6 py-16 text-center shadow-2xl sm:px-12 lg:py-20">
              <div className="relative">
                <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to run a calmer restaurant?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-neutral-300">
                  Join thousands of teams using Mesero to keep their menu,
                  stock, and staff in sync. Start free today.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    // className="bg-white text-neutral-900 hover:bg-"
                  >
                    <Link href="/register">
                      Create free account
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Link href="/login">Sign in</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
                  <Utensils className="h-5 w-5 text-white" />
                </div>
                <span className="font-display text-lg font-bold text-neutral-900">
                  Mesero
                </span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-500">
                Restaurant management made simple. Menu, inventory, staff, and
                analytics in one place.
              </p>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-neutral-900">
                Product
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-neutral-500">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-primary-600">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-neutral-900">
                Account
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-neutral-500">
                <li>
                  <Link href="/login" className="hover:text-primary-600">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-primary-600">
                    Create account
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-primary-600">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-neutral-100 pt-6 text-sm text-neutral-500 sm:flex-row">
            <p>© 2026 Mesero. All rights reserved.</p>
            <p className="inline-flex items-center gap-1.5">
              Made for restaurants
              <Utensils className="h-3.5 w-3.5 text-primary-600" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
