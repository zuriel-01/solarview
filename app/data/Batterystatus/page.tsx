'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import solarData from '@/app/data/solarData.json';
import { Button } from '@/components/ui/button';
import {
  getUserSolarSystem,
  getUserInitialAppliances,
} from '@/lib/db';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

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

type SolarEntry = {
  timestamp: string;
  "corrected_irradiance_kWh/m2": number;
};

type BatterySummary = {
  charged: string;
  discharged: string;
  startSOC: string;
  endSOC: string;
  lowBatteryHours?: string;
  maxCharge?: string;
  minCharge?: string;
  lowBatteryDays?: string;
  maxDailyCharge?: string;
  minDailyCharge?: string;
  monthsWithLowBattery?: string;
  maxMonthlyCharge?: string;
  minMonthlyCharge?: string;
};

type BatteryChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    stack: string;
  }[];
};

// Function to get appliance usage pattern based on type and room
const getAppliancePattern = (applianceName: string, room: string, usageHours: number) => {
  const name = applianceName.toLowerCase();
  const roomLower = room.toLowerCase();
  
  if (roomLower === 'parlour') {
    if (name.includes('fan')) return (h: number) => h >= 11 && h < 17;
    if (name.includes('tv') || name.includes('television')) return (h: number) => h >= 16 && h < 23;
    if (name.includes('light') || name.includes('bulb')) return (h: number) => h >= 18 && h < 23;
  } else if (roomLower === 'kitchen') {
    if (name.includes('fridge') || name.includes('refrigerator')) return (h: number) => h >= 9 && h < 21;
    if (name.includes('microwave')) return (h: number) => h === 8 || h === 16;
    if (name.includes('washing') || name.includes('washer')) return (h: number) => h >= 10 && h < 11.5;
    if (name.includes('light') || name.includes('bulb')) return (h: number) => h >= 19 && h <= 23;
  } else if (roomLower === 'bedroom') {
    if (name.includes('ac') || name.includes('air condition')) return (h: number) => h >= 21 || h < 2;
    if (name.includes('light') || name.includes('bulb')) return (h: number) => h >= 18 && h <= 23;
    if (name.includes('laptop') || name.includes('computer')) return (h: number) => h >= 8 && h < 16;
    if (name.includes('iron') || name.includes('pressing')) return (h: number) => h >= 13 && h < 14;
  }
  
  // Default pattern based on usage hours
  return (h: number) => h >= 6 && h < (6 + usageHours) % 24;
};

export default function BatteryStatusPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [view, setView] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [chartData, setChartData] = useState<BatteryChartData>({ labels: [], datasets: [] });
  const [summary, setSummary] = useState<BatterySummary>({
    charged: '0.00',
    discharged: '0.00',
    startSOC: '100.00',
    endSOC: '100.00',
  });
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Helper function to calculate battery state for a single hour
  const calculateBatteryState = (entry: SolarEntry, currentSOC: number, systemConfig: SystemConfig, appliances: Appliance[]) => {
    const date = new Date(entry.timestamp);
    const hour = date.getHours();
    
    const batteryCapacityKwh = (systemConfig.battery_capacity * 12) / 1000;
    const minSoCKwh = (batteryCapacityKwh * systemConfig.minimum_state_of_charge) / 100;
    const systemSizeKw = (systemConfig.panel_rating * systemConfig.number_of_panels) / 1000;
    const efficiency = 0.75;
    
    const solar = Math.max(0, entry["corrected_irradiance_kWh/m2"]) * systemSizeKw * efficiency;
    
    let load = 0;
    for (const appliance of appliances) {
      const pattern = getAppliancePattern(appliance.appliance_name, appliance.room, appliance.usage_hours);
      if (pattern(hour)) {
        const variation = 0.9 + Math.random() * 0.2;
        load += (appliance.wattage * variation) / 1000;
      }
    }

    let soc = currentSOC;
    if (solar >= load) {
      const excess = solar - load;
      if (soc < batteryCapacityKwh) {
        const charge = Math.min(excess, batteryCapacityKwh - soc);
        soc += charge;
      }
    } else {
      const deficit = load - solar;
      if (soc > minSoCKwh) {
        const discharge = Math.min(deficit, soc - minSoCKwh);
        soc -= discharge;
      }
    }

    return { soc };
  };

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
        
        //console.log('Loaded system config:', savedSystem);
        //console.log('Loaded appliances:', savedAppliances);
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

  useEffect(() => {
    if (!systemConfig || appliances.length === 0) {
      // Set default empty chart data when no config or appliances
      setChartData({ labels: [], datasets: [] });
      setSummary({
        charged: '0.00',
        discharged: '0.00',
        startSOC: '0.00',
        endSOC: '0.00',
      });
      return;
    }

    // Validate system configuration
    if (systemConfig.battery_capacity <= 0 || systemConfig.panel_rating <= 0 || systemConfig.number_of_panels <= 0) {
      console.error('Invalid system configuration detected');
      return;
    }

    const data = solarData as SolarEntry[];
    const filtered = data.filter((entry) => {
      const date = new Date(entry.timestamp);
      if (view === 'daily') {
        return date.getMonth() === selectedMonth && date.getDate() === selectedDay;
      } else if (view === 'monthly') {
        return date.getMonth() === selectedMonth;
      }
      return true;
    });
    filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Battery configuration from user's system
    const batteryCapacityKwh = (systemConfig.battery_capacity * 12) / 1000; // Convert Ah to kWh (assuming 12V)
    const minSoCPercent = systemConfig.minimum_state_of_charge;
    const minSoCKwh = (batteryCapacityKwh * minSoCPercent) / 100;
    const usableCapacity = batteryCapacityKwh - minSoCKwh;
    const systemSizeKw = (systemConfig.panel_rating * systemConfig.number_of_panels) / 1000;
    const efficiency = 0.75;

    // Create appliance patterns from user's actual appliances
    const appliancePatterns = appliances.map(appliance => ({
      power: appliance.wattage,
      pattern: getAppliancePattern(appliance.appliance_name, appliance.room, appliance.usage_hours),
      name: `${appliance.room}_${appliance.appliance_name}`
    }));

    // Calculate total daily load for analysis
    let totalDailyLoad = 0;
    let peakLoad = 0;
    let peakHour = '';

    // Initialize battery state with more realistic starting level
    let soc = batteryCapacityKwh * 0.6; // Start at 60% instead of 100%
    if (view === 'daily' && selectedDay > 1) {
      // For daily view, try to get realistic starting SoC from previous day
      const prevDay = new Date(filtered[0]?.timestamp || new Date());
      prevDay.setDate(prevDay.getDate() - 1);
      prevDay.setHours(23);
      const prevDayData = data.find(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.getTime() === prevDay.getTime();
      });
      if (prevDayData && systemConfig) {
        const prevDayState = calculateBatteryState(prevDayData, soc, systemConfig, appliances);
        soc = prevDayState.soc;
      } else {
        soc = batteryCapacityKwh * 0.7; // Start at 70% for daily view
      }
    }

    let chargeTotal = 0;
    let dischargeTotal = 0;
    const startSOC = soc;
    let hourly = [];

    // Debug: Track appliance usage
    const applianceUsage: Record<string, number> = {};

    for (const entry of filtered) {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      const time = `${hour.toString().padStart(2, '0')}:00`;
      
      // Calculate solar generation using user's actual system
      const irradiance = Math.max(0, entry["corrected_irradiance_kWh/m2"]);
      const solar = irradiance * systemSizeKw * efficiency;
      
      // Calculate load using user's actual appliances
      let load = 0;
      const activeAppliances: string[] = [];
      
      for (const appliance of appliancePatterns) {
        if (appliance.pattern(hour)) {
          const variation = 0.9 + Math.random() * 0.2;
          const appLoad = (appliance.power * variation) / 1000; // Convert to kW
          load += appLoad;
          
          // Track appliance usage
          applianceUsage[appliance.name] = (applianceUsage[appliance.name] || 0) + appLoad;
          activeAppliances.push(`${appliance.name} (${appLoad.toFixed(2)} kW)`);
        }
      }

      // Add base household load even when no specific appliances are running
      const baseLoad = 0.1; // 100W base load for always-on devices
      load += baseLoad;

      totalDailyLoad += load;
      if (load > peakLoad) {
        peakLoad = load;
        peakHour = time;
      }

      const startHourSOC = soc;
      let charge = 0;
      let discharge = 0;

      // Enhanced battery state logic with more realistic behavior
      if (solar > load) {
        const excess = solar - load;
        if (soc < batteryCapacityKwh) {
          // Charging rate limited to prevent instant charging
          const maxChargeRate = batteryCapacityKwh * 0.2; // Max 20% per hour
          charge = Math.min(excess, batteryCapacityKwh - soc, maxChargeRate);
          soc = Math.min(batteryCapacityKwh, soc + charge);
          chargeTotal += charge;
        }
      } else {
        const deficit = load - solar;
        if (soc > minSoCKwh) {
          // Discharge rate limited for realistic battery behavior
          const maxDischargeRate = batteryCapacityKwh * 0.3; // Max 30% per hour
          discharge = Math.min(deficit, soc - minSoCKwh, maxDischargeRate);
          soc = Math.max(minSoCKwh, soc - discharge);
          dischargeTotal += discharge;
        }
      }

      // Debug logging for first few hours
      if (hourly.length < 5) {
        // //console.log(`Hour ${time}:`, {
        //   irradiance: irradiance.toFixed(3),
        //   solar: solar.toFixed(3),
        //   load: load.toFixed(3),
        //   excess: (solar - load).toFixed(3),
        //   startSOC: startHourSOC.toFixed(2),
        //   endSOC: soc.toFixed(2),
        //   charge: charge.toFixed(3),
        //   discharge: discharge.toFixed(3),
        //   activeAppliances: activeAppliances.length
        // });
      }

      // Calculate percentages for visualization
      const percentStart = batteryCapacityKwh > 0 ? (startHourSOC / batteryCapacityKwh) * 100 : 0;
      const percentEnd = batteryCapacityKwh > 0 ? (soc / batteryCapacityKwh) * 100 : 0;
      const percentCharge = percentEnd - percentStart;
      
      // Show low state when battery is at or below configured minimum
      const isLowBattery = startHourSOC <= minSoCKwh;

      hourly.push({
        time,
        date,
        base: isLowBattery ? 0 : (isNaN(percentStart) ? 0 : Math.max(0, percentStart)),
        charge: isNaN(percentCharge) ? 0 : Math.max(0, percentCharge),
        low: isLowBattery ? (isNaN(percentStart) ? 0 : Math.max(0, percentStart)) : 0,
        debug: {
          solar: isNaN(solar) ? 0 : solar,
          load: isNaN(load) ? 0 : load,
          soc: isNaN(soc) ? 0 : soc,
          charge: isNaN(charge) ? 0 : charge,
          discharge: isNaN(discharge) ? 0 : discharge,
          activeAppliances,
          isLowBattery,
          batteryPercent: isNaN(percentStart) ? '0.00' : percentStart.toFixed(2)
        }
      });
    }

    let allLabels: string[];
    if (view === 'daily') {
      allLabels = hourly.map(h => h.time);
    } else if (view === 'monthly') {
      const daysInMonth = new Date(2025, selectedMonth + 1, 0).getDate();
      const dailyTotals = Array(daysInMonth).fill(0).map(() => ({
        base: { sum: 0, count: 0 },
        charge: { sum: 0, count: 0 },
        low: { sum: 0, count: 0 }
      }));

      // Sum up values for each state separately
      hourly.forEach(hour => {
        const dayOfMonth = hour.date.getDate() - 1;
        if (hour.base > 0) {
          dailyTotals[dayOfMonth].base.sum += hour.base;
          dailyTotals[dayOfMonth].base.count++;
        }
        if (hour.charge > 0) {
          dailyTotals[dayOfMonth].charge.sum += hour.charge;
          dailyTotals[dayOfMonth].charge.count++;
        }
        if (hour.low > 0) {
          dailyTotals[dayOfMonth].low.sum += hour.low;
          dailyTotals[dayOfMonth].low.count++;
        }
      });

      // Calculate averages for each state
      const dailyAverages = dailyTotals.map(day => ({
        base: day.base.count > 0 && !isNaN(day.base.sum) ? day.base.sum / day.base.count : 0,
        charge: day.charge.count > 0 && !isNaN(day.charge.sum) ? day.charge.sum / day.charge.count : 0,
        low: day.low.count > 0 && !isNaN(day.low.sum) ? day.low.sum / day.low.count : 0
      }));

      allLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
      hourly = dailyAverages.map((day, i) => ({
        time: (i + 1).toString(),
        date: new Date(2025, selectedMonth, i + 1),
        base: day.base,
        charge: day.charge,
        low: day.low,
        debug: {
          solar: 0,
          load: 0,
          soc: 0,
          charge: 0,
          discharge: 0,
          activeAppliances: []
        }
      }));
    } else {
      const monthlyTotals = Array(12).fill(0).map(() => ({
        base: { sum: 0, count: 0 },
        charge: { sum: 0, count: 0 },
        low: { sum: 0, count: 0 }
      }));

      // Sum up values for each state separately
      hourly.forEach(hour => {
        const month = hour.date.getMonth();
        if (hour.base > 0) {
          monthlyTotals[month].base.sum += hour.base;
          monthlyTotals[month].base.count++;
        }
        if (hour.charge > 0) {
          monthlyTotals[month].charge.sum += hour.charge;
          monthlyTotals[month].charge.count++;
        }
        if (hour.low > 0) {
          monthlyTotals[month].low.sum += hour.low;
          monthlyTotals[month].low.count++;
        }
      });

      // Calculate averages for each state
      const monthlyAverages = monthlyTotals.map(month => ({
        base: month.base.count > 0 && !isNaN(month.base.sum) ? month.base.sum / month.base.count : 0,
        charge: month.charge.count > 0 && !isNaN(month.charge.sum) ? month.charge.sum / month.charge.count : 0,
        low: month.low.count > 0 && !isNaN(month.low.sum) ? month.low.sum / month.low.count : 0
      }));

      allLabels = months.map(m => m.slice(0, 3).toUpperCase());
      hourly = monthlyAverages.map((month, i) => ({
        time: months[i].slice(0, 3).toUpperCase(),
        date: new Date(2025, i, 1),
        base: month.base,
        charge: month.charge,
        low: month.low,
        debug: {
          solar: 0,
          load: 0,
          soc: 0,
          charge: 0,
          discharge: 0,
          activeAppliances: []
        }
      }));
    }

    setChartData({
      labels: allLabels,
      datasets: [
        {
          label: 'Battery Level',
          data: hourly.map(d => isNaN(d.base) ? 0 : d.base),
          backgroundColor: '#3b82f6',
          stack: 'stack1',
        },
        {
          label: 'Charging',
          data: hourly.map(d => isNaN(d.charge) ? 0 : d.charge),
          backgroundColor: '#facc15',
          stack: 'stack1',
        },
        {
          label: 'Low Battery',
          data: hourly.map(d => isNaN(d.low) ? 0 : d.low),
          backgroundColor: '#ef4444',
          stack: 'stack1',
        },
      ],
    });

    // Calculate summary statistics based on view
    if (view === 'daily') {
      const totalCharged = hourly.reduce((sum, h) => sum + (isNaN(h.charge) ? 0 : h.charge), 0);
      const totalDischarged = hourly.reduce((sum, h) => {
        const load = h.debug.load || 0;
        const solar = h.debug.solar || 0;
        return sum + (load > solar ? load - solar : 0);
      }, 0);
      const lowBatteryHours = hourly.filter(h => h.low > 0).length;
      
      const chargeValues = hourly.map(h => (h.base || 0) + (h.charge || 0)).filter(v => !isNaN(v) && isFinite(v));
      const baseValues = hourly.map(h => h.base || 0).filter(v => !isNaN(v) && isFinite(v));
      
      const maxCharge = chargeValues.length > 0 ? Math.max(...chargeValues) : 0;
      const minCharge = baseValues.length > 0 ? Math.min(...baseValues) : 0;

      setSummary({
        charged: isNaN(totalCharged) ? '0.00' : totalCharged.toFixed(2),
        discharged: isNaN(totalDischarged) ? '0.00' : totalDischarged.toFixed(2),
        startSOC: isNaN(startSOC) || batteryCapacityKwh === 0 ? '0.00' : ((startSOC / batteryCapacityKwh) * 100).toFixed(2),
        endSOC: isNaN(soc) || batteryCapacityKwh === 0 ? '0.00' : ((soc / batteryCapacityKwh) * 100).toFixed(2),
        lowBatteryHours: lowBatteryHours.toString(),
        maxCharge: isNaN(maxCharge) ? '0.0' : maxCharge.toFixed(1),
        minCharge: isNaN(minCharge) ? '0.0' : minCharge.toFixed(1)
      });
    } else if (view === 'monthly') {
      const daysInMonth = new Date(2025, selectedMonth + 1, 0).getDate();
      const totalCharged = hourly.reduce((sum, h) => sum + (isNaN(h.charge) ? 0 : h.charge), 0) * daysInMonth;
      const totalDischarged = hourly.reduce((sum, h) => {
        const load = h.debug.load || 0;
        const solar = h.debug.solar || 0;
        return sum + (load > solar ? load - solar : 0);
      }, 0) * daysInMonth;
      const avgLowBatteryDays = hourly.filter(h => h.low > 0).length;
      
      const chargeValues = hourly.map(h => (h.base || 0) + (h.charge || 0)).filter(v => !isNaN(v) && isFinite(v));
      const baseValues = hourly.map(h => h.base || 0).filter(v => !isNaN(v) && isFinite(v));
      
      const maxDailyCharge = chargeValues.length > 0 ? Math.max(...chargeValues) : 0;
      const minDailyCharge = baseValues.length > 0 ? Math.min(...baseValues) : 0;

      setSummary({
        charged: isNaN(totalCharged) ? '0.00' : totalCharged.toFixed(2),
        discharged: isNaN(totalDischarged) ? '0.00' : totalDischarged.toFixed(2),
        startSOC: isNaN(startSOC) || batteryCapacityKwh === 0 ? '0.00' : ((startSOC / batteryCapacityKwh) * 100).toFixed(2),
        endSOC: isNaN(soc) || batteryCapacityKwh === 0 ? '0.00' : ((soc / batteryCapacityKwh) * 100).toFixed(2),
        lowBatteryDays: avgLowBatteryDays.toString(),
        maxDailyCharge: isNaN(maxDailyCharge) ? '0.0' : maxDailyCharge.toFixed(1),
        minDailyCharge: isNaN(minDailyCharge) ? '0.0' : minDailyCharge.toFixed(1)
      });
    } else {
      const totalCharged = hourly.reduce((sum, h) => sum + (isNaN(h.charge) ? 0 : h.charge), 0) * 30;
      const totalDischarged = hourly.reduce((sum, h) => {
        const load = h.debug.load || 0;
        const solar = h.debug.solar || 0;
        return sum + (load > solar ? load - solar : 0);
      }, 0) * 30;
      const monthsWithLowBattery = hourly.filter(h => h.low > 0).length;
      
      const chargeValues = hourly.map(h => (h.base || 0) + (h.charge || 0)).filter(v => !isNaN(v) && isFinite(v));
      const baseValues = hourly.map(h => h.base || 0).filter(v => !isNaN(v) && isFinite(v));
      
      const maxMonthlyCharge = chargeValues.length > 0 ? Math.max(...chargeValues) : 0;
      const minMonthlyCharge = baseValues.length > 0 ? Math.min(...baseValues) : 0;

      setSummary({
        charged: isNaN(totalCharged) ? '0.00' : totalCharged.toFixed(2),
        discharged: isNaN(totalDischarged) ? '0.00' : totalDischarged.toFixed(2),
        startSOC: isNaN(startSOC) || batteryCapacityKwh === 0 ? '0.00' : ((startSOC / batteryCapacityKwh) * 100).toFixed(2),
        endSOC: isNaN(soc) || batteryCapacityKwh === 0 ? '0.00' : ((soc / batteryCapacityKwh) * 100).toFixed(2),
        monthsWithLowBattery: monthsWithLowBattery.toString(),
        maxMonthlyCharge: isNaN(maxMonthlyCharge) ? '0.0' : maxMonthlyCharge.toFixed(1),
        minMonthlyCharge: isNaN(minMonthlyCharge) ? '0.0' : minMonthlyCharge.toFixed(1)
      });
    }

<<<<<<< HEAD
    // Debug output with enhanced information
    //console.log('Battery Analysis:', {
    //   date: `${selectedMonth + 1}/${selectedDay}/2024`,
    //   systemSizeKw: systemSizeKw.toFixed(2),
    //   batteryCapacityKwh: batteryCapacityKwh.toFixed(2),
    //   minSoCKwh: minSoCKwh.toFixed(2),
    //   totalDailyLoadKWh: totalDailyLoad.toFixed(2),
    //   peakLoadKW: peakLoad.toFixed(2),
    //   peakHour,
    //   batteryStartPercent: ((startSOC / batteryCapacityKwh) * 100).toFixed(2),
    //   batteryEndPercent: ((soc / batteryCapacityKwh) * 100).toFixed(2),
    //   totalCharged: chargeTotal.toFixed(2),
    //   totalDischarged: dischargeTotal.toFixed(2),
    //   dataPointsProcessed: filtered.length,
    //   avgDailyIrradiance: (filtered.reduce((sum, entry) => sum + entry["corrected_irradiance_kWh/m2"], 0) / filtered.length).toFixed(3)
    // });

    //console.log('Appliance Daily Usage (kWh):', 
    //   Object.entries(applianceUsage)
    //     .sort(([,a], [,b]) => b - a)
    //     .map(([app, usage]) => `${app}: ${usage.toFixed(2)} kWh`)
    // );

    // Check if we have realistic load patterns
    if (totalDailyLoad < 1) {
      console.warn('⚠️ Very low daily load detected. Check appliance configurations.');
    }
    
    if (peakLoad < 0.5) {
      console.warn('⚠️ Very low peak load. This might cause unrealistic battery behavior.');
    }
=======
    // Debug output
    console.log('Battery Analysis:', {
      date: `${selectedMonth + 1}/${selectedDay}/2025`,
      systemSizeKw: systemSizeKw.toFixed(2),
      batteryCapacityKwh: batteryCapacityKwh.toFixed(2),
      totalDailyLoadKWh: totalDailyLoad.toFixed(2),
      peakLoadKW: peakLoad.toFixed(2),
      peakHour,
      batteryStartPercent: ((startSOC / batteryCapacityKwh) * 100).toFixed(2),
      batteryEndPercent: ((soc / batteryCapacityKwh) * 100).toFixed(2),
      totalCharged: chargeTotal.toFixed(2),
      totalDischarged: dischargeTotal.toFixed(2),
    });

    console.log('Appliance Daily Usage (kWh):', 
      Object.entries(applianceUsage)
        .sort(([,a], [,b]) => b - a)
        .map(([app, usage]) => `${app}: ${usage.toFixed(2)} kWh`)
    );
>>>>>>> f59abde29fbb53c8f35f673ba6f327835bc845eb

  }, [selectedMonth, selectedDay, view, systemConfig, appliances]);

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

  const getDateLabel = () => {
    if (view === 'daily') return `${months[selectedMonth]} ${selectedDay}, 2024`;
    if (view === 'monthly') return `${months[selectedMonth]} 2024`;
    return 'Year 2024';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline">Back</Button>
          </Link>
          <h2 className="text-2xl font-bold">Battery Status - {getDateLabel()}</h2>
          <div className="flex gap-2">
            <Button onClick={() => setView('daily')} variant={view === 'daily' ? 'default' : 'outline'}>Daily</Button>
            <Button onClick={() => setView('monthly')} variant={view === 'monthly' ? 'default' : 'outline'}>Monthly</Button>
            <Button onClick={() => setView('yearly')} variant={view === 'yearly' ? 'default' : 'outline'}>Yearly</Button>
          </div>
        </div>

        {/* System Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Battery System</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{systemConfig.battery_capacity}</div>
              <div className="text-sm text-gray-600">Battery (Ah)</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{(systemConfig.panel_rating * systemConfig.number_of_panels / 1000).toFixed(1)}</div>
              <div className="text-sm text-gray-600">Solar (kW)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{systemConfig.minimum_state_of_charge}</div>
              <div className="text-sm text-gray-600">Min SoC (%)</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{appliances.length}</div>
              <div className="text-sm text-gray-600">Appliances</div>
            </div>
          </CardContent>
        </Card>

        {/* Date Controls */}
        {view === 'daily' && (
          <div className="flex gap-2 mb-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {months.map((m, i) => (
                <option value={i} key={m}>{m}</option>
              ))}
            </select>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option value={d} key={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        {view === 'monthly' && (
          <div className="mb-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {months.map((m, i) => (
                <option value={i} key={m}>{m}</option>
              ))}
            </select>
          </div>
        )}

        {/* Chart */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    enabled: true,
                    callbacks: {
                      label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.raw as number;
                        const viewType = view === 'monthly' ? 'day' : view === 'yearly' ? 'month' : 'hour';
                        const timeLabel = context.label;
                        
                        if (label === 'Battery Level') {
                          return `${label}: ${value.toFixed(1)}% (Base level)`;
                        } else if (label === 'Charging') {
                          return `${label}: ${value.toFixed(1)}% (Charging state)`;
                        } else if (label === 'Low Battery') {
                          return `${label}: ${value.toFixed(1)}% (Low battery state)`;
                        }
                        return `${label}: ${value.toFixed(1)}%`;
                      },
                      title: function(context) {
                        const timeLabel = context[0].label;
                        if (view === 'monthly') {
                          return `Day ${timeLabel}`;
                        } else if (view === 'yearly') {
                          return timeLabel;
                        }
                        return timeLabel;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    title: { display: true, text: 'Battery Level (%)' },
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Battery Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{summary.charged}</div>
                <div className="text-sm text-gray-600">Energy Charged (kWh)</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{summary.discharged}</div>
                <div className="text-sm text-gray-600">Energy Discharged (kWh)</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{summary.startSOC}%</div>
                <div className="text-sm text-gray-600">Start Battery Level</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{summary.endSOC}%</div>
                <div className="text-sm text-gray-600">End Battery Level</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {view === 'daily' && (
                <>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">{summary.lowBatteryHours}</div>
                    <div className="text-sm text-gray-600">Hours in Low Battery State</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-lg font-bold text-emerald-600">{summary.maxCharge}%</div>
                    <div className="text-sm text-gray-600">Maximum Charge Level</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-lg font-bold text-amber-600">{summary.minCharge}%</div>
                    <div className="text-sm text-gray-600">Minimum Charge Level</div>
                  </div>
                </>
              )}
              {view === 'monthly' && (
                <>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">{summary.lowBatteryDays}</div>
                    <div className="text-sm text-gray-600">Days with Low Battery</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-lg font-bold text-emerald-600">{summary.maxDailyCharge}%</div>
                    <div className="text-sm text-gray-600">Highest Daily Charge</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-lg font-bold text-amber-600">{summary.minDailyCharge}%</div>
                    <div className="text-sm text-gray-600">Lowest Daily Charge</div>
                  </div>
                </>
              )}
              {view === 'yearly' && (
                <>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">{summary.monthsWithLowBattery}</div>
                    <div className="text-sm text-gray-600">Months with Low Battery</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-lg font-bold text-emerald-600">{summary.maxMonthlyCharge}%</div>
                    <div className="text-sm text-gray-600">Highest Monthly Charge</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-lg font-bold text-amber-600">{summary.minMonthlyCharge}%</div>
                    <div className="text-sm text-gray-600">Lowest Monthly Charge</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}