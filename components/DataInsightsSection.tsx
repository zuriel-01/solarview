import React from "react";
import { BatteryCharging, SunMedium, TrendingUp } from "lucide-react";

const insightCards = [
  {
    icon: SunMedium,
    title: "Daily Energy Data",
    text: "View detailed daily breakdowns of solar generation, consumption patterns, and efficiency metrics.",
  },
  {
    icon: BatteryCharging,
    title: "Battery Analytics",
    text: "Track battery charge levels, discharge patterns, and storage efficiency throughout the day.",
  },
  {
    icon: TrendingUp,
    title: "Hourly Patterns",
    text: "Analyze hourly energy generation and consumption data to identify peak performance periods.",
  },
];

export function DataInsightsSection() {
  return (
    <section className="mt-20 flex flex-col px-4 md:px-8" data-reveal style={{ transitionDelay: "120ms" }}>
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="reveal-content text-center text-3xl font-bold text-white md:text-4xl max-md:mt-24" data-reveal style={{ transitionDelay: "200ms" }}>
          Data Insights
        </h2>
        <p className="reveal-content pt-4 text-center text-base leading-7 text-neutral-400 md:text-lg" data-reveal style={{ transitionDelay: "260ms" }}>
          Explore your solar system&apos;s performance data
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {insightCards.map(({ icon: Icon, title, text }, index) => (
            <div
              key={title}
              className="reveal-content group rounded-2xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-yellow-300 hover:shadow-lg hover:shadow-yellow-500/10"
              data-reveal
              style={{ transitionDelay: `${320 + index * 150}ms` }}
            >
              <Icon className="h-10 w-10 text-white transition-colors duration-300 group-hover:text-yellow-300" />
              <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400 md:text-base">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
