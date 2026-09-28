import Link from "next/link";
import { ArrowRight, BatteryCharging, ChartNoAxesCombined, Lightbulb, Settings2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const steps = [
  {
    number: "01",
    icon: Settings2,
    title: "Set up your system",
    description:
      "Start in Settings to review your solar setup and add the appliances you want SolarView to track.",
  },
  {
    number: "02",
    icon: ChartNoAxesCombined,
    title: "Check your energy",
    description:
      "Use Energy Generated to see what your panels produce, then compare it with Energy Usage to understand your home’s demand.",
  },
  {
    number: "03",
    icon: BatteryCharging,
    title: "Watch your battery",
    description:
      "Open Battery Status and Battery Projection to follow your stored energy and plan for the hours when solar production drops.",
  },
  {
    number: "04",
    icon: Lightbulb,
    title: "Act on the insights",
    description:
      "Visit Optimization Tips regularly to find practical ways to shift appliance use, reduce waste, and get more from your system.",
  },
];

export default function HowToUsePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-gray-950 text-white" style={{ backgroundImage: `url("/assets/hero-bg.jpg")` }}>
      <div className="mx-auto flex min-h-screen max-w-[1336px] flex-col px-4 pt-8 md:px-8 md:pt-12">
        <Header />

        <section className="mx-auto w-full max-w-6xl flex-1 px-0 pb-20 pt-20 md:pt-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-yellow-200">
              Your SolarView field guide
            </div>
            <h1 className="mt-6 text-4xl font-medium leading-[0.98] tracking-[-0.05em] text-white md:text-6xl">
              Turn your solar data into your next smart move.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Follow this simple path to set up your account, understand your energy flow, and make better daily decisions with SolarView.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {steps.map(({ number, icon: Icon, title, description }) => (
              <article key={number} className="rounded-[24px] border border-slate-700 bg-slate-900/75 p-6 shadow-2xl shadow-slate-950/25 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-yellow-400/40">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-300">
                    <Icon size={22} />
                  </div>
                  <span className="font-mono text-sm text-slate-500">{number}</span>
                </div>
                <h2 className="mt-8 text-xl font-semibold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
              </article>
            ))}
          </div>

          <section className="mt-6 flex flex-col justify-between gap-6 rounded-[24px] border border-yellow-400/20 bg-yellow-400/10 p-6 md:flex-row md:items-center md:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200">Start with today’s picture</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Your dashboard is ready when you are.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Begin with the latest readings, then use the data pages to move from observation to action.</p>
            </div>
            <Link href="/home" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-yellow-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-yellow-300">
              Open dashboard
              <ArrowRight size={16} />
            </Link>
          </section>
        </section>
      </div>
      <Footer />
    </main>
  );
}