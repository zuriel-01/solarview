import React from "react";

export function HeroSection() {
  return (
    <section className="mt-16 px-4 md:px-8" data-reveal style={{ transitionDelay: "80ms" }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="reveal-content" data-reveal style={{ transitionDelay: "160ms" }}>
            <div className="inline-flex items-center rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-yellow-200">
              Solar performance dashboard
            </div>

            <h2
              className="mt-6 text-4xl font-medium leading-[0.96] tracking-[-0.05em] text-white md:text-5xl xl:text-[4rem]"
              style={{ fontFamily: 'var(--font-sora), sans-serif' }}
            >
              See every watt your home
              <span className="mt-2 block text-white">produces, stores, and saves.</span>
            </h2>

            <p
              className="mt-5 max-w-xl text-sm leading-7 text-slate-300 md:text-base"
              style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
            >
              SolarView turns your solar setup into clear, actionable insights so you can
              monitor generation, battery health, and household energy use with confidence.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-full bg-yellow-400 px-5 py-3 text-sm font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-yellow-300">
                View dashboard
              </button>
              <button className="rounded-full border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-yellow-300 hover:text-yellow-200">
                See how it works
              </button>
            </div>
          </div>

          <div className="reveal-content rounded-[28px] border border-slate-700 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/35 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1" data-reveal style={{ transitionDelay: "260ms" }}>
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Today</p>
                <p className="mt-2 text-2xl font-bold text-white">4.8 kWh</p>
              </div>
              <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                +12.4%
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-500/10">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Generation</span>
                  <span className="text-yellow-200">72%</span>
                </div>
                <p className="mt-3 text-2xl font-bold text-white">18.6 kWh</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-slate-500">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Battery</p>
                  <p className="mt-3 text-2xl font-bold text-white">82%</p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-slate-500">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Usage</p>
                  <p className="mt-3 text-2xl font-bold text-white">11.2 kWh</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="reveal-content relative mt-12 overflow-hidden rounded-[30px] border border-slate-700 bg-slate-900" data-reveal style={{ transitionDelay: "420ms" }}>
          <div
            className="h-[300px] w-full bg-cover bg-center md:h-[420px]"
            style={{ backgroundImage: `url("/assets/price-solar.avif")` }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-900/20" />

          <div className="absolute inset-0 flex items-end p-6 md:p-10">
            <p className="max-w-xl text-sm font-medium leading-7 text-slate-100 md:text-lg">
              Track performance in real time, spot energy waste quickly, and make smarter decisions for a more efficient home.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
