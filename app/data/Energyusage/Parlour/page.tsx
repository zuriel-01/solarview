'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartDataset,
} from 'chart.js';
import solarData from '@/app/data/solarData.json';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const applianceInfo = {
  fan: {
    power: 45,
    usagePattern: Array.from({ length: 24 }, (_, hour) => hour >= 11 && hour < 17),
  },
  TV: {
    power: 90,
    usagePattern: Array.from({ length: 24 }, (_, hour) => hour >= 16 && hour < 23),
  },
  bulbs: {
    power: 18,
    usagePattern: Array.from({ length: 24 }, (_, hour) => hour >= 18 && hour < 23),
  },
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const monthAbbr = months.map(m => m.slice(0, 3).toUpperCase());

interface UsageData {
  time: string;
  date: Date;
  fan: number;
  TV: number;
  bulbs: number;
}

export default function ParlourEnergyUsage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [view, setView] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [datasets, setDatasets] = useState<ChartDataset<'line'>[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [totalUsage, setTotalUsage] = useState<number>(0);

  const getDateLabel = () => {
    if (view === 'daily') {
      return `${months[selectedMonth]} ${selectedDay}, 2024`;
    } else if (view === 'monthly') {
      return `${months[selectedMonth]} 2024`;
    }
    return 'Year 2024';
  };

  useEffect(() => {
    const data = solarData as { timestamp: string }[];
    const filtered = data.filter((entry) => {
      const date = new Date(entry.timestamp);
      if (view === 'daily') {
        return date.getMonth() === selectedMonth && date.getDate() === selectedDay;
      } else if (view === 'monthly') {
        return date.getMonth() === selectedMonth;
      }
      return true;
    });

    let usageTotal = 0;
    let hourlyUsage: UsageData[] = [];

    hourlyUsage = filtered.map((entry) => {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      const usage: Record<keyof typeof applianceInfo, number> = {} as Record<keyof typeof applianceInfo, number>;

      for (const [appliance, { power, usagePattern }] of Object.entries(applianceInfo)) {
        if (usagePattern[hour]) {
          const variation = 0.9 + Math.random() * 0.2;
          const value = (power * variation) / 1000;
          usage[appliance as keyof typeof applianceInfo] = value;
          usageTotal += value;
        } else {
          usage[appliance as keyof typeof applianceInfo] = 0;
        }
      }

      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        date,
        ...usage,
      } as UsageData;
    });

    setTotalUsage(usageTotal);

    let allLabels: string[];
    if (view === 'daily') {
      allLabels = hourlyUsage.map(d => d.time);
    } else if (view === 'monthly') {
      const daysInMonth = new Date(2024, selectedMonth + 1, 0).getDate();
      const dailyTotals = Array(daysInMonth).fill(0).map(() => Array(Object.keys(applianceInfo).length).fill(0));
      const dailyCounts = Array(daysInMonth).fill(0);

      hourlyUsage.forEach(usage => {
        const dayOfMonth = usage.date.getDate() - 1; // 0-based index
        dailyCounts[dayOfMonth]++;
        Object.keys(applianceInfo).forEach((appliance, idx) => {
          dailyTotals[dayOfMonth][idx] += usage[appliance as keyof typeof applianceInfo];
        });
      });

      dailyTotals.forEach((day, i) => {
        day.forEach((_, idx) => {
          day[idx] = dailyCounts[i] ? day[idx] / dailyCounts[i] : 0;
        });
      });

      allLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
      hourlyUsage = dailyTotals.map((day, i) => ({
        time: (i + 1).toString(),
        date: new Date(),
        fan: day[0],
        TV: day[1],
        bulbs: day[2]
      }));
    } else {
      const monthlyAverages = Array(12).fill(0).map(() => Array(Object.keys(applianceInfo).length).fill(0));
      const monthCounts = Array(12).fill(0);

      hourlyUsage.forEach(usage => {
        const month = usage.date.getMonth();
        monthCounts[month]++;
        Object.keys(applianceInfo).forEach((appliance, idx) => {
          monthlyAverages[month][idx] += usage[appliance as keyof typeof applianceInfo];
        });
      });

      monthlyAverages.forEach((month, i) => {
        month.forEach((_, idx) => {
          month[idx] = monthCounts[i] ? month[idx] / monthCounts[i] : 0;
        });
      });

      allLabels = monthAbbr;
      hourlyUsage = monthlyAverages.map((month, i) => ({
        time: monthAbbr[i],
        date: new Date(),
        fan: month[0],
        TV: month[1],
        bulbs: month[2]
      }));
    }

    const datasets: ChartDataset<'line'>[] = Object.keys(applianceInfo).map((appliance, idx) => {
      const colors = ['#f59e0b', '#ef4444', '#10b981', '#6366f1'];
      return {
        label: appliance,
        data: hourlyUsage.map((d) => d[appliance as keyof typeof applianceInfo]),
        borderColor: colors[idx % colors.length],
        backgroundColor: `${colors[idx % colors.length]}33`,
        tension: 0.4,
        fill: false,
      };
    });

    setLabels(allLabels);
    setDatasets(datasets);
  }, [selectedMonth, selectedDay, view]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Link href="/data/Energyusage">
          <Button variant="outline">Back</Button>
        </Link>
        <h2 className="text-xl font-bold">Parlour Usage - {getDateLabel()}</h2>
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

      <Line
        data={{ labels, datasets }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: { enabled: true },
          },
          scales: {
            y: {
              title: { display: true, text: 'kWh' },
              min: 0,
              max: view === 'daily' ? 1.4 : 1
            },
          },
        }}
      />

      {/* Summary Panel */}
      <div className="mt-6 p-4 border rounded shadow-md">
        <h3 className="text-lg font-bold">Summary</h3>
        <ul className="mt-2 space-y-2">
          {datasets.map((dataset) => {
            const total = (dataset.data as number[]).reduce((sum, val) => sum + val, 0);
            return (
              <li key={dataset.label}>
                <strong>{dataset.label}:</strong> {total.toFixed(2)} kWh
              </li>
            );
          })}
          <li>
            <strong>Total appliance usage:</strong> {totalUsage.toFixed(2)} kWh
          </li>
        </ul>
      </div>
    </div>
  );
}
