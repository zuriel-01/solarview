'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import solarData from '@/app/data/solarData.json';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BatteryStatus() {
  const [view, setView] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor: string[] }[];
  }>({ labels: [], datasets: [] });

  // Constants
  const batteryCapacity = 10; // 10 kWh total (2 batteries)
  const hourlyUsage = 1.44;   // estimated total usage per hour
  const efficiency = 0.2;
  const totalPanelArea = 32; // m² for 20 panels

  useEffect(() => {
    const batteryLevels: number[] = [];
    const batteryColors: string[] = [];

    let currentBattery = batteryCapacity / 2; // Start at 50%

    // interface SolarData {
    //       timestamp: string;
    //       solar_irradiance: number; // Derived from ALLSKY_SFC_SW_DWN
    //     }

    const hourlyData = (solarData as { timestamp: string; ALLSKY_SFC_SW_DWN: number }[]).map((entry) => {
      const solarIrradiance = entry.ALLSKY_SFC_SW_DWN; // Map ALLSKY_SFC_SW_DWN to solar_irradiance
      const time = new Date(entry.timestamp);
      const energyGenerated = (solarIrradiance * totalPanelArea * efficiency) / 1000;

      const netEnergy = energyGenerated - hourlyUsage;

      currentBattery += netEnergy;
      if (currentBattery > batteryCapacity) currentBattery = batteryCapacity;
      if (currentBattery < 0) currentBattery = 0;

      batteryLevels.push(currentBattery);

      // Assign color
      if (netEnergy > 0) {
        batteryColors.push('rgba(234,179,8,0.8)'); // charging - yellow
      } else if (currentBattery < 3) {
        batteryColors.push('rgba(239,68,68,0.8)'); // low - red
      } else {
        batteryColors.push('rgba(34,197,94,0.8)'); // normal - green
      }

      return {
        level: currentBattery,
        color: batteryColors[batteryColors.length - 1],
        time: time
      };
    });

    // Prepare data based on view
    if (view === 'daily') {
      const today = hourlyData.slice(0, 24);
      setChartData({
        labels: today.map(d => `${d.time.getHours()}:00`),
        datasets: [{
          label: 'Battery Level (kWh)',
          data: today.map(d => d.level),
          backgroundColor: today.map(d => d.color)
        }]
      });
    } else if (view === 'monthly') {
      const monthly = Array(12).fill(0);
      const counts = Array(12).fill(0);

      hourlyData.forEach(d => {
        const m = d.time.getMonth();
        monthly[m] += d.level;
        counts[m]++;
      });

      const avgMonthly = monthly.map((sum, i) => sum / counts[i]);

      setChartData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Avg Battery Level (kWh)',
          data: avgMonthly,
          backgroundColor: avgMonthly.map(val =>
            val < 3 ? 'rgba(239,68,68,0.8)' :
              val >= batteryCapacity ? 'rgba(234,179,8,0.8)' :
              'rgba(34,197,94,0.8)'
          )
        }]
      });
    } else if (view === 'yearly') {
      setChartData({
        labels: hourlyData.map(d => d.time.toLocaleDateString()),
        datasets: [{
          label: 'Battery Level (kWh)',
          data: hourlyData.map(d => d.level),
          backgroundColor: hourlyData.map(d => d.color)
        }]
      });
    }

  }, [view]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Battery Status</h2>

      <div className="flex gap-2 mb-4">
        <Button onClick={() => setView('daily')} variant={view === 'daily' ? 'default' : 'outline'}>Today</Button>
        <Button onClick={() => setView('monthly')} variant={view === 'monthly' ? 'default' : 'outline'}>This Month</Button>
        <Button onClick={() => setView('yearly')} variant={view === 'yearly' ? 'default' : 'outline'}>This Year</Button>
      </div>

      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: { legend: { position: 'top' } },
          scales: {
            y: {
              min: 0,
              max: batteryCapacity,
              title: { display: true, text: 'kWh' }
            }
          }
        }}
      />
    </div>
  );
}
