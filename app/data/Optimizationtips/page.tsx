"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar, Zap, Sun, Battery, Plug, LineChart } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from 'react';
import solarData from '../solarData.json';
import {
  getUserSolarSystem,
  getUserInitialAppliances,
} from '@/lib/db';

interface SystemConfig {
  battery_capacity: number;
  minimum_state_of_charge: number;
  installation_year: number;
  panel_rating: number;
  number_of_panels: number;
}

interface Appliance {
  id: string;
  appliance_name: string;
  wattage: number;
  usage_hours: number;
  room: string;
}

interface DayData {
  timestamp: string;
  batteryCapacityKwh: number;
  minSoCKwh: number;
  systemSizeKw: number;
  hourlyData: Array<{
    hour: number;
    "corrected_irradiance_kWh/m2": number;
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

// Updated function to match the room-specific components exactly
const getAppliancePattern = (applianceName: string, room: string, usageHours: number) => {
  const name = applianceName.toLowerCase();
  const roomLower = room.toLowerCase();
  
  if (roomLower === 'parlour') {
    if (name.includes('fan')) return (h: number) => h >= 11 && h < 17;
    if (name.includes('tv') || name.includes('television')) return (h: number) => h >= 16 && h < 23;
    if (name.includes('light') || name.includes('bulb')) return (h: number) => h >= 18 && h < 23;
    if (name.includes('ac') || name.includes('air condition')) return (h: number) => h >= 17 && h < (17 + Math.min(usageHours, 10)) % 24;
    if (name.includes('radio') || name.includes('music')) return (h: number) => h >= 7 && h < (7 + usageHours) % 24;
    if (name.includes('decoder') || name.includes('cable')) return (h: number) => h >= 16 && h < 23;
    if (name.includes('lamp')) return (h: number) => h >= 18 && h < 23;
    // Default pattern for parlour
    return (h: number) => h >= 15 && h < (15 + usageHours) % 24;
  } else if (roomLower === 'kitchen') {
    if (name.includes('fridge') || name.includes('refrigerator') || name.includes('freezer')) {
      // Fridge: constant usage (distributed throughout day)
      const hoursToUse = Math.min(24, Math.ceil(usageHours));
      return (h: number) => h % Math.ceil(24 / hoursToUse) === 0;
    }
    if (name.includes('microwave')) return (h: number) => (h >= 7 && h < 8) || (h >= 12 && h < 13) || (h >= 18 && h < 19);
    if (name.includes('blender') || name.includes('mixer')) return (h: number) => (h >= 7 && h < 8) || (h >= 17 && h < 18);
    if (name.includes('kettle') || name.includes('water heater')) return (h: number) => (h >= 6 && h < 7) || (h >= 15 && h < 16) || (h >= 20 && h < 21);
    if (name.includes('rice cooker') || name.includes('cooker')) return (h: number) => (h >= 11 && h < 12) || (h >= 17 && h < 18);
    if (name.includes('dishwasher')) return (h: number) => (h >= 13 && h < 14) || (h >= 20 && h < 21);
    if (name.includes('toaster')) return (h: number) => h >= 7 && h < 8;
    if (name.includes('oven')) return (h: number) => h >= 17 && h < 19;
    if (name.includes('coffee') || name.includes('espresso')) return (h: number) => (h >= 6 && h < 7) || (h >= 14 && h < 15);
    if (name.includes('fan')) return (h: number) => (h >= 11 && h < 13) || (h >= 17 && h < 19);
    if (name.includes('light') || name.includes('bulb')) return (h: number) => h >= 6 && h < (6 + usageHours) % 24;
    // Default kitchen pattern: meal preparation times
    return (h: number) => (h >= 7 && h < 9) || (h >= 11 && h < 13) || (h >= 17 && h < 19);
  } else if (roomLower === 'bedroom') {
    if (name.includes('ac') || name.includes('air condition')) return (h: number) => h >= 18 && h < (18 + usageHours) % 24;
    if (name.includes('bulb') || name.includes('light')) return (h: number) => h >= 18 && h < (18 + usageHours) % 24;
    if (name.includes('laptop') || name.includes('computer')) return (h: number) => h >= 8 && h < (8 + usageHours) % 24;
    if (name.includes('iron') || name.includes('pressing')) return (h: number) => h >= 13 && h < (13 + usageHours) % 24;
    if (name.includes('fan')) return (h: number) => h >= 19 && h < (19 + usageHours) % 24;
    if (name.includes('fridge') || name.includes('refrigerator')) {
      const hoursToUse = Math.ceil(usageHours);
      return (h: number) => h % (24 / hoursToUse) === 0;
    }
    // Default bedroom pattern
    return (h: number) => h >= 6 && h < (6 + usageHours) % 24;
  }
  
  // Default pattern for other rooms
  return (h: number) => h >= 6 && h < (6 + usageHours) % 24;
};

const createOptimizationTips = (systemConfig: SystemConfig): Tip[] => [
  {
    id: 1,
    category: 'weather',
    icon: <Sun className="w-5 h-5 text-yellow-300" />,
    title: 'Low Solar Day',
    description: '☁️ Solar output was low today. Limit appliance use during early or late hours, or consider a backup energy plan on cloudy days.',
    condition: (data: DayData) => {
      const avgIrradiance = data.hourlyData.reduce((sum, hour) => 
        sum + hour["corrected_irradiance_kWh/m2"], 0) / data.hourlyData.length;
      return avgIrradiance < 0.1; // More sensitive threshold
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
      const highIrradiance = peakHours.some(h => h["corrected_irradiance_kWh/m2"] > 0.2);
      const lowLoad = peakHours.every(h => h.load < (data.systemSizeKw * 0.4));
      return highIrradiance && lowLoad && peakHours.length > 0;
    }
  },
  {
    id: 3,
    category: 'battery',
    icon: <Battery className="w-5 h-5 text-red-500" />,
    title: 'Battery Entered Low State',
    description: '🔴 Battery dropped to critical levels today. Try moving high-consumption appliances to daylight hours when solar is available.',
    condition: (data: DayData) => {
      return data.hourlyData.some(h => h.soc <= data.minSoCKwh * 1.1); // Within 10% of minimum
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
        h.soc >= data.batteryCapacityKwh * 0.85 // 85% of capacity
      ).length;
      return fullHours > 4; // More than 4 hours
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
        return highPowerActive && h["corrected_irradiance_kWh/m2"] < 0.1;
      });
    }
  },
  {
    id: 6,
    category: 'appliance',
    icon: <Plug className="w-5 h-5 text-blue-500" />,
    title: 'High Load Period Detected',
    description: '💡 A high load period caused significant battery usage. Try to spread out appliance usage throughout the day.',
    condition: (data: DayData) => {
      const avgSystemLoad = data.systemSizeKw * 0.4; // 40% of system capacity
      return data.hourlyData.some(h => 
        h.load > avgSystemLoad && (h.prevSoc - h.soc) > (data.batteryCapacityKwh * 0.1)
      );
    }
  },
  {
    id: 7,
    category: 'system',
    icon: <LineChart className="w-5 h-5 text-purple-500" />,
    title: 'Energy Balance Could Be Better',
    description: '📉 Your solar generation and household load were closely matched. Consider optimizing usage timing for better efficiency.',
    condition: (data: DayData) => {
      let closeMatchCount = 0;
      data.hourlyData.forEach(h => {
        if (h.solar > 0 && Math.abs(h.solar - h.load) < (data.systemSizeKw * 0.15)) closeMatchCount++;
      });
      return closeMatchCount > (data.hourlyData.length / 3);
    }
  },
  {
    id: 8,
    category: 'system',
    icon: <LineChart className="w-5 h-5 text-purple-500" />,
    title: 'Battery Dependent Day',
    description: '🪫 Battery provided most of today\'s energy. Try to shift more usage to peak solar hours (10:00-15:00).',
    condition: (data: DayData) => {
      let batteryDependentCount = 0;
      data.hourlyData.forEach(h => {
        if (h.solar < h.load && h.soc < h.prevSoc) batteryDependentCount++;
      });
      return batteryDependentCount > (data.hourlyData.length * 0.4); // 40% of the day
    }
  },
  {
    id: 9,
    category: 'system',
    icon: <Sun className="w-5 h-5 text-green-500" />,
    title: 'Great Energy Management!',
    description: '✨ Excellent energy balance today! Your solar system efficiently met your household needs with good battery utilization.',
    condition: (data: DayData) => {
      // Show this tip when no other significant issues are detected
      const otherTips = [1, 2, 3, 4, 5, 6, 7, 8];
      return !otherTips.some(tipId => {
        switch(tipId) {
          case 1: return data.hourlyData.reduce((sum, hour) => sum + hour["corrected_irradiance_kWh/m2"], 0) / data.hourlyData.length < 0.1;
          case 2: {
            const peakHours = data.hourlyData.filter(h => h.hour >= 10 && h.hour <= 14);
            const highIrradiance = peakHours.some(h => h["corrected_irradiance_kWh/m2"] > 0.2);
            const lowLoad = peakHours.every(h => h.load < (data.systemSizeKw * 0.4));
            return highIrradiance && lowLoad && peakHours.length > 0;
          }
          case 3: return data.hourlyData.some(h => h.soc <= data.minSoCKwh * 1.1);
          case 4: {
            const fullHours = data.hourlyData.filter(h => 
              h.hour >= 9 && h.hour <= 16 && h.soc >= data.batteryCapacityKwh * 0.85
            ).length;
            return fullHours > 4;
          }
          case 5: return data.hourlyData.some(h => {
            const highPowerActive = h.activeAppliances.some(app => app.power >= 400 && app.isActive);
            return highPowerActive && h["corrected_irradiance_kWh/m2"] < 0.1;
          });
          case 6: {
            const avgSystemLoad = data.systemSizeKw * 0.4;
            return data.hourlyData.some(h => h.load > avgSystemLoad && (h.prevSoc - h.soc) > (data.batteryCapacityKwh * 0.1));
          }
          case 7: {
            let closeMatchCount = 0;
            data.hourlyData.forEach(h => {
              if (h.solar > 0 && Math.abs(h.solar - h.load) < (data.systemSizeKw * 0.15)) closeMatchCount++;
            });
            return closeMatchCount > (data.hourlyData.length / 3);
          }
          case 8: {
            let batteryDependentCount = 0;
            data.hourlyData.forEach(h => {
              if (h.solar < h.load && h.soc < h.prevSoc) batteryDependentCount++;
            });
            return batteryDependentCount > (data.hourlyData.length * 0.4);
          }
          default: return false;
        }
      });
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

export default function OptimizationTips() {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [optimizationTips, setOptimizationTips] = useState<Tip[]>([]);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Load user and system configuration
  useEffect(() => {
    const loadUserAndSystem = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          router.push('/auth/login');
          return;
        }

        setUser(session.user);

        // Load system configuration and appliances
        const [savedSystem, savedAppliances] = await Promise.all([
          getUserSolarSystem(session.user, supabase),
          getUserInitialAppliances(session.user, supabase)
        ]);
        
        if (!savedSystem) {
          alert('Please configure your solar system first');
          router.push('/data/Settings/ManageSystemAppliances');
          return;
        }

        setSystemConfig(savedSystem);
        setAppliances(savedAppliances);
        
        // Create personalized optimization tips based on user's system
        const tips = createOptimizationTips(savedSystem);
        setOptimizationTips(tips);
        
        console.log('Loaded system config:', savedSystem);
        console.log('Loaded appliances:', savedAppliances);
      } catch (error) {
        console.error('Error loading system configuration:', error);
        alert('Failed to load system configuration');
        router.push('/data/Settings/ManageSystemAppliances');
      } finally {
        setLoading(false);
      }
    };

    loadUserAndSystem();
  }, [router, supabase]);

  const getDayData = (month: number, day: number): DayData | null => {
    if (!systemConfig || appliances.length === 0) return null;

    const data = solarData as Array<{ timestamp: string; "corrected_irradiance_kWh/m2": number }>;
    const dayData = data.filter(entry => {
      const date = new Date(entry.timestamp);
      return date.getMonth() === month && date.getDate() === day;
    });

    if (dayData.length === 0) return null;

    // Calculate system parameters from user's actual configuration
    const batteryCapacityKwh = (systemConfig.battery_capacity * 12) / 1000; // Convert Ah to kWh (assuming 12V)
    const minSoCPercent = 20; // Fixed at 20% as per document
    const minSoCKwh = (batteryCapacityKwh * minSoCPercent) / 100;
    const systemSizeKw = (systemConfig.panel_rating * systemConfig.number_of_panels) / 1000;
    const efficiency = 0.65; // Base efficiency as per document

    // Create appliance patterns from user's actual appliances
    const appliancePatterns = appliances.map(appliance => ({
      power: appliance.wattage,
      pattern: getAppliancePattern(appliance.appliance_name, appliance.room, appliance.usage_hours),
      name: `${appliance.room}_${appliance.appliance_name}`
    }));

    let currentSoC = batteryCapacityKwh * 0.6; // Start at 60% instead of full capacity
    const hourlyData = dayData.map(entry => {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      const solar = Math.max(0, entry["corrected_irradiance_kWh/m2"]) * systemSizeKw * efficiency;
      
      let load = 0;
      const activeAppliances: Array<{ name: string; power: number; isActive: boolean }> = [];

      // Calculate load from user's actual appliances using consistent patterns
      for (const appliance of appliancePatterns) {
        const isActive = appliance.pattern(hour);
        if (isActive) {
          const appLoad = appliance.power / 1000; // Convert to kW - no random variation
          load += appLoad;
          activeAppliances.push({ 
            name: appliance.name, 
            power: appliance.power, 
            isActive 
          });
        }
      }

      // Add base household load even when no specific appliances are running
      const baseLoad = 0.1; // 100W base load for always-on devices
      load += baseLoad;

      const prevSoC = currentSoC;

      // Enhanced battery state logic with charging/discharging rate limits
      if (solar > load) {
        const excess = solar - load;
        if (currentSoC < batteryCapacityKwh) {
          // Charging rate limited to prevent instant charging
          const maxChargeRate = batteryCapacityKwh * 0.2; // Max 20% per hour
          const charge = Math.min(excess, batteryCapacityKwh - currentSoC, maxChargeRate);
          currentSoC += charge;
        }
      } else {
        const deficit = load - solar;
        if (currentSoC > minSoCKwh) {
          // Discharge rate limited for realistic battery behavior
          const maxDischargeRate = batteryCapacityKwh * 0.3; // Max 30% per hour
          const discharge = Math.min(deficit, currentSoC - minSoCKwh, maxDischargeRate);
          currentSoC -= discharge;
        }
      }

      return {
        hour,
        "corrected_irradiance_kWh/m2": entry["corrected_irradiance_kWh/m2"],
        solar,
        load,
        soc: currentSoC,
        prevSoc: prevSoC,
        activeAppliances,
      };
    });

    return {
      timestamp: dayData[0].timestamp,
      batteryCapacityKwh,
      minSoCKwh,
      systemSizeKw,
      hourlyData,
    };
  };

  const getApplicableTips = (month: { short: string; full: string; days: number }, day: number) => {
    const monthIndex = MONTHS.findIndex(m => m.short === month.short);
    const dayData = getDayData(monthIndex, day);
    if (!dayData) return [];
    return optimizationTips.filter(tip => tip.condition(dayData));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p>Loading your system data...</p>
        </div>
      </div>
    );
  }

  if (!systemConfig) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">System Not Configured</h2>
          <p className="mb-4">Please configure your solar system first.</p>
          <Button onClick={() => router.push('/data/Settings/ManageSystemAppliances')}>
            Configure System
          </Button>
        </div>
      </div>
    );
  }

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

      {/* System Overview */}
      <div className="w-full bg-white border-b">
        <div className="container mx-auto py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{systemConfig.battery_capacity}</div>
              <div className="text-xs text-gray-600">Battery (Ah)</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{(systemConfig.panel_rating * systemConfig.number_of_panels / 1000).toFixed(1)}</div>
              <div className="text-xs text-gray-600">Solar (kW)</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">{systemConfig.minimum_state_of_charge}</div>
              <div className="text-xs text-gray-600">Min SoC (%)</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{appliances.length}</div>
              <div className="text-xs text-gray-600">Appliances</div>
            </div>
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
                      {tips.map(tip => (
                        <div key={tip.id} className="flex items-start gap-2 p-2 bg-white rounded-lg shadow-sm">
                          {tip.icon}
                          <div>
                            <div className="font-medium text-gray-800">{tip.title}</div>
                            <div className="text-sm text-gray-600">{tip.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    `${tips.length} optimization tip${tips.length > 1 ? 's' : ''} available`
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