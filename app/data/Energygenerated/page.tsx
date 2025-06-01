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
import solarData from '@/app/data/solarData.json'; // updated file you uploaded

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const monthAbbr = months.map(m => m.slice(0, 3).toUpperCase());

export default function EnergyGenerated() {
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [view, setView] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [datasets, setDatasets] = useState<ChartDataset<'line'>[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [solarEnergyGenerated, setSolarEnergyGenerated] = useState<number>(0);

  const getDateLabel = () => {
    if (view === 'daily') {
      return `${months[selectedMonth]} ${selectedDay}, 2024`;
    } else if (view === 'monthly') {
      return `${months[selectedMonth]} 2024`;
    }
    return 'Year 2024';
  };

  useEffect(() => {
    const data = solarData as { timestamp: string; ALLSKY_SFC_SW_DWN: number }[];

    // Find maximum solar generation for the entire year
    const maxGeneration = data.reduce((max, entry) => {
      const irradiance = entry.ALLSKY_SFC_SW_DWN;
      const panelWattageKw = 0.35;
      const panelCount = 8;
      const systemPowerKw = panelWattageKw * panelCount;
      const performanceFactor = 0.75;
      const productionKw = irradiance * systemPowerKw * performanceFactor;
      return Math.max(max, productionKw);
    }, 0);

    console.log('Maximum solar generation:', maxGeneration.toFixed(2), 'kWh');

    const filtered = data.filter((entry) => {
      const date = new Date(entry.timestamp);
      if (view === 'daily') {
        return date.getMonth() === selectedMonth && date.getDate() === selectedDay;
      } else if (view === 'monthly') {
        return date.getMonth() === selectedMonth;
      }
      return true; // yearly view
    });

    if (view === 'daily') {
      // --- DAILY: per hour ---
      const hourlyEnergy = filtered.map((entry) => {
        const date = new Date(entry.timestamp);
        const hour = date.getHours();
        const irradiance = entry.ALLSKY_SFC_SW_DWN; // kWh/m²
        const panelWattageKw = 0.35; // 350W panel
        const panelCount = 8; // 8 panels
        const systemPowerKw = panelWattageKw * panelCount; // 2.8kW
        const performanceFactor = 0.75; // 75% real-world efficiency
        const productionKw = irradiance * systemPowerKw * performanceFactor;
        return {
          time: `${hour.toString().padStart(2, '0')}:00`,
          energyGenerated: productionKw,
        };
      });
      setLabels(hourlyEnergy.map(d => d.time));
      setDatasets([{
        label: 'Energy Generated (kWh)',
        data: hourlyEnergy.map(d => d.energyGenerated),
        borderColor: '#22c55e',
        backgroundColor: '#22c55e33',
        tension: 0.4,
        fill: true,
      }]);
      setSolarEnergyGenerated(hourlyEnergy.reduce((acc, curr) => acc + curr.energyGenerated, 0));
    } else if (view === 'monthly') {
      // --- MONTHLY: per day ---
      const dailyTotals: { [key: string]: number } = {};
      const dailyCounts: { [key: string]: number } = {};
      let monthlyTotal = 0;
      
      // Get the number of days in the selected month
      const daysInMonth = new Date(2024, selectedMonth + 1, 0).getDate();
      
      // Initialize all days in the month
      for (let day = 1; day <= daysInMonth; day++) {
        dailyTotals[day.toString()] = 0;
        dailyCounts[day.toString()] = 0;
      }
      
      filtered.forEach((entry) => {
        const date = new Date(entry.timestamp);
        const dayOfMonth = date.getDate();
        
        const irradiance = entry.ALLSKY_SFC_SW_DWN;
        const panelWattageKw = 0.35;
        const panelCount = 8;
        const systemPowerKw = panelWattageKw * panelCount;
        const performanceFactor = 0.75;
        const productionKw = irradiance * systemPowerKw * performanceFactor;
        
        dailyTotals[dayOfMonth.toString()] += productionKw;
        dailyCounts[dayOfMonth.toString()]++;
        monthlyTotal += productionKw;
      });

      const labels = Object.keys(dailyTotals).sort((a, b) => parseInt(a) - parseInt(b));
      const dailyAverages = labels.map(label => 
        dailyCounts[label] ? dailyTotals[label] / dailyCounts[label] : 0
      );

      setLabels(labels);
      setDatasets([{
        label: 'Energy Generated (kWh)',
        data: dailyAverages,
        borderColor: '#22c55e',
        backgroundColor: '#22c55e33',
        tension: 0.4,
        fill: true,
      }]);
      setSolarEnergyGenerated(monthlyTotal);
    } else {
      // --- YEARLY: per month ---
      const monthlyTotals = Array(12).fill(0);
      const monthlyCounts = Array(12).fill(0);
      let yearlyTotal = 0;

      filtered.forEach((entry) => {
        const date = new Date(entry.timestamp);
        const month = date.getMonth();
        const irradiance = Math.max(0, entry.ALLSKY_SFC_SW_DWN); // Ensure non-negative irradiance
        const panelWattageKw = 0.35;
        const panelCount = 8;
        const systemPowerKw = panelWattageKw * panelCount;
        const performanceFactor = 0.75;
        const productionKw = irradiance * systemPowerKw * performanceFactor;
        
        monthlyTotals[month] += productionKw;
        monthlyCounts[month]++;
        yearlyTotal += productionKw;
      });

      const monthlyAverages = monthlyTotals.map((total, i) => {
        const avg = monthlyCounts[i] ? total / monthlyCounts[i] : 0;
        return Math.max(0, avg); // Ensure non-negative average
      });

      setLabels(monthAbbr);
      setDatasets([{
        label: 'Energy Generated (kWh)',
        data: monthlyAverages,
        borderColor: '#22c55e',
        backgroundColor: '#22c55e33',
        tension: 0.4,
        fill: true,
      }]);
      setSolarEnergyGenerated(yearlyTotal);
    }
  }, [selectedMonth, selectedDay, view]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Link href="/">
          <Button variant="outline">Back</Button>
        </Link>
        <h2 className="text-xl font-bold">Energy Generated - {getDateLabel()}</h2>
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
          plugins: { legend: { position: 'top' } },
          scales: {
            y: { 
              title: { display: true, text: 'kWh' },
              min: 0,
              max: 1.4
            },
          },
        }}
      />

      {/* Summary Panel */}
      <div className="mt-6 p-4 border rounded shadow-md">
        <h3 className="text-lg font-bold">Summary</h3>
        <ul className="mt-2 space-y-2">
          <li><strong>Solar Energy Generated:</strong> {solarEnergyGenerated.toFixed(2)} kWh</li>
        </ul>
      </div>
    </div>
  );
}
