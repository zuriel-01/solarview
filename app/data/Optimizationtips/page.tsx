"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar, Zap, Sun, Battery, Plug, LineChart } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from 'react';
import solarData from '../solarData.json';

interface DayData {
  timestamp: string;
  hourlyData: Array<{
    hour: number;
    ALLSKY_SFC_SW_DWN: number;
    solar: number;
    load: number;
    soc: number;
    prevSoc: number;
    activeAppliances: Array<{
      name: string;
      power: number;
      isActive: boolean;
    }>;
  }>;
}

interface Tip {
  id: number;
  category: 'weather' | 'battery' | 'appliance' | 'system';
  icon: ReactElement;
  title: string;
  description: string;
  condition: (data: DayData) => boolean;
}

const OPTIMIZATION_TIPS: Tip[] = [
  {
    id: 1,
    category: 'weather',
    icon: <Sun className="w-5 h-5 text-yellow-300" />,
    title: 'Low Solar Day',
    description: '☁️ Solar output was low today. Limit appliance use during early or late hours, or consider a backup energy plan on cloudy days.',
    condition: (data: DayData) => {
      const avgIrradiance = data.hourlyData.reduce((sum, hour) => 
        sum + hour.ALLSKY_SFC_SW_DWN, 0) / data.hourlyData.length;
      return avgIrradiance < 0.15; // Only show if average irradiance is below 0.15 kWh/m²
    }
  },
  {
    id: 2,
    category: 'weather',
    icon: <Sun className="w-5 h-5 text-yellow-300" />,
    title: 'Peak Solar Period Not Utilized',
    description: '⚡ Solar generation peaked midday but wasn\'t fully used. Shift some appliance use (e.g., ironing or TV) into 10:00–14:00.',
    condition: (data: DayData) => {
      const peakHours = data.hourlyData.filter(h => h.hour >= 10 && h.hour <= 14);
      const highIrradiance = peakHours.some(h => h.ALLSKY_SFC_SW_DWN > 0.3);
      const lowLoad = peakHours.every(h => h.load < 0.3);
      return highIrradiance && lowLoad;
    }
  },
  {
    id: 3,
    category: 'battery',
    icon: <Battery className="w-5 h-5 text-red-500" />,
    title: 'Battery Entered Low State',
    description: '🔴 Battery dropped to critical levels today. Try moving high-consumption appliances to daylight hours when solar is available.',
    condition: (data: DayData) => {
      return data.hourlyData.some(h => h.soc <= BATTERY_CONFIG.minSoC);
    }
  },
  {
    id: 4,
    category: 'battery',
    icon: <Battery className="w-5 h-5 text-green-500" />,
    title: 'Battery Stayed Full Too Long',
    description: '♻️ Battery remained full during solar hours. Consider shifting appliance use to daylight to make better use of solar energy.',
    condition: (data: DayData) => {
      const fullHours = data.hourlyData.filter(h => 
        h.hour >= 9 && h.hour <= 16 && // Daylight hours
        h.soc >= BATTERY_CONFIG.usableCapacity * 0.9 // 90% of capacity
      ).length;
      return fullHours > 3;
    }
  },
  {
    id: 5,
    category: 'appliance',
    icon: <Plug className="w-5 h-5 text-blue-500" />,
    title: 'Heavy Appliance Used During Low Solar',
    description: '⏰ High-power appliance was used when solar generation was low. Delay its use to after 10:00 for better battery health.',
    condition: (data: DayData) => {
      return data.hourlyData.some(h => {
        const highPowerActive = h.activeAppliances.some(app => 
          app.power >= 400 && app.isActive
        );
        return highPowerActive && h.ALLSKY_SFC_SW_DWN < 0.15;
      });
    }
  },
  {
    id: 6,
    category: 'appliance',
    icon: <Plug className="w-5 h-5 text-blue-500" />,
    title: 'Appliance Load Caused Peak Discharge',
    description: '💡 A high load period caused heavy battery discharge. Avoid clustering multiple appliances at the same time.',
    condition: (data: DayData) => {
      return data.hourlyData.some(h => 
        h.load > 1.2 && (h.prevSoc - h.soc) > 1.0
      );
    }
  },
  {
    id: 7,
    category: 'system',
    icon: <LineChart className="w-5 h-5 text-purple-500" />,
    title: 'Solar Barely Covered Load',
    description: '📉 Solar generation just covered your household load. Reduce high-power usage during early or late hours.',
    condition: (data: DayData) => {
      let closeMatchCount = 0;
      data.hourlyData.forEach(h => {
        if (Math.abs(h.solar - h.load) < 0.2) closeMatchCount++;
      });
      return closeMatchCount > (data.hourlyData.length / 2);
    }
  },
  {
    id: 8,
    category: 'system',
    icon: <LineChart className="w-5 h-5 text-purple-500" />,
    title: 'Battery Covered Load All Day',
    description: '🪫 Battery handled most of the day\'s usage. Shift more load to daylight when solar is available.',
    condition: (data: DayData) => {
      let batteryDependentCount = 0;
      data.hourlyData.forEach(h => {
        if (h.solar < h.load && h.soc < h.prevSoc) batteryDependentCount++;
      });
      return batteryDependentCount > (data.hourlyData.length / 2);
    }
  }
];

// Define months data
const MONTHS = [
  { short: "JAN", full: "January", days: 31 },
  { short: "FEB", full: "February", days: 29 }, // Accounting for leap year 2024
  { short: "MAR", full: "March", days: 31 },
  { short: "APR", full: "April", days: 30 },
  { short: "MAY", full: "May", days: 31 },
  { short: "JUN", full: "June", days: 30 },
  { short: "JUL", full: "July", days: 31 },
  { short: "AUG", full: "August", days: 31 },
  { short: "SEP", full: "September", days: 30 },
  { short: "OCT", full: "October", days: 31 },
  { short: "NOV", full: "November", days: 30 },
  { short: "DEC", full: "December", days: 31 },
];

// Battery configuration
const BATTERY_CONFIG = {
  usableCapacity: 5.0, // kWh
  minSoC: 1.0, // kWh (20% of capacity)
  maxSoC: 6.0, // kWh
  efficiency: 0.75,
};

const SYSTEM_SIZE = 2.0; // kW

export default function OptimizationTips() {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const getDayData = (month: number, day: number): DayData | null => {
    const data = solarData as Array<{ timestamp: string; ALLSKY_SFC_SW_DWN: number }>;
    const dayData = data.filter(entry => {
      const date = new Date(entry.timestamp);
      return date.getMonth() === month && date.getDate() === day;
    });

    if (dayData.length === 0) return null;

    let currentSoC = BATTERY_CONFIG.usableCapacity;
    const hourlyData = dayData.map(entry => {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      const solar = entry.ALLSKY_SFC_SW_DWN * SYSTEM_SIZE * BATTERY_CONFIG.efficiency;
      let load = 0;
      const activeAppliances: Array<{ name: string; power: number; isActive: boolean }> = [];

      // Calculate load from appliances
      const rooms = {
        bedroom: {
          AC: { power: 1000, pattern: (h: number) => h >= 21 || h < 2 },
          laptop: { power: 40, pattern: (h: number) => h >= 8 && h < 16 },
          bulbs: { power: 24, pattern: (h: number) => h >= 18 && h <= 23 },
          iron: { power: 1000, pattern: (h: number) => h >= 13 && h < 14 },
        },
        kitchen: {
          refrigerator: { power: 100, pattern: (h: number) => h >= 9 && h < 21 },
          microwave: { power: 1000, pattern: (h: number) => h === 8 || h === 16 },
          washingMachine: { power: 400, pattern: (h: number) => h >= 10 && h < 11.5 },
          bulbs: { power: 18, pattern: (h: number) => h >= 19 && h <= 23 },
        },
        parlour: {
          fan: { power: 45, pattern: (h: number) => h >= 11 && h < 17 },
          TV: { power: 90, pattern: (h: number) => h >= 16 && h < 23 },
          bulbs: { power: 18, pattern: (h: number) => h >= 18 && h < 23 },
        },
      };

      for (const [room, appliances] of Object.entries(rooms)) {
        for (const [name, app] of Object.entries(appliances)) {
          const isActive = app.pattern(hour);
          if (isActive) {
            const variation = 0.9 + Math.random() * 0.2;
            const appLoad = (app.power * variation) / 1000;
            load += appLoad;
            activeAppliances.push({ name: `${room}_${name}`, power: app.power, isActive });
          }
        }
      }

      const prevSoC = currentSoC;

      // Update battery state
      if (solar >= load) {
        const excess = solar - load;
        if (currentSoC < BATTERY_CONFIG.usableCapacity) {
          const charge = Math.min(excess, BATTERY_CONFIG.usableCapacity - currentSoC);
          currentSoC += charge;
        }
      } else {
        const deficit = load - solar;
        if (currentSoC > BATTERY_CONFIG.minSoC) {
          const discharge = Math.min(deficit, currentSoC - BATTERY_CONFIG.minSoC);
          currentSoC -= discharge;
        }
      }

      return {
        hour,
        ALLSKY_SFC_SW_DWN: entry.ALLSKY_SFC_SW_DWN,
        solar,
        load,
        soc: currentSoC,
        prevSoc: prevSoC,
        activeAppliances,
      };
    });

    return {
      timestamp: dayData[0].timestamp,
      hourlyData,
    };
  };

  const getApplicableTips = (month: { short: string; full: string; days: number }, day: number) => {
    const monthIndex = MONTHS.findIndex(m => m.short === month.short);
    const dayData = getDayData(monthIndex, day);
    if (!dayData) return [];
    return OPTIMIZATION_TIPS.filter(tip => tip.condition(dayData));
  };

  const handleMonthChange = (month: string) => {
    const monthIndex = MONTHS.findIndex(m => m.short === month);
    if (monthIndex !== -1) {
      setSelectedMonth(MONTHS[monthIndex]);
      setExpandedDay(null);
    }
  };

  // Generate array of days for the selected month
  const getDaysInMonth = () => {
    const days = [];
    for (let i = 1; i <= selectedMonth.days; i++) {
      days.push(`${i}${getDaySuffix(i)} ${selectedMonth.full} 2024`);
    }
    return days;
  };

  // Helper function to add proper suffix to day numbers
  const getDaySuffix = (day: number) => {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  // Handle horizontal scroll
  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('month-scroll');
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-yellow-50 to-white">
      {/* Page Header */}
      <div className="w-full bg-white border-b shadow-sm">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-300" />
              Optimization Tips
            </h1>
            <div className="w-[89px]" /> {/* Spacer to center the title */}
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <nav className="w-full bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto relative">
          <div className="flex items-center h-16">
            {/* Left scroll button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 z-10 bg-gradient-to-r from-white to-transparent md:hidden"
              onClick={() => handleScroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Scrollable month buttons */}
            <div
              id="month-scroll"
              className="flex-1 flex items-center overflow-x-auto scrollbar-hide px-8 md:px-2"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="flex space-x-1 w-full justify-between">
                {MONTHS.map((month) => (
                  <Button
                    key={month.short}
                    variant={selectedMonth.short === month.short ? "default" : "ghost"}
                    className={`flex-none min-w-[80px] transition-all duration-200 ${
                      selectedMonth.short === month.short
                        ? "bg-yellow-300 text-gray-800 hover:bg-yellow-400"
                        : "hover:bg-yellow-100 hover:text-gray-800"
                    }`}
                    onClick={() => handleMonthChange(month.short)}
                  >
                    {month.short}
                  </Button>
                ))}
              </div>
            </div>

            {/* Right scroll button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 z-10 bg-gradient-to-l from-white to-transparent md:hidden"
              onClick={() => handleScroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 container mx-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getDaysInMonth().map((day) => {
            const dayNum = parseInt(day);
            const tips = getApplicableTips(selectedMonth, dayNum);
            const isExpanded = expandedDay === dayNum;
            
            return (
              <Card 
                key={day} 
                className={`p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-300 group cursor-pointer ${
                  isExpanded ? 'bg-yellow-50' : ''
                }`}
                onClick={() => setExpandedDay(isExpanded ? null : dayNum)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-yellow-300 group-hover:text-yellow-400 transition-colors" />
                  <h3 className="font-semibold text-gray-800">{day}</h3>
                </div>
                <div className="text-sm text-gray-600">
                  {isExpanded ? (
                    <div className="space-y-2">
                      {tips.length > 0 ? tips.map(tip => (
                        <div key={tip.id} className="flex items-start gap-2 p-2 bg-white rounded-lg shadow-sm">
                          {tip.icon}
                          <div>
                            <div className="font-medium text-gray-800">{tip.title}</div>
                            <div className="text-sm text-gray-600">{tip.description}</div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-gray-500 italic">No optimization tips for this day.</div>
                      )}
                    </div>
                  ) : (
                    tips.length > 0 ? 
                      `${tips.length} optimization tip${tips.length > 1 ? 's' : ''} available` :
                      "No optimization tips for this day"
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
