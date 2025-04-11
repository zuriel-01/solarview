// import { StepBackIcon } from 'lucide-react'
// import Link from 'next/link'
// import React from 'react'

// const page = () => {
//   return (
//     <div className="bg-gray-50 h-16">
//     <div className="mx-auto px-10">
//       <div className="flex justify-between py-6 ">
//       <Link href="/data/Energyusage">
//               <StepBackIcon size={45} className="text-black p-2" />
//             </Link>
//         <h1 className="text-2xl font-bold text-gray-900">Solar Panel Data</h1>
//         <h1 className='text-2xl font-bold text-gray-900'>Parlour</h1>

//   </div>
//   </div>
//   </div>
//   )
// }

// export default page


// 'use client'

// import { useEffect, useState } from 'react';
// import { Bar } from 'react-chartjs-2';
// import { Button } from '@/components/ui/button';
// import solarData from '@/app/data/solarData.json';
// import { CategoryScale, Chart, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// // Appliance ratings in Watts and usage hours/day
// const applianceRatings = {
//   fan: 75,        // W, 1 fan, 8 hrs/day
//   tv: 100,        // W, 5 hrs/day
//   bulb: 20 * 3    // W, 3 bulbs, 8 hrs/day
// };

// // Usage spread across 24 hours
// const hourlyUsageFactors = {
//   fan: 8 / 24,
//   tv: 5 / 24,
//   bulb: 8 / 24
// };

// const getEnergyUsage = () => {
//   return (
//     (applianceRatings.fan * hourlyUsageFactors.fan +
//       applianceRatings.tv * hourlyUsageFactors.tv +
//       applianceRatings.bulb * hourlyUsageFactors.bulb) / 1000
//   );
// };

// export default function ParlourEnergyUsage() {
//   const [range, setRange] = useState<'daily' | 'monthly' | 'yearly'>('daily');
//   const [labels, setLabels] = useState<string[]>([]);
//   const [values, setValues] = useState<number[]>([]);

//   useEffect(() => {
//     // Removed unused SolarData type
//     const solar = solarData.map((d) => ({
//       time: d.timestamp,
//       value: getEnergyUsage() // Assuming getEnergyUsage() calculates the value for each entry
//     }));

//     const groupBy = {
//       daily: 24,
//       monthly: 24 * 30,
//       yearly: 24 * 365
//     };

//     const count = groupBy[range];
//     const grouped = solar.slice(0, count);
//     setLabels(grouped.map(d => d.time));
//     setValues(grouped.map(d => d.value));
//   }, [range]);

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-semibold mb-4">Parlour Energy Usage</h2>
//       <Bar
//         data={{
//           labels,
//           datasets: [
//             {
//               label: 'Energy Usage (kWh)',
//               data: values,
//               backgroundColor: '#10b981'
//             }
//           ]
//         }}
//         options={{
//           responsive: true,
//           plugins: {
//             legend: { display: true }
//           }
//         }}
//       />
//       <div className="flex gap-2 mt-4">
//         <Button onClick={() => setRange('daily')}>Today</Button>
//         <Button onClick={() => setRange('monthly')}>This Month</Button>
//         <Button onClick={() => setRange('yearly')}>This Year</Button>
//       </div>
//     </div>
//   );
// }


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
  fan: { power: 75, hours: 6 },  // 6 hours/day
  TV: { power: 150, hours: 4 },  // 4 hours/day
  bulbs: { power: 10 * 3, hours: 5 },  // 5 hours/day for 3 bulbs
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ParlourEnergyUsage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [view, setView] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [datasets, setDatasets] = useState<ChartDataset<'line'>[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

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
      return true; // yearly view
    });

    const hourlyUsage = filtered.map((entry) => {
      const hour = new Date(entry.timestamp).getHours();
      const usage: Record<keyof typeof applianceInfo, number> = {} as Record<keyof typeof applianceInfo, number>;
      for (const [appliance, { power, hours }] of Object.entries(applianceInfo)) {
        const active = hours / 24;
        const randomFactor = 0.85 + Math.random() * 0.3; // adds some noise
        usage[appliance as keyof typeof applianceInfo] = (power * active * randomFactor) / 1000; // kWh
      }
      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        ...usage,
      };
    });

    const allLabels = hourlyUsage.map(d => d.time);
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
          plugins: { legend: { position: 'top' } },
          scales: {
            y: { title: { display: true, text: 'kWh' } },
          },
        }}
      />
    </div>
  );
}

