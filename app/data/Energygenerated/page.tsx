// app/data/Energygenerated/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import solarData from '@/app/data/solarData.json';
import { Button } from '@/components/ui/button';
// import { useRouter } from 'next/navigation';
// import { StepBackIcon } from 'lucide-react';    
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function EnergyGenerated() {
  const [view, setView] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  interface ChartData {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
      tension: number;
    }[];
  }

  const [chartData, setChartData] = useState<ChartData | null>(null);

  const efficiency = 0.2;
  const totalArea = 32; // 1.6m² × 20 panels

  useEffect(() => {
    const processData = () => {
      const daily = Array(24).fill(0);
      const monthly = Array(12).fill(0);
      const yearly: { time: string; value: number }[] = [];

      interface SolarDataEntry {
        timestamp: string;
        ALLSKY_SFC_SW_DWN: number;
      }

      solarData.forEach((entry: SolarDataEntry) => {
        const solar_irradiance = entry.ALLSKY_SFC_SW_DWN;
        const date = new Date(entry.timestamp);
        const hour = date.getHours();
        // Removed unused variable 'dayIndex'
        const month = date.getMonth();
        const energy = (solar_irradiance * totalArea * efficiency) / 1000; // kWh

        // Daily (only use one day for now)
        if (date.getDate() === 1 && date.getMonth() === 0) {
          daily[hour] = energy;
        }

        // Monthly (sum for each month)
        monthly[month] += energy;

        // Yearly (raw data)
        yearly.push({
          time: entry.timestamp,
          value: energy,
        });
      });

      // Setup chart data based on view
      if (view === 'daily') {
        setChartData({
          labels: Array.from({ length: 24 }, (_, i) => `${i}:00` as string),
          datasets: [{
            label: 'Energy Generated (kWh)',
            data: daily,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            fill: true,
            tension: 0.3,
          }]
        });
      } else if (view === 'monthly') {
        setChartData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Energy Generated (kWh)',
            data: monthly,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true,
            tension: 0.3,
          }]
        });
      } else if (view === 'yearly') {
        setChartData({
          labels: yearly.map(item => new Date(item.time).toLocaleDateString() as string),
          datasets: [{
            label: 'Hourly Energy (kWh)',
            data: yearly.map(item => item.value),
            borderColor: '#facc15',
            backgroundColor: 'rgba(250, 204, 21, 0.2)',
            fill: true,
            tension: 0.3,
          }]
        });
      }
    };

    processData();
  }, [view]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Energy Generated</h1>

      <div className="flex gap-2">
        <Button onClick={() => setView('daily')} variant={view === 'daily' ? 'default' : 'outline'}>Today</Button>
        <Button onClick={() => setView('monthly')} variant={view === 'monthly' ? 'default' : 'outline'}>Monthly</Button>
        <Button onClick={() => setView('yearly')} variant={view === 'yearly' ? 'default' : 'outline'}>Yearly</Button>
      </div>

      {chartData && (
        <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      )}
    </div>
  );
}
