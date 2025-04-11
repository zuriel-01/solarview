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
//         <h1 className='text-2xl font-bold text-gray-900'>Kitchen</h1>

//   </div>
//   </div>
//   </div>
//   )
// }

// export default page


// 'use client'

// import { useEffect, useState } from 'react';
// import { Line } from 'react-chartjs-2';
// import { Button } from '@/components/ui/button';
// import Link from 'next/link';
// import { StepBackIcon } from 'lucide-react';
// import solarData from '@/app/data/solarData.json';

// import {
//   Chart as ChartJS,
//   LineElement,
//   PointElement,
//   LinearScale,
//   CategoryScale,
//   Tooltip,
//   Legend,
//   ChartDataset,
// } from 'chart.js';

// ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

// // ------------------ Types ------------------

// type SolarEntry = {
//   timestamp: string;
//   solar_irradiance: number;
// };

// type ApplianceKey = 'refrigerator' | 'microwave' | 'bulbs' | 'washingMachine';

// // ------------------ Appliance Config ------------------

// const applianceRatings: Record<ApplianceKey, { power: number; hoursPerDay: number }> = {
//   refrigerator: { power: 150, hoursPerDay: 12 },
//   microwave: { power: 1200, hoursPerDay: 0.5 },
//   bulbs: { power: 20 * 3, hoursPerDay: 8 },
//   washingMachine: { power: 500, hoursPerDay: 2 },
// };

// const totalHours = 24;

// // ------------------ Main Component ------------------

// export default function KitchenEnergyUsage() {
//   const [range, setRange] = useState<'daily' | 'monthly' | 'yearly'>('daily');
//   const [labels, setLabels] = useState<string[]>([]);
//   const [datasets, setDatasets] = useState<ChartDataset<'line'>[]>([]);

//   useEffect(() => {
//     const groupedHours = {
//       daily: 24,
//       monthly: 24 * 30,
//       yearly: 24 * 365,
//     };

//     const count = groupedHours[range];
//     const dataSlice = (solarData as { timestamp: string; ALLSKY_SFC_SW_DWN: number }[])
//       .slice(0, count)
//       .map((entry) => ({
//         timestamp: entry.timestamp,
//         solar_irradiance: entry.ALLSKY_SFC_SW_DWN,
//       }));

//     const timeLabels = dataSlice.map((entry) =>
//       new Date(entry.timestamp).toLocaleString('en-GB', {
//         hour: '2-digit',
//         minute: '2-digit',
//         day: '2-digit',
//         month: 'short',
//       })
//     );

//     const applianceData: Record<ApplianceKey, number[]> = {
//       refrigerator: [],
//       microwave: [],
//       bulbs: [],
//       washingMachine: [],
//     };

//     dataSlice.forEach(() => {
//       (Object.keys(applianceRatings) as ApplianceKey[]).forEach((appliance) => {
//         const { power, hoursPerDay } = applianceRatings[appliance];
//         const usage = (power * (hoursPerDay / totalHours)) / 1000; // kWh
//         applianceData[appliance].push(usage);
//       });
//     });

//     const chartColors = ['#f59e0b', '#ef4444', '#10b981', '#6366f1'];

//     const generatedDatasets: ChartDataset<'line'>[] = (Object.entries(applianceData) as [ApplianceKey, number[]][]).map(
//       ([appliance, data], i) => ({
//         label: appliance,
//         data,
//         borderColor: chartColors[i % chartColors.length],
//         backgroundColor: `${chartColors[i % chartColors.length]}33`,
//         tension: 0.4,
//         fill: false,
//       })
//     );

//     setLabels(timeLabels);
//     setDatasets(generatedDatasets);
//   }, [range]);

//   return (
//     <div className="p-6">
//       {/* Header/Nav */}
//       <div className="bg-gray-50 h-16 mb-6">
//         <div className="mx-auto px-10 py-6 flex justify-between items-center">
//           <Link href="/data/Energyusage">
//             <StepBackIcon size={45} className="text-black p-2" />
//           </Link>
//           <h1 className="text-2xl font-bold text-gray-900">Kitchen Appliance Usage</h1>
//         </div>
//       </div>

//       {/* Line Graph */}
//       <Line
//         data={{ labels, datasets }}
//         options={{
//           responsive: true,
//           plugins: {
//             legend: { position: 'top' },
//           },
//           scales: {
//             y: {
//               title: {
//                 display: true,
//                 text: 'kWh',
//               },
//             },
//           },
//         }}
//       />

//       {/* Range Buttons */}
//       <div className="flex gap-2 mt-4">
//         <Button onClick={() => setRange('daily')} variant={range === 'daily' ? 'default' : 'outline'}>
//           Today
//         </Button>
//         <Button onClick={() => setRange('monthly')} variant={range === 'monthly' ? 'default' : 'outline'}>
//           This Month
//         </Button>
//         <Button onClick={() => setRange('yearly')} variant={range === 'yearly' ? 'default' : 'outline'}>
//           This Year
//         </Button>
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
  refrigerator: { power: 150, hours: 12 },
  microwave: { power: 1200, hours: 0.5 },
  washingMachine: { power: 500, hours: 2 },
  bulbs: { power: 20 * 3, hours: 8 },
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function KitchenEnergyUsage() {
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
        <h2 className="text-xl font-bold">Kitchen Usage - {getDateLabel()}</h2>
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
