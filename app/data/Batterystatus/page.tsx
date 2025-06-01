'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import Link from 'next/link';
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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const battery = {
  usableCapacity: 5.0,
  minSoC: 1.0,
  maxSoC: 6.0,
  efficiency: 0.75,
};

const systemSize = 2.0;

const appliances = {
  parlour: {
    fan: { power: 45, pattern: (h: number) => h >= 11 && h < 17 },
    TV: { power: 90, pattern: (h: number) => h >= 16 && h < 23 },
    bulbs: { power: 18, pattern: (h: number) => h >= 18 && h < 23 },
  },
  kitchen: {
    refrigerator: { power: 100, pattern: (h: number) => h >= 9 && h < 21 },
    microwave: { power: 1000, pattern: (h: number) => h === 8 || h === 16 },
    washingMachine: { power: 400, pattern: (h: number) => h >= 10 && h < 11.5 },
    bulbs: { power: 18, pattern: (h: number) => h >= 19 && h <= 23 },
  },
  bedroom: {
    AC: { power: 1000, pattern: (h: number) => h >= 21 || h < 2 },
    bulbs: { power: 24, pattern: (h: number) => h >= 18 && h <= 23 },
    laptop: { power: 40, pattern: (h: number) => h >= 8 && h < 16 },
    iron: { power: 1000, pattern: (h: number) => h >= 13 && h < 14 },
  },
};

type SolarEntry = {
  timestamp: string;
  ALLSKY_SFC_SW_DWN: number;
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

  useEffect(() => {
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

    // Calculate total daily load for analysis
    let totalDailyLoad = 0;
    let peakLoad = 0;
    let peakHour = '';

    // Initialize battery state based on view
    let soc = battery.usableCapacity;
    if (view === 'daily' && selectedDay > 1) {
      const prevDay = new Date(filtered[0].timestamp);
      prevDay.setDate(prevDay.getDate() - 1);
      prevDay.setHours(23);
      const prevDayData = data.find(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.getTime() === prevDay.getTime();
      });
      if (prevDayData) {
        const prevDayState = calculateBatteryState(prevDayData, soc);
        soc = prevDayState.soc;
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
      
      // Calculate solar generation
      const solar = Math.max(0, entry.ALLSKY_SFC_SW_DWN * systemSize * battery.efficiency);
      
      // Calculate load with detailed tracking
      let load = 0;
      const activeAppliances: string[] = [];
      
      for (const [roomName, room] of Object.entries(appliances)) {
        for (const [appName, app] of Object.entries(room)) {
          if (app.pattern(hour)) {
            const variation = 0.9 + Math.random() * 0.2;
            const appLoad = (app.power * variation) / 1000;
            load += appLoad;
            
            // Track appliance usage
            const key = `${roomName}_${appName}`;
            applianceUsage[key] = (applianceUsage[key] || 0) + appLoad;
            activeAppliances.push(`${roomName}_${appName} (${appLoad.toFixed(2)} kW)`);
          }
        }
      }

      totalDailyLoad += load;
      if (load > peakLoad) {
        peakLoad = load;
        peakHour = time;
      }

      const startHourSOC = soc;
      let charge = 0;
      let discharge = 0;

      // Battery state logic
      if (solar >= load) {
        const excess = solar - load;
        if (soc < battery.usableCapacity) {
          charge = Math.min(excess, battery.usableCapacity - soc);
          soc = Math.min(battery.usableCapacity, soc + charge);
          chargeTotal += charge;
        }
      } else {
        const deficit = load - solar;
        if (soc > battery.minSoC) {
          discharge = Math.min(deficit, soc - battery.minSoC);
          soc = Math.max(battery.minSoC, soc - discharge);
          dischargeTotal += discharge;
        }
      }

      // Calculate percentages for visualization
      const percentStart = (startHourSOC / battery.usableCapacity) * 100;
      const percentEnd = (soc / battery.usableCapacity) * 100;
      const percentCharge = percentEnd - percentStart;
      
      // Only show low state when battery is at or below minSoC (1.0 kWh = 20%)
      const isLowBattery = startHourSOC <= battery.minSoC;

      hourly.push({
        time,
        date,
        base: isLowBattery ? 0 : percentStart,
        charge: Math.max(0, percentCharge),
        low: isLowBattery ? percentStart : 0,
        debug: {
          solar,
          load,
          soc,
          charge,
          discharge,
          activeAppliances,
          isLowBattery,
          batteryPercent: percentStart.toFixed(2)
        }
      });
    }

    let allLabels: string[];
    if (view === 'daily') {
      allLabels = hourly.map(h => h.time);
    } else if (view === 'monthly') {
      const daysInMonth = new Date(2024, selectedMonth + 1, 0).getDate();
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
        base: day.base.count > 0 ? day.base.sum / day.base.count : 0,
        charge: day.charge.count > 0 ? day.charge.sum / day.charge.count : 0,
        low: day.low.count > 0 ? day.low.sum / day.low.count : 0
      }));

      allLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
      hourly = dailyAverages.map((day, i) => ({
        time: (i + 1).toString(),
        date: new Date(2024, selectedMonth, i + 1),
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
        base: month.base.count > 0 ? month.base.sum / month.base.count : 0,
        charge: month.charge.count > 0 ? month.charge.sum / month.charge.count : 0,
        low: month.low.count > 0 ? month.low.sum / month.low.count : 0
      }));

      allLabels = months.map(m => m.slice(0, 3).toUpperCase());
      hourly = monthlyAverages.map((month, i) => ({
        time: months[i].slice(0, 3).toUpperCase(),
        date: new Date(2024, i, 1),
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
          data: hourly.map(d => d.base),
          backgroundColor: '#3b82f6',
          stack: 'stack1',
        },
        {
          label: 'Charging',
          data: hourly.map(d => d.charge),
          backgroundColor: '#facc15',
          stack: 'stack1',
        },
        {
          label: 'Low Battery',
          data: hourly.map(d => d.low),
          backgroundColor: '#ef4444',
          stack: 'stack1',
        },
      ],
    });

    // Calculate summary statistics based on view
    if (view === 'daily') {
      // For daily view, show hourly statistics
      const totalCharged = hourly.reduce((sum, h) => sum + h.charge, 0);
      const totalDischarged = hourly.reduce((sum, h) => {
        const load = h.debug.load;
        const solar = h.debug.solar;
        return sum + (load > solar ? load - solar : 0);
      }, 0);
      const lowBatteryHours = hourly.filter(h => h.low > 0).length;
      const maxCharge = Math.max(...hourly.map(h => h.base + h.charge));
      const minCharge = Math.min(...hourly.map(h => h.base));

      setSummary({
        charged: totalCharged.toFixed(2),
        discharged: totalDischarged.toFixed(2),
        startSOC: ((startSOC / battery.usableCapacity) * 100).toFixed(2),
        endSOC: ((soc / battery.usableCapacity) * 100).toFixed(2),
        lowBatteryHours: lowBatteryHours.toString(),
        maxCharge: maxCharge.toFixed(1),
        minCharge: minCharge.toFixed(1)
      });
    } else if (view === 'monthly') {
      // For monthly view, show daily averages and totals
      const daysInMonth = new Date(2024, selectedMonth + 1, 0).getDate();
      const totalCharged = hourly.reduce((sum, h) => sum + h.charge, 0) * daysInMonth;
      const totalDischarged = hourly.reduce((sum, h) => sum + (h.debug.load > h.debug.solar ? h.debug.load - h.debug.solar : 0), 0) * daysInMonth;
      const avgLowBatteryDays = hourly.filter(h => h.low > 0).length;
      const maxDailyCharge = Math.max(...hourly.map(h => h.base + h.charge));
      const minDailyCharge = Math.min(...hourly.map(h => h.base));

      setSummary({
        charged: totalCharged.toFixed(2),
        discharged: totalDischarged.toFixed(2),
        startSOC: ((startSOC / battery.usableCapacity) * 100).toFixed(2),
        endSOC: ((soc / battery.usableCapacity) * 100).toFixed(2),
        lowBatteryDays: avgLowBatteryDays.toString(),
        maxDailyCharge: maxDailyCharge.toFixed(1),
        minDailyCharge: minDailyCharge.toFixed(1)
      });
    } else {
      // For yearly view, show monthly statistics
      const totalCharged = hourly.reduce((sum, h) => sum + h.charge, 0) * 30; // Approximate monthly average
      const totalDischarged = hourly.reduce((sum, h) => sum + (h.debug.load > h.debug.solar ? h.debug.load - h.debug.solar : 0), 0) * 30;
      const monthsWithLowBattery = hourly.filter(h => h.low > 0).length;
      const maxMonthlyCharge = Math.max(...hourly.map(h => h.base + h.charge));
      const minMonthlyCharge = Math.min(...hourly.map(h => h.base));

      setSummary({
        charged: totalCharged.toFixed(2),
        discharged: totalDischarged.toFixed(2),
        startSOC: ((startSOC / battery.usableCapacity) * 100).toFixed(2),
        endSOC: ((soc / battery.usableCapacity) * 100).toFixed(2),
        monthsWithLowBattery: monthsWithLowBattery.toString(),
        maxMonthlyCharge: maxMonthlyCharge.toFixed(1),
        minMonthlyCharge: minMonthlyCharge.toFixed(1)
      });
    }

    // Comprehensive debug output
    console.log('Daily Analysis:', {
      date: `${selectedMonth + 1}/${selectedDay}/2024`,
      totalDailyLoadKWh: totalDailyLoad.toFixed(2),
      peakLoadKW: peakLoad.toFixed(2),
      peakHour,
      batteryStartPercent: ((startSOC / battery.usableCapacity) * 100).toFixed(2),
      batteryEndPercent: ((soc / battery.usableCapacity) * 100).toFixed(2),
      totalCharged: chargeTotal.toFixed(2),
      totalDischarged: dischargeTotal.toFixed(2),
    });

    console.log('Appliance Daily Usage (kWh):', 
      Object.entries(applianceUsage)
        .sort(([,a], [,b]) => b - a)
        .map(([app, usage]) => `${app}: ${usage.toFixed(2)} kWh`)
    );

    console.log('Hour-by-hour analysis:', hourly.map(h => ({
      time: h.time,
      solar: h.debug.solar.toFixed(2),
      load: h.debug.load.toFixed(2),
      soc: h.debug.soc.toFixed(2),
      charge: h.debug.charge.toFixed(2),
      discharge: h.debug.discharge.toFixed(2),
      activeAppliances: h.debug.activeAppliances
    })));

  }, [selectedMonth, selectedDay, view]);

  // Helper function to calculate battery state for a single hour
  const calculateBatteryState = (entry: SolarEntry, currentSOC: number) => {
    const date = new Date(entry.timestamp);
    const hour = date.getHours();
    
    const solar = entry.ALLSKY_SFC_SW_DWN * systemSize * battery.efficiency;
    let load = 0;
    
    for (const room of Object.values(appliances)) {
      for (const app of Object.values(room)) {
        if (app.pattern(hour)) {
          const variation = 0.9 + Math.random() * 0.2;
          load += (app.power * variation) / 1000;
        }
      }
    }

    let soc = currentSOC;
    if (solar >= load) {
      const excess = solar - load;
      if (soc < battery.usableCapacity) {
        const charge = Math.min(excess, battery.usableCapacity - soc);
        soc += charge;
      }
    } else {
      const deficit = load - solar;
      if (soc > battery.minSoC) {
        const discharge = Math.min(deficit, soc - battery.minSoC);
        soc -= discharge;
      }
    }

    return { soc };
  };

  const getDateLabel = () => {
    if (view === 'daily') return `${months[selectedMonth]} ${selectedDay}, 2024`;
    if (view === 'monthly') return `${months[selectedMonth]} 2024`;
    return 'Year 2024';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Link href="/">
          <Button variant="outline">Back</Button>
        </Link>
        <h2 className="text-xl font-bold">Battery Status - {getDateLabel()}</h2>
        <div className="flex gap-2">
          <Button onClick={() => setView('daily')} variant={view === 'daily' ? 'default' : 'outline'}>Daily</Button>
          <Button onClick={() => setView('monthly')} variant={view === 'monthly' ? 'default' : 'outline'}>Monthly</Button>
          <Button onClick={() => setView('yearly')} variant={view === 'yearly' ? 'default' : 'outline'}>Yearly</Button>
        </div>
      </div>

      {view === 'daily' && (
        <div className="flex gap-2 mb-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {months.map((m, i) => (
              <option value={i} key={m}>{m}</option>
            ))}
          </select>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            className="border rounded px-2 py-1"
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
            className="border rounded px-2 py-1"
          >
            {months.map((m, i) => (
              <option value={i} key={m}>{m}</option>
            ))}
          </select>
        </div>
      )}

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
                  const viewType = view === 'monthly' ? 'day' : 'month';
                  const timeLabel = context.label;
                  
                  if (label === 'Battery Level') {
                    return `${label}: ${value.toFixed(1)}% (Average base level for ${viewType} ${timeLabel})`;
                  } else if (label === 'Charging') {
                    return `${label}: ${value.toFixed(1)}% (Average charging for ${viewType} ${timeLabel})`;
                  } else if (label === 'Low Battery') {
                    return `${label}: ${value.toFixed(1)}% (Average low state for ${viewType} ${timeLabel})`;
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

      <div className="mt-6 p-4 border rounded shadow-md">
        <h3 className="text-lg font-bold">Summary</h3>
        <ul className="mt-2 space-y-2">
          <li><strong>Total energy charged:</strong> {summary.charged} kWh</li>
          <li><strong>Total energy discharged:</strong> {summary.discharged} kWh</li>
          <li><strong>Start battery level:</strong> {summary.startSOC}%</li>
          <li><strong>End battery level:</strong> {summary.endSOC}%</li>
          {view === 'daily' && (
            <>
              <li><strong>Hours in low battery state:</strong> {summary.lowBatteryHours}</li>
              <li><strong>Maximum charge level:</strong> {summary.maxCharge}%</li>
              <li><strong>Minimum charge level:</strong> {summary.minCharge}%</li>
            </>
          )}
          {view === 'monthly' && (
            <>
              <li><strong>Days with low battery:</strong> {summary.lowBatteryDays}</li>
              <li><strong>Highest daily charge:</strong> {summary.maxDailyCharge}%</li>
              <li><strong>Lowest daily charge:</strong> {summary.minDailyCharge}%</li>
            </>
          )}
          {view === 'yearly' && (
            <>
              <li><strong>Months with low battery:</strong> {summary.monthsWithLowBattery}</li>
              <li><strong>Highest monthly charge:</strong> {summary.maxMonthlyCharge}%</li>
              <li><strong>Lowest monthly charge:</strong> {summary.minMonthlyCharge}%</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
