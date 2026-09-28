import { BatteryCharging, Home, Lightbulb, SunMedium } from "lucide-react";
import React from "react";

export function FeaturesSection() {
  const steps = [
    {
      icon: Home,
      title: "1. Set up your system",
      text: "Add your solar panels, battery storage, and home appliances to build your energy profile.",
    },
    {
      icon: SunMedium,
      title: "2. Track solar generation",
      text: "See how much energy your system produces each day and compare it with household demand.",
    },
    {
      icon: BatteryCharging,
      title: "3. Monitor storage and usage",
      text: "Follow battery charge levels and consumption patterns to understand how your home is using power.",
    },
    {
      icon: Lightbulb,
      title: "4. Improve efficiency",
      text: "Use clear recommendations to reduce waste, save more energy, and run appliances more efficiently.",
    },
  ];

  return (
    <section className="mt-20 px-4 md:px-8" data-reveal style={{ transitionDelay: "140ms" }}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="reveal-content text-center" data-reveal style={{ transitionDelay: "220ms" }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-white md:text-4xl">
            Simple steps to smarter solar use
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <article
              key={title}
              className="reveal-content rounded-3xl border border-slate-700 bg-slate-900/70 p-6 text-left shadow-lg shadow-slate-950/20 transition-all duration-300 hover:-translate-y-1 hover:border-slate-500"
              style={{ transitionDelay: `${260 + index * 150}ms` }}
              data-reveal
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-100 transition-transform duration-300 hover:scale-105">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
            </article>
          ))}
        </div>

        <div className="reveal-content mt-12 rounded-[28px] border border-slate-700 bg-slate-900/80 p-6 md:p-8" data-reveal style={{ transitionDelay: "780ms" }}>
          <div className="grid items-center gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Why it matters
              </p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">
                One clear view of how your home uses solar energy
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                SolarView helps you connect system data to everyday energy decisions, so you can see when your home is producing power, when it is storing it, and when it is using more than it should.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">What you can do</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li>• Compare solar output with home usage</li>
                <li>• Check battery state throughout the day</li>
                <li>• Spot wasted energy and improve timing</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="reveal-content relative mt-14 overflow-hidden rounded-[30px] border border-slate-700" data-reveal style={{ transitionDelay: "920ms" }}>
          <div
            className="h-[360px] w-full bg-cover bg-center md:h-[440px] opacity-70"
            style={{ backgroundImage: `url("/assets/house.jpg")` }}
          />

          <div className="absolute inset-0 bg-slate-950/55" />

          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="max-w-2xl text-base leading-7 text-white md:text-xl">
              Take control of your energy. Use data to understand production, storage, and daily consumption before it becomes wasted power.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
