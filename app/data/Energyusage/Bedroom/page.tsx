// import { StepBackIcon } from 'lucide-react'
// import Link from 'next/link'
// import React from 'react'

// const page = () => {
//   return (
//     <div className="bg-gray-50 h-16">
//       <div className="mx-auto px-10">
//         <div className="flex py-6 justify-between">
//         <Link href="/data/Energyusage">
//                 <StepBackIcon size={45} className="text-black p-2" />
//               </Link>
//           <h1 className="text-2xl font-bold text-gray-900">Solar Panel Data</h1>
//           <h1 className='text-2xl font-bold text-gray-900'>Bedroom</h1>

//     </div>
//     </div>
//     </div>
     
    
//   )
// }

// export default page


// 'use client'

// import { useEffect, useState } from 'react';
// import { Bar } from 'react-chartjs-2';
// import { Button } from '@/components/ui/button';
// import solarData from '@/app/data/solarData.json';
// import { CategoryScale, Chart, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
// import Link from 'next/link';
// import { StepBackIcon } from 'lucide-react';

// Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// // Appliance ratings in Watts and usage time in hours/day
// const applianceRatings = {
//   ac: 1000,       // W, used 4 hrs/day
//   bulb: 20 * 4,   // W, 4 bulbs, 8 hrs/day
//   laptop: 50      // W, 6 hrs/day
// };

// // Usage spread across 24 hours
// const hourlyUsageFactors = {
//   ac: 4 / 24,
//   bulb: 8 / 24,
//   laptop: 6 / 24
// };

// const getEnergyUsage = () => {
//   return (
//     (applianceRatings.ac * hourlyUsageFactors.ac +
//       applianceRatings.bulb * hourlyUsageFactors.bulb +
//       applianceRatings.laptop * hourlyUsageFactors.laptop) / 1000 // convert to kWh
//   );
// };

// export default function BedroomEnergyUsage() {
//   const [range, setRange] = useState<'daily' | 'monthly' | 'yearly'>('daily');
//   const [labels, setLabels] = useState<string[]>([]);
//   const [values, setValues] = useState<number[]>([]);

//   useEffect(() => {
//     interface SolarData {
//       timestamp?: string; // Make timestamp optional to handle missing fields
//     }

//     const solar = (solarData as SolarData[]).map((d, i) => ({
//       time: d.timestamp || `Unknown-${i}`, // Provide a fallback value if timestamp is missing
//       value: getEnergyUsage()
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

//     // <div className="bg-gray-50 h-16">
//     //   <div className="mx-auto px-10">
//     //     <div className="flex py-6 justify-between">
//     //     <Link href="/data/Energyusage">
//     //             <StepBackIcon size={45} className="text-black p-2" />
//     //           </Link>
//     //       <h1 className="text-2xl font-bold text-gray-900">Solar Panel Data</h1>
//     //       <h1 className='text-2xl font-bold text-gray-900'>Bedroom</h1>

//     // </div>
//     // </div>
//     // </div>
//     <div className="bg-gray-50 h-16">
//       <div className="mx-auto px-10">
//       <div className=" py-6 flex justify-between">
//        <Link href="/data/Energyusage">
//                  <StepBackIcon size={45} className="text-black p-2" />
//                </Link>
//            <h1 className="text-2xl font-bold text-gray-900">Solar Panel Data</h1>
//            <h1 className='text-2xl font-bold text-gray-900'>Bedroom Usage</h1>
    
//            </div>
//     </div>
  
//     <Bar
//         data={{
//           labels,
//           datasets: [
//             {
//               label: 'Energy Usage (kWh)',
//               data: values,
//               backgroundColor: '#3b82f6'
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
//       </div>

   
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
  AC: { power: 1500, hours: 5 },  // 5 hours/day
  bulbs: { power: 10 * 4, hours: 6 },  // 6 hours/day for 4 bulbs
  laptop: { power: 60, hours: 8 },  // 8 hours/day
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function BedroomEnergyUsage() {
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
        <h2 className="text-xl font-bold">Bedroom Usage - {getDateLabel()}</h2>
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
