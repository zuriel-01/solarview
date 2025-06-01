import React from "react";
import { Calendar, Zap, Clock } from "lucide-react";

export function DataInsightsSection() {
  return (
    <section className="mt-28 flex flex-col">
      <h2 className="text-7xl text-white text-center max-md:text-[55px] max-md:mt-24">
        Data Insights
      </h2>
      <p className="text-neutral-500 text-3xl pt-6 text-center">
        Explore your solar system&apos;s performance data
      </p>

      <div className="grid grid-cols-3 gap-8 mt-20 max-md:grid-cols-1 container mx-auto px-4">
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-lg border border-gray-700 hover:border-yellow-300 transition-colors">
          <Calendar className="w-12 h-12 text-yellow-300" />
          <h3 className="text-2xl font-bold text-white mt-4">Daily Energy Data</h3>
          <p className="text-gray-400 mt-2">
            View detailed daily breakdowns of solar generation, consumption patterns, and efficiency metrics
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-lg border border-gray-700 hover:border-yellow-300 transition-colors">
          <Zap className="w-12 h-12 text-yellow-300" />
          <h3 className="text-2xl font-bold text-white mt-4">Battery Analytics</h3>
          <p className="text-gray-400 mt-2">
            Track battery charge levels, discharge patterns, and storage efficiency throughout the day
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-lg border border-gray-700 hover:border-yellow-300 transition-colors">
          <Clock className="w-12 h-12 text-yellow-300" />
          <h3 className="text-2xl font-bold text-white mt-4">Hourly Patterns</h3>
          <p className="text-gray-400 mt-2">
            Analyze hourly energy generation and consumption data to identify peak performance periods
          </p>
        </div>
      </div>
    </section>
  );
}
